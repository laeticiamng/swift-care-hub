import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  AlertTriangle,
  Clock,
  FileText,
  FlaskConical,
  History,
  Microscope,
  Pill,
  Stethoscope,
  ExternalLink,
  Activity,
  Syringe,
} from 'lucide-react';

interface TimelineItem {
  id: string;
  patient_id: string;
  item_type: string;
  content: string;
  source_date?: string | null;
  source_document?: string | null;
  source_author?: string | null;
  created_at?: string;
}

interface PatientTimelineProps {
  items: TimelineItem[];
  showEssentialOnly?: boolean;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  allergie: <AlertTriangle className="h-4 w-4 text-medical-critical" />,
  crh: <FileText className="h-4 w-4 text-primary" />,
  resultat: <FlaskConical className="h-4 w-4 text-medical-info" />,
  diagnostic: <Microscope className="h-4 w-4 text-primary" />,
  traitement: <Pill className="h-4 w-4 text-medical-warning" />,
  antecedent: <History className="h-4 w-4 text-muted-foreground" />,
  prescription: <Syringe className="h-4 w-4 text-medical-info" />,
  acte: <Activity className="h-4 w-4 text-medical-success" />,
  consultation: <Stethoscope className="h-4 w-4 text-primary" />,
};

const TYPE_LABELS: Record<string, string> = {
  allergie: 'Allergie',
  crh: 'CRH',
  resultat: 'Resultat',
  diagnostic: 'Diagnostic',
  traitement: 'Traitement',
  antecedent: 'Antecedent',
  prescription: 'Prescription',
  acte: 'Acte',
  consultation: 'Consultation',
};

const ESSENTIAL_TYPES = ['allergie', 'crh', 'diagnostic'];

export function PatientTimeline({ items, showEssentialOnly = false }: PatientTimelineProps) {
  const filteredItems = showEssentialOnly
    ? items.filter(item => ESSENTIAL_TYPES.includes(item.item_type))
    : items;

  // Group allergies and antecedents separately
  const allergies = filteredItems.filter(item => item.item_type === 'allergie');
  const antecedents = filteredItems.filter(item => item.item_type === 'antecedent');
  const chronologicalItems = filteredItems.filter(
    item => item.item_type !== 'allergie' && item.item_type !== 'antecedent'
  );

  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">Aucun element dans la timeline</p>;
  }

  return (
    <div className="space-y-3">
      {/* Allergies block */}
      {allergies.length > 0 && (
        <div className="p-3 rounded-lg border border-medical-critical/30 bg-medical-critical/5">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-medical-critical" />
            <span className="text-sm font-semibold text-medical-critical">Allergies ({allergies.length})</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {allergies.map(a => (
              <Badge key={a.id} variant="outline" className="border-medical-critical/30 text-medical-critical text-xs">
                {a.content.replace('Allergie : ', '')}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Antecedents block */}
      {antecedents.length > 0 && (
        <div className="p-3 rounded-lg border bg-muted/30">
          <div className="flex items-center gap-2 mb-2">
            <History className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold">Antecedents ({antecedents.length})</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {antecedents.map(a => (
              <Badge key={a.id} variant="secondary" className="text-xs">{a.content}</Badge>
            ))}
          </div>
          {antecedents[0]?.source_document && (
            <p className="text-xs text-muted-foreground mt-2">
              Source : {antecedents[0].source_document}
              {antecedents[0].source_author && ` — ${antecedents[0].source_author}`}
            </p>
          )}
        </div>
      )}

      {/* Chronological items */}
      {chronologicalItems.map((item, idx) => (
        <div
          key={item.id}
          className={cn(
            'flex gap-3 p-3 rounded-lg border animate-in fade-in slide-in-from-bottom-2',
            item.item_type === 'allergie' && 'border-medical-critical/30 bg-medical-critical/5',
          )}
          style={{ animationDelay: `${idx * 30}ms`, animationFillMode: 'both' }}
        >
          <div className="mt-0.5">
            {ICON_MAP[item.item_type] || <Clock className="h-4 w-4 text-muted-foreground" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs">
                {TYPE_LABELS[item.item_type] || item.item_type}
              </Badge>
              {item.source_date && (
                <span className="text-xs text-muted-foreground">{item.source_date}</span>
              )}
              {item.source_author && (
                <span className="text-xs text-muted-foreground">— {item.source_author}</span>
              )}
            </div>
            <p className="text-sm mt-1">{item.content}</p>
            {item.source_document && (
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-muted-foreground">
                  Source : {item.source_document}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs px-2 opacity-40 cursor-not-allowed"
                  disabled
                  title="Fonctionnalite demo"
                >
                  <ExternalLink className="h-3 w-3 mr-1" /> Source
                </Button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
