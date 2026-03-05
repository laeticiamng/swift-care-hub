import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, Copy, Check, RefreshCw, Pill, FileText, Brain } from 'lucide-react';
import { useAIClinical } from '@/hooks/useAIClinical';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

type AIMode = 'synthesis' | 'crh' | 'prescription_suggest';

interface AISynthesisPanelProps {
  patientData: any;
  className?: string;
  onCRHGenerated?: (html: string) => void;
}

const MODE_CONFIG: Record<AIMode, { label: string; icon: typeof Brain; buttonLabel: string; description: string }> = {
  synthesis: { label: 'Synthèse', icon: Brain, buttonLabel: 'Générer la synthèse IA', description: 'Résumé clinique structuré du dossier' },
  crh: { label: 'CRH', icon: FileText, buttonLabel: 'Pré-remplir le CRH', description: 'Compte-rendu de passage aux urgences' },
  prescription_suggest: { label: 'Aide Rx', icon: Pill, buttonLabel: 'Suggérer des prescriptions', description: 'Suggestions adaptées au contexte clinique' },
};

export function AISynthesisPanel({ patientData, className, onCRHGenerated }: AISynthesisPanelProps) {
  const { isLoading, result, error, generateSynthesis, generateCRH, suggestPrescriptions } = useAIClinical();
  const [mode, setMode] = useState<AIMode>('synthesis');
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    let fullText = '';
    if (mode === 'synthesis') {
      fullText = await generateSynthesis(patientData);
    } else if (mode === 'crh') {
      fullText = await generateCRH(patientData);
      if (fullText && onCRHGenerated) onCRHGenerated(fullText);
    } else {
      fullText = await suggestPrescriptions(patientData);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    toast.success('Copié dans le presse-papier');
    setTimeout(() => setCopied(false), 2000);
  };

  const config = MODE_CONFIG[mode];

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            Assistant IA clinique
          </CardTitle>
          <Badge variant="outline" className="text-xs border-amber-500/30 text-amber-600 dark:text-amber-400">
            Gemini · IA Générative
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Mode selector */}
        <div className="flex gap-1.5 p-1 rounded-lg bg-muted/50">
          {(Object.keys(MODE_CONFIG) as AIMode[]).map(m => {
            const Icon = MODE_CONFIG[m].icon;
            return (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-all ${
                  mode === m
                    ? 'bg-card shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {MODE_CONFIG[m].label}
              </button>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground">{config.description}</p>

        <Button
          onClick={handleGenerate}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Génération en cours...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              {config.buttonLabel}
            </>
          )}
        </Button>

        {error && (
          <div className="p-3 rounded-lg border border-destructive/30 bg-destructive/5 text-destructive text-sm">
            {error}
          </div>
        )}

        {result && (
          <div className="relative">
            <div className="absolute top-2 right-2 flex gap-1 z-10">
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={handleCopy}>
                {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
              </Button>
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={handleGenerate} disabled={isLoading}>
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            </div>
            {mode === 'crh' ? (
              <div
                className="p-4 rounded-lg border bg-card text-sm prose prose-sm max-w-none dark:prose-invert max-h-96 overflow-y-auto"
                dangerouslySetInnerHTML={{ __html: result }}
              />
            ) : (
              <div className="p-4 rounded-lg border bg-card text-sm prose prose-sm max-w-none dark:prose-invert max-h-96 overflow-y-auto">
                <ReactMarkdown>{result}</ReactMarkdown>
              </div>
            )}
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="h-3 w-3 text-amber-500" />
              <span>Généré par IA — À valider par le médecin</span>
              {mode === 'crh' && onCRHGenerated && (
                <Button
                  size="sm"
                  variant="outline"
                  className="ml-auto h-6 text-[10px] px-2"
                  onClick={() => onCRHGenerated(result)}
                >
                  <FileText className="h-3 w-3 mr-1" />
                  Ouvrir dans le CRH
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
