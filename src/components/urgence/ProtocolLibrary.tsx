import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BookOpen, Search, Zap, ChevronRight, AlertTriangle, CheckCircle2, Clock, Shield } from 'lucide-react';
import { PRESCRIPTION_PACKS, PRESCRIPTION_TYPE_ICONS, type PrescriptionPack } from '@/lib/prescription-types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Extended protocols beyond PRESCRIPTION_PACKS
const CLINICAL_PROTOCOLS: Record<string, {
  pack: PrescriptionPack;
  category: 'cardiologie' | 'traumatologie' | 'infectiologie' | 'pneumologie' | 'neurologie' | 'toxicologie' | 'general' | 'allergo' | 'rea';
  severity: 'critical' | 'urgent' | 'standard';
  description: string;
  criteria: string[];
  timeWindow?: string;
  guidelines?: string;
}> = {
  'Douleur thoracique': {
    pack: PRESCRIPTION_PACKS['Douleur thoracique'],
    category: 'cardiologie',
    severity: 'critical',
    description: 'Prise en charge initiale d\'une douleur thoracique suspecte de SCA',
    criteria: ['Douleur thoracique constrictive', 'Facteurs de risque CV', 'Modifications ECG'],
    timeWindow: 'ECG < 10 min, Troponine < 60 min',
    guidelines: 'ESC 2023 — SCA',
  },
  'AVC / Deficit neurologique': {
    pack: PRESCRIPTION_PACKS['AVC / Deficit neurologique'],
    category: 'neurologie',
    severity: 'critical',
    description: 'Protocole AVC aigu — évaluation thrombolyse / thrombectomie',
    criteria: ['Déficit neurologique focal', 'Début < 4h30', 'NIHSS ≥ 4', 'Glycémie > 0.5 g/L'],
    timeWindow: 'Scanner < 25 min, Thrombolyse < 4h30',
    guidelines: 'HAS 2024 — AVC aigu',
  },
  'Sepsis severe / Choc septique': {
    pack: PRESCRIPTION_PACKS['Sepsis severe / Choc septique'],
    category: 'infectiologie',
    severity: 'critical',
    description: 'Sepsis sévère / choc septique — Surviving Sepsis Campaign',
    criteria: ['qSOFA ≥ 2', 'Lactates > 2 mmol/L', 'Hypotension (PAS < 90)', 'Marbrures', 'Oligurie'],
    timeWindow: 'ATB < 1h, Remplissage 30mL/kg < 3h',
    guidelines: 'Surviving Sepsis 2021',
  },
  'Polytraumatisme': {
    pack: PRESCRIPTION_PACKS['Polytraumatisme'],
    category: 'traumatologie',
    severity: 'critical',
    description: 'Prise en charge polytraumatisé grave (ISS > 15)',
    criteria: ['Cinétique violente', 'Détresse hémodynamique', 'Score ISS > 15', 'Éjection véhicule', 'Défenestration > 6m'],
    timeWindow: 'Body scanner < 30 min, Exacyl < H3',
    guidelines: 'SFAR 2019 — Trauma grave',
  },
  'Anaphylaxie': {
    pack: PRESCRIPTION_PACKS['Anaphylaxie'],
    category: 'allergo',
    severity: 'critical',
    description: 'Réaction anaphylactique — adrénaline en première intention',
    criteria: ['Urticaire généralisée', 'Œdème lèvres/langue', 'Bronchospasme', 'Hypotension', 'Exposition allergène connu'],
    timeWindow: 'Adrénaline IM immédiate',
    guidelines: 'EAACI 2021 — Anaphylaxie',
  },
  'Etat de mal epileptique': {
    pack: PRESCRIPTION_PACKS['Etat de mal epileptique'],
    category: 'neurologie',
    severity: 'critical',
    description: 'État de mal épileptique — traitement par paliers',
    criteria: ['Crise > 5 min', 'Crises subintrantes', 'Non-reprise conscience', 'Post-critique prolongé'],
    timeWindow: 'BZD < 5 min, Anti-épileptique 2ème ligne < 20 min',
    guidelines: 'SFMU 2018 — EME',
  },
  'Dyspnee': {
    pack: PRESCRIPTION_PACKS['Dyspnee'],
    category: 'pneumologie',
    severity: 'urgent',
    description: 'Prise en charge d\'une dyspnée aiguë / crise d\'asthme',
    criteria: ['SpO2 < 94%', 'Sibilants', 'Tirage', 'Antécédent asthme/BPCO'],
    guidelines: 'GINA 2023',
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
    timeWindow: 'NAC < H8 post-ingestion paracétamol',
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
  cardiologie: 'bg-medical-critical/10 text-medical-critical',
  traumatologie: 'bg-medical-warning/10 text-medical-warning',
  infectiologie: 'bg-medical-warning/15 text-medical-warning',
  pneumologie: 'bg-medical-info/10 text-medical-info',
  neurologie: 'bg-purple-100 text-purple-800 dark:bg-purple-950/30 dark:text-purple-400',
  toxicologie: 'bg-pink-100 text-pink-800 dark:bg-pink-950/30 dark:text-pink-400',
  allergo: 'bg-medical-critical/10 text-medical-critical',
  rea: 'bg-medical-critical/15 text-medical-critical',
  general: 'bg-muted text-muted-foreground',
};

const SEVERITY_CONFIG: Record<string, { label: string; className: string; icon: typeof AlertTriangle }> = {
  critical: { label: 'Critique', className: 'border-medical-critical/50 bg-medical-critical/5', icon: AlertTriangle },
  urgent: { label: 'Urgent', className: 'border-medical-warning/50 bg-medical-warning/5', icon: Clock },
  standard: { label: 'Standard', className: 'border-border', icon: Shield },
};

interface ProtocolLibraryProps {
  onApplyProtocol: (packKey: string) => void;
  motifSfmu?: string | null;
}

export function ProtocolLibrary({ onApplyProtocol, motifSfmu }: ProtocolLibraryProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedProtocol, setSelectedProtocol] = useState<string | null>(null);
  const [appliedProtocols, setAppliedProtocols] = useState<Set<string>>(new Set());

  const filteredProtocols = Object.entries(CLINICAL_PROTOCOLS).filter(([key, proto]) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return key.toLowerCase().includes(q) || proto.description.toLowerCase().includes(q) || proto.category.includes(q) || proto.criteria.some(c => c.toLowerCase().includes(q));
  });

  // Sort: critical first, then urgent, then standard
  const sortedProtocols = filteredProtocols.sort(([, a], [, b]) => {
    const order = { critical: 0, urgent: 1, standard: 2 };
    return order[a.severity] - order[b.severity];
  });

  // Auto-suggest based on motif
  const suggestedKeys = motifSfmu
    ? Object.keys(CLINICAL_PROTOCOLS).filter(key => {
        const motifLower = motifSfmu.toLowerCase();
        const MOTIF_MAP: Record<string, string[]> = {
          'Douleur thoracique': ['douleur thoracique', 'dt', 'precordialgie', 'angor', 'infarctus', 'sca'],
          'AVC / Deficit neurologique': ['avc', 'deficit', 'hemiplegie', 'aphasie', 'neurologique', 'paralysie'],
          'Sepsis severe / Choc septique': ['sepsis', 'choc septique', 'bacteriemie'],
          'Polytraumatisme': ['polytrauma', 'polytraumatisme', 'avp grave', 'defenestration', 'trauma grave'],
          'Anaphylaxie': ['anaphylaxie', 'choc anaphylactique', 'allergie severe', 'oedeme quincke'],
          'Etat de mal epileptique': ['epilep', 'convulsion', 'eme', 'etat de mal', 'crise convulsive'],
          'Dyspnee': ['dyspnee', 'asthme', 'bronchospasme', 'detresse respiratoire'],
          'AEG / Fievre': ['fievre', 'aeg', 'infection', 'alteration etat general'],
          'Traumatisme membre': ['traumatisme', 'fracture', 'entorse', 'luxation'],
          'Douleur abdominale': ['douleur abdominale', 'abdo', 'colique', 'nephretique'],
          'Intoxication': ['intoxication', 'intox', 'surdosage', 'ingestion'],
          'Malaise / syncope': ['malaise', 'syncope', 'perte connaissance', 'lipothymie'],
        };
        const keywords = MOTIF_MAP[key] || key.toLowerCase().split(/[\s\/]+/);
        return keywords.some(kw => motifLower.includes(kw));
      })
    : [];

  const handleApply = (key: string) => {
    onApplyProtocol(key);
    setAppliedProtocols(prev => new Set(prev).add(key));
    const proto = CLINICAL_PROTOCOLS[key];
    toast.success(`Protocole "${proto.pack.label}" appliqué`, {
      description: `${proto.pack.items.length} prescriptions générées automatiquement`,
      duration: 4000,
    });
  };

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
            Bibliothèque de protocoles médicaux
            <Badge variant="outline" className="ml-2 text-xs">{Object.keys(CLINICAL_PROTOCOLS).length} protocoles</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par pathologie, spécialité, critère..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {suggestedKeys.length > 0 && !search && (
          <div className="p-3 rounded-lg border border-amber-400/30 bg-amber-50 dark:bg-amber-950/10">
            <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5" />
              Protocoles suggérés pour « {motifSfmu} »
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestedKeys.map(key => {
                const isApplied = appliedProtocols.has(key);
                return (
                  <Button
                    key={key}
                    size="sm"
                    className={cn(
                      'text-xs',
                      isApplied
                        ? 'bg-medical-success hover:bg-medical-success text-white'
                        : 'bg-amber-500 hover:bg-amber-600 text-white',
                    )}
                    disabled={isApplied}
                    onClick={() => { handleApply(key); setOpen(false); }}
                  >
                    {isApplied ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <Zap className="h-3 w-3 mr-1" />}
                    {isApplied ? 'Appliqué' : `Appliquer « ${key} »`}
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        <div className="space-y-2">
          {sortedProtocols.map(([key, proto]) => {
            const severity = SEVERITY_CONFIG[proto.severity];
            const isApplied = appliedProtocols.has(key);
            const SeverityIcon = severity.icon;
            return (
              <div
                key={key}
                className={cn(
                  'rounded-lg border p-3 cursor-pointer transition-all hover:shadow-sm',
                  severity.className,
                  selectedProtocol === key && 'ring-2 ring-primary',
                  isApplied && 'opacity-60',
                )}
                onClick={() => setSelectedProtocol(selectedProtocol === key ? null : key)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">{key}</span>
                    <Badge className={cn('text-[10px]', CATEGORY_COLORS[proto.category])}>
                      {proto.category}
                    </Badge>
                    {proto.severity === 'critical' && (
                      <Badge variant="outline" className="text-[10px] border-medical-critical/30 text-medical-critical">
                        <SeverityIcon className="h-2.5 w-2.5 mr-0.5" /> {severity.label}
                      </Badge>
                    )}
                    {proto.guidelines && (
                      <span className="text-[9px] text-muted-foreground italic">{proto.guidelines}</span>
                    )}
                    {isApplied && (
                      <Badge className="text-[10px] bg-medical-success text-white">
                        <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" /> Appliqué
                      </Badge>
                    )}
                  </div>
                  <ChevronRight className={cn('h-4 w-4 text-muted-foreground transition-transform', selectedProtocol === key && 'rotate-90')} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{proto.description}</p>

                {proto.timeWindow && (
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <Clock className="h-3 w-3 text-medical-critical" />
                    <span className="text-[10px] font-semibold text-medical-critical">{proto.timeWindow}</span>
                  </div>
                )}

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
                        Contenu du protocole ({proto.pack.items.length} prescriptions auto-générées)
                      </p>
                      <div className="grid grid-cols-1 gap-1 max-h-48 overflow-y-auto">
                        {proto.pack.items.map((item, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs px-2 py-1.5 rounded bg-accent/50">
                            <span className="text-sm">{PRESCRIPTION_TYPE_ICONS[item.type]}</span>
                            <span className="font-medium flex-1">{item.medication_name}</span>
                            {item.dosage && <span className="text-muted-foreground">{item.dosage}</span>}
                            {item.route && <Badge variant="outline" className="text-[9px] h-4 px-1">{item.route}</Badge>}
                            {item.priority === 'stat' && <Badge className="text-[9px] h-4 px-1 bg-medical-critical text-white">STAT</Badge>}
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button
                      className={cn('w-full', isApplied && 'bg-medical-success hover:bg-medical-success')}
                      disabled={isApplied}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApply(key);
                        setOpen(false);
                      }}
                    >
                      {isApplied ? (
                        <><CheckCircle2 className="h-4 w-4 mr-2" /> Protocole déjà appliqué</>
                      ) : (
                        <><Zap className="h-4 w-4 mr-2" /> Appliquer 1-clic — {proto.pack.items.length} prescriptions</>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
