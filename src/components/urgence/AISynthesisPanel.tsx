import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, Copy, Check, RefreshCw } from 'lucide-react';
import { useAIClinical } from '@/hooks/useAIClinical';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

interface AISynthesisPanelProps {
  patientData: any;
  className?: string;
}

export function AISynthesisPanel({ patientData, className }: AISynthesisPanelProps) {
  const { isLoading, result, error, generateSynthesis, generateCRH } = useAIClinical();
  const [mode, setMode] = useState<'synthesis' | 'crh'>('synthesis');
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (mode === 'synthesis') {
      await generateSynthesis(patientData);
    } else {
      await generateCRH(patientData);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    toast.success('Copié dans le presse-papier');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            Assistant IA clinique
          </CardTitle>
          <Badge variant="outline" className="text-xs border-amber-500/30 text-amber-600 dark:text-amber-400">
            IA Générative
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={mode === 'synthesis' ? 'default' : 'outline'}
            onClick={() => setMode('synthesis')}
            className="text-xs"
          >
            Synthèse dossier
          </Button>
          <Button
            size="sm"
            variant={mode === 'crh' ? 'default' : 'outline'}
            onClick={() => setMode('crh')}
            className="text-xs"
          >
            Pré-remplir CRH
          </Button>
        </div>

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
              {mode === 'synthesis' ? 'Générer la synthèse IA' : 'Générer le CRH par IA'}
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
              Généré par IA — À valider par le médecin
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
