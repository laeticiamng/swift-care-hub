import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BookOpen, Search, Zap, ChevronRight, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { PRESCRIPTION_PACKS, PRESCRIPTION_TYPE_ICONS, type PrescriptionPack } from '@/lib/prescription-types';

// Extended protocols beyond PRESCRIPTION_PACKS
const CLINICAL_PROTOCOLS: Record<string, {
  pack: PrescriptionPack;
  category: 'cardiologie' | 'traumatologie' | 'infectiologie' | 'pneumologie' | 'neurologie' | 'toxicologie' | 'general';
  severity: 'critical' | 'urgent' | 'standard';
  description: string;
  criteria: string[];
}> = {
  'Douleur thoracique': {
    pack: PRESCRIPTION_PACKS['Douleur thoracique'],
    category: 'cardiologie',
    severity: 'critical',
    description: 'Prise en charge initiale d\'une douleur thoracique suspecte de SCA',
    criteria: ['Douleur thoracique constrictive', 'Facteurs de risque CV', 'Modifications ECG'],
  },
  'Dyspnee': {
    pack: PRESCRIPTION_PACKS['Dyspnee'],
    category: 'pneumologie',
    severity: 'urgent',
    description: 'Prise en charge d\'une dyspnée aiguë / crise d\'asthme',
    criteria: ['SpO2 < 94%', 'Sibilants', 'Tirage', 'Antécédent asthme/BPCO'],
  },
  'AEG / Fievre': {
    pack: PRESCRIPTION_PACKS['AEG / Fievre'],
    category: 'infectiologie',
    severity: 'urgent',
    description: 'Bilan septique et prise en charge initiale fièvre / sepsis',
    criteria: ['T° > 38.5°C', 'Frissons', 'qSOFA ≥ 2', 'Terrain immunodéprimé'],
  },
  'Traumatisme membre': {
    pack: PRESCRIPTION_PACKS['Traumatisme membre'],
    category: 'traumatologie',
    severity: 'standard',
    description: 'Prise en charge traumatisme de membre simple',
    criteria: ['Mécanisme traumatique', 'Douleur localisée', 'Impotence fonctionnelle'],
  },
  'Douleur abdominale': {
    pack: PRESCRIPTION_PACKS['Douleur abdominale'],
    category: 'general',
    severity: 'urgent',
    description: 'Bilan et analgésie pour colique néphrétique / douleur abdominale aiguë',
    criteria: ['Douleur abdominale intense', 'EVA > 6', 'Défense / contracture'],
  },
  'Intoxication': {
    pack: PRESCRIPTION_PACKS['Intoxication'],
    category: 'toxicologie',
    severity: 'critical',
    description: 'Prise en charge d\'une intoxication médicamenteuse aiguë',
    criteria: ['Ingestion volontaire', 'Troubles de conscience', 'Anomalies ECG'],
  },
  'Malaise / syncope': {
    pack: PRESCRIPTION_PACKS['Malaise / syncope'],
    category: 'cardiologie',
    severity: 'urgent',
    description: 'Bilan étiologique d\'une syncope / malaise avec perte de connaissance',
    criteria: ['Perte de connaissance', 'Prodromes', 'Facteurs de risque cardiaque'],
  },
};

const CATEGORY_COLORS: Record<string, string> = {
  cardiologie: 'bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400',
  traumatologie: 'bg-orange-100 text-orange-800 dark:bg-orange-950/30 dark:text-orange-400',
  infectiologie: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-400',
  pneumologie: 'bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400',
  neurologie: 'bg-purple-100 text-purple-800 dark:bg-purple-950/30 dark:text-purple-400',
  toxicologie: 'bg-pink-100 text-pink-800 dark:bg-pink-950/30 dark:text-pink-400',
  general: 'bg-gray-100 text-gray-800 dark:bg-gray-950/30 dark:text-gray-400',
};

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'border-medical-critical/50 bg-medical-critical/5',
  urgent: 'border-orange-400/50 bg-orange-50 dark:bg-orange-950/10',
  standard: 'border-border',
};

interface ProtocolLibraryProps {
  onApplyProtocol: (packKey: string) => void;
  motifSfmu?: string | null;
}

export function ProtocolLibrary({ onApplyProtocol, motifSfmu }: ProtocolLibraryProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedProtocol, setSelectedProtocol] = useState<string | null>(null);

  const filteredProtocols = Object.entries(CLINICAL_PROTOCOLS).filter(([key, proto]) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return key.toLowerCase().includes(q) || proto.description.toLowerCase().includes(q) || proto.category.includes(q);
  });

  // Auto-suggest based on motif
  const suggestedKeys = motifSfmu
    ? Object.keys(CLINICAL_PROTOCOLS).filter(key => {
        const motifLower = motifSfmu.toLowerCase();
        return key.toLowerCase().split(/[\s\/]+/).some(word => motifLower.includes(word));
      })
    : [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <BookOpen className="h-4 w-4" />
          Protocoles
          {suggestedKeys.length > 0 && (
            <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center bg-amber-500 text-white text-[10px]">
              {suggestedKeys.length}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Bibliothèque de protocoles
          </DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un protocole..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {suggestedKeys.length > 0 && !search && (
          <div className="p-3 rounded-lg border border-amber-400/30 bg-amber-50 dark:bg-amber-950/10">
            <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5" />
              Protocoles suggérés pour "{motifSfmu}"
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestedKeys.map(key => (
                <Button
                  key={key}
                  size="sm"
                  className="bg-amber-500 hover:bg-amber-600 text-white text-xs"
                  onClick={() => { onApplyProtocol(key); setOpen(false); }}
                >
                  <Zap className="h-3 w-3 mr-1" /> Appliquer "{key}"
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2">
          {filteredProtocols.map(([key, proto]) => (
            <div
              key={key}
              className={`rounded-lg border p-3 cursor-pointer transition-all hover:shadow-sm ${SEVERITY_COLORS[proto.severity]} ${selectedProtocol === key ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setSelectedProtocol(selectedProtocol === key ? null : key)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{key}</span>
                  <Badge className={`text-[10px] ${CATEGORY_COLORS[proto.category]}`}>
                    {proto.category}
                  </Badge>
                  {proto.severity === 'critical' && <AlertTriangle className="h-3.5 w-3.5 text-medical-critical" />}
                </div>
                <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${selectedProtocol === key ? 'rotate-90' : ''}`} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">{proto.description}</p>

              {selectedProtocol === key && (
                <div className="mt-3 space-y-3 animate-in fade-in duration-200">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">Critères d'application</p>
                    <div className="flex flex-wrap gap-1">
                      {proto.criteria.map((c, i) => (
                        <Badge key={i} variant="outline" className="text-[10px]">
                          <CheckCircle2 className="h-2.5 w-2.5 mr-1" /> {c}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">
                      Contenu du pack ({proto.pack.items.length} prescriptions)
                    </p>
                    <div className="grid grid-cols-1 gap-1">
                      {proto.pack.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs px-2 py-1 rounded bg-accent/50">
                          <span>{PRESCRIPTION_TYPE_ICONS[item.type]}</span>
                          <span className="font-medium">{item.medication_name}</span>
                          {item.dosage && <span className="text-muted-foreground">{item.dosage}</span>}
                          {item.route && <span className="text-muted-foreground">{item.route}</span>}
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      onApplyProtocol(key);
                      setOpen(false);
                    }}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Appliquer le protocole "{proto.pack.label}"
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
