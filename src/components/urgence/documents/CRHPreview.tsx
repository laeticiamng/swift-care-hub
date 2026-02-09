import { useState } from 'react';
import { FileText, Send, PenLine, Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import type { DocumentStatus } from '@/lib/interop/canonical-model';

interface CRHPreviewProps {
  htmlContent: string;
  status: DocumentStatus;
  onSign?: () => void;
  onSendMSSante?: () => void;
  onDownload?: () => void;
}

export function CRHPreview({ htmlContent, status, onSign, onSendMSSante, onDownload }: CRHPreviewProps) {
  const [viewMode, setViewMode] = useState<'preview' | 'html'>('preview');
  const { toast } = useToast();

  const statusConfig: Record<DocumentStatus, { label: string; color: string }> = {
    draft: { label: 'Brouillon', color: 'bg-yellow-100 text-yellow-800' },
    signed: { label: 'Signe', color: 'bg-green-100 text-green-800' },
    sent: { label: 'Envoye MSSante', color: 'bg-blue-100 text-blue-800' },
    archived: { label: 'Archive', color: 'bg-gray-100 text-gray-800' },
  };

  const currentStatus = statusConfig[status] || statusConfig.draft;

  const handleDownload = () => {
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CRH-urgences-${new Date().toISOString().slice(0, 10)}.html`;
    a.click();
    URL.revokeObjectURL(url);
    onDownload?.();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-slate-50 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-blue-600" />
          <div>
            <h3 className="font-semibold text-sm">Compte-rendu de passage aux urgences</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge className={`text-xs ${currentStatus.color}`}>{currentStatus.label}</Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant={viewMode === 'preview' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('preview')}
          >
            <Eye className="h-3.5 w-3.5 mr-1" />
            Apercu
          </Button>
          <Button
            variant={viewMode === 'html' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('html')}
          >
            HTML
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-white">
        {viewMode === 'preview' ? (
          <iframe
            srcDoc={htmlContent}
            className="w-full h-full border-0"
            title="CRH Preview"
            sandbox="allow-same-origin"
          />
        ) : (
          <pre className="text-xs font-mono p-4 bg-slate-950 text-slate-200 h-full overflow-auto whitespace-pre-wrap">
            {htmlContent}
          </pre>
        )}
      </div>

      {/* Action bar */}
      <div className="flex items-center justify-between px-4 py-3 border-t bg-slate-50 dark:bg-slate-900">
        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download className="h-3.5 w-3.5 mr-1" />
          Telecharger
        </Button>

        <div className="flex gap-2">
          {status === 'draft' && onSign && (
            <Button size="sm" onClick={onSign} className="bg-green-600 hover:bg-green-700">
              <PenLine className="h-3.5 w-3.5 mr-1" />
              Signer
            </Button>
          )}
          {(status === 'signed' || status === 'draft') && onSendMSSante && (
            <Button
              size="sm"
              onClick={() => {
                onSendMSSante();
                toast({
                  title: 'Document envoye',
                  description: 'Le CRH a ete envoye via MSSante au medecin traitant.',
                });
              }}
              variant={status === 'signed' ? 'default' : 'outline'}
              disabled={status === 'draft'}
            >
              <Send className="h-3.5 w-3.5 mr-1" />
              Envoyer MSSante
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
