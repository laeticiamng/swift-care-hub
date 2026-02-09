import { useState } from 'react';
import { Copy, Check, Download, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { FHIRBundle } from '@/lib/interop/fhir-adapter';
import { countBundleResources } from '@/lib/interop/fhir-adapter';

interface FHIRViewerProps {
  bundle: FHIRBundle;
  title?: string;
}

// Syntax highlighting for JSON
function highlightJSON(json: string): string {
  return json
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"(\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?/g, (match) => {
      let cls = 'text-emerald-600 dark:text-emerald-400'; // string
      if (match.endsWith(':')) {
        cls = 'text-blue-600 dark:text-blue-400 font-medium'; // key
        // Remove trailing colon for styling, add it back
        return `<span class="${cls}">${match.slice(0, -1)}</span>:`;
      }
      if (/^"(Patient|Encounter|Observation|MedicationRequest|ServiceRequest|MedicationAdministration|Procedure|DiagnosticReport|AllergyIntolerance|Condition|Composition|Bundle)"/.test(match)) {
        cls = 'text-violet-600 dark:text-violet-400 font-semibold'; // resource types
      }
      return `<span class="${cls}">${match}</span>`;
    })
    .replace(/\b(true|false)\b/g, '<span class="text-amber-600 dark:text-amber-400">$1</span>')
    .replace(/\b(null)\b/g, '<span class="text-gray-400">$1</span>')
    .replace(/\b(-?\d+\.?\d*([eE][+-]?\d+)?)\b/g, '<span class="text-orange-600 dark:text-orange-400">$1</span>');
}

export function FHIRViewer({ bundle, title }: FHIRViewerProps) {
  const [copied, setCopied] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<number, boolean>>({});

  const jsonString = JSON.stringify(bundle, null, 2);
  const resourceCounts = countBundleResources(bundle);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/fhir+json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `urgenceos-bundle-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleEntry = (index: number) => {
    setCollapsed(prev => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-slate-50 dark:bg-slate-900">
        <div>
          <h3 className="font-semibold text-sm">{title || 'FHIR R4 Bundle'}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {bundle.entry.length} ressources — {bundle.type} bundle
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? <Check className="h-3.5 w-3.5 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
            {copied ? 'Copie' : 'Copier'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-3.5 w-3.5 mr-1" />
            JSON
          </Button>
        </div>
      </div>

      {/* Resource summary badges */}
      <div className="flex flex-wrap gap-1.5 px-4 py-2.5 border-b bg-white dark:bg-slate-950">
        {Object.entries(resourceCounts).map(([type, count]) => (
          <Badge key={type} variant="secondary" className="text-xs font-mono">
            {type}: {count}
          </Badge>
        ))}
      </div>

      {/* Entry list (collapsible) */}
      <div className="flex-1 overflow-auto">
        {bundle.entry.map((entry, index) => {
          const isCollapsed = collapsed[index] !== false; // default collapsed
          const resourceJson = JSON.stringify(entry.resource, null, 2);

          return (
            <div key={index} className="border-b">
              <button
                onClick={() => toggleEntry(index)}
                className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
              >
                {isCollapsed
                  ? <ChevronRight className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                }
                <Badge variant="outline" className="text-xs font-mono flex-shrink-0">
                  {entry.resource.resourceType}
                </Badge>
                <span className="text-xs text-muted-foreground truncate">
                  {entry.resource.id ? `id: ${entry.resource.id}` : entry.fullUrl || ''}
                </span>
              </button>
              {!isCollapsed && (
                <div className="px-4 pb-3">
                  <pre
                    className="text-xs font-mono bg-slate-950 text-slate-200 rounded-lg p-4 overflow-x-auto leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: highlightJSON(resourceJson) }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t bg-slate-50 dark:bg-slate-900 text-xs text-muted-foreground">
        FHIR R4 (4.0.1) — Genere par UrgenceOS le {new Date().toLocaleString('fr-FR')}
        — {(jsonString.length / 1024).toFixed(1)} Ko
      </div>
    </div>
  );
}
