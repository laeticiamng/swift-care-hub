import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

const AI_CLINICAL_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-clinical`;

export function useAIClinical() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState<string | null>(null);

  const streamRequest = useCallback(async (action: string, patientData: any) => {
    setIsLoading(true);
    setResult('');
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        setError('Vous devez être connecté pour utiliser l\'IA clinique');
        setIsLoading(false);
        return '';
      }

      const resp = await fetch(AI_CLINICAL_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action, patientData }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: 'Erreur réseau' }));
        setError(err.error || `Erreur ${resp.status}`);
        setIsLoading(false);
        return '';
      }

      if (!resp.body) {
        setError('Pas de réponse du service IA');
        setIsLoading(false);
        return '';
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let fullText = '';
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') { streamDone = true; break; }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullText += content;
              setResult(fullText);
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split('\n')) {
          if (!raw) continue;
          if (raw.endsWith('\r')) raw = raw.slice(0, -1);
          if (raw.startsWith(':') || raw.trim() === '') continue;
          if (!raw.startsWith('data: ')) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) { fullText += content; setResult(fullText); }
          } catch { /* ignore */ }
        }
      }

      setIsLoading(false);
      return fullText;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue');
      setIsLoading(false);
      return '';
    }
  }, []);

  const generateSynthesis = useCallback((patientData: any) => streamRequest('synthesis', patientData), [streamRequest]);
  const generateCRH = useCallback((patientData: any) => streamRequest('crh', patientData), [streamRequest]);
  const suggestPrescriptions = useCallback((patientData: any) => streamRequest('prescription_suggest', patientData), [streamRequest]);

  return { isLoading, result, error, generateSynthesis, generateCRH, suggestPrescriptions, setResult };
}
