import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, AlertTriangle } from 'lucide-react';
import { categorizePrescription, PRESCRIPTION_SECTIONS } from '@/lib/prescription-utils';
import {
  PRESCRIPTION_TYPE_GROUPS,
  PRESCRIPTION_TYPE_LABELS,
  PRESCRIPTION_TYPE_ICONS,
  PRESCRIPTION_PACKS,
  EXAM_BIO_CATEGORIES,
  EXAM_IMAGERIE_CATEGORIES,
  AVIS_SPECIALTIES,
  O2_DEVICES,
  EXTENDED_MED_ROUTES,
  type PrescriptionType,
  type PrescriptionMetadata,
} from '@/lib/prescription-types';
import type { DrugInteraction } from '@/lib/allergy-check';
import type { PrescriptionCategory } from '@/lib/prescription-utils';

interface PrescriptionPanelProps {
  prescriptions: any[];
  encounter: any;
  vitals: any[];
  // Prescription hook state
  prescribeOpen: boolean;
  setPrescribeOpen: (v: boolean) => void;
  allergyWarning: string[];
  drugInteractions: DrugInteraction[];
  interactionConfirmed: boolean;
  setInteractionConfirmed: (v: boolean) => void;
  newRx: { medication_name: string; dosage: string; route: string; frequency: string; priority: string; rx_type: PrescriptionCategory };
  setNewRx: (v: any) => void;
  rxType: PrescriptionType;
  setRxType: (v: PrescriptionType) => void;
  rxMeta: Partial<PrescriptionMetadata>;
  setRxMeta: (v: Partial<PrescriptionMetadata>) => void;
  selectedExams: string[];
  setSelectedExams: (v: string[]) => void;
  handleMedNameChange: (name: string) => void;
  handlePrescribe: () => void;
  handleApplyPack: (packKey: string) => void;
  handleCancelPrescription: (rxId: string) => void;
  handleSuspendPrescription: (rxId: string) => void;
  handleReactivatePrescription: (rxId: string) => void;
}

export function PrescriptionPanel(props: PrescriptionPanelProps) {
  const {
    prescriptions, encounter, vitals,
    prescribeOpen, setPrescribeOpen,
    allergyWarning, drugInteractions, interactionConfirmed, setInteractionConfirmed,
    newRx, setNewRx, rxType, setRxType, rxMeta, setRxMeta,
    selectedExams, setSelectedExams,
    handleMedNameChange, handlePrescribe, handleApplyPack,
    handleCancelPrescription, handleSuspendPrescription, handleReactivatePrescription,
  } = props;

  const rxGroups = {
    soins: prescriptions.filter(rx => categorizePrescription(rx) === 'soins'),
    examens_bio: prescriptions.filter(rx => categorizePrescription(rx) === 'examens_bio'),
    examens_imagerie: prescriptions.filter(rx => categorizePrescription(rx) === 'examens_imagerie'),
    traitements: prescriptions.filter(rx => categorizePrescription(rx) === 'traitements'),
  };

  return (
    <Card className="animate-in fade-in duration-300" style={{ animationDelay: '150ms', animationFillMode: 'both' }}>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Prescriptions</CardTitle>
        <Dialog open={prescribeOpen} onOpenChange={setPrescribeOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Prescrire</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Nouvelle prescription</DialogTitle></DialogHeader>
            <div className="space-y-3">
              {/* Pack suggestions */}
              {encounter.motif_sfmu && (() => {
                const normalize = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
                const motifNorm = normalize(encounter.motif_sfmu || '');
                const MOTIF_KEYWORDS: Record<string, string[]> = {
                  'Douleur thoracique': ['douleur thoracique', 'dt', 'precordialgie', 'thorax', 'cardio', 'angor', 'infarctus'],
                  'Traumatisme membre': ['traumatisme', 'trauma', 'fracture', 'entorse', 'luxation', 'chute'],
                  'Dyspnee': ['dyspnee', 'asthme', 'bronchospasme', 'detresse respiratoire', 'insuffisance respiratoire'],
                  'Douleur abdominale': ['douleur abdominale', 'abdo', 'colique', 'nephretique', 'ventre'],
                  'Intoxication': ['intoxication', 'intox', 'surdosage', 'ingestion'],
                  'AEG / Fievre': ['fievre', 'aeg', 'sepsis', 'infection', 'alteration etat general'],
                  'Malaise / syncope': ['malaise', 'syncope', 'perte connaissance', 'lipothymie'],
                };
                const matchedPacks: string[] = [];
                // Match by normalized motif against pack keys
                const motifKey = Object.keys(PRESCRIPTION_PACKS).find(k => normalize(k) === motifNorm);
                if (motifKey) matchedPacks.push(motifKey);
                for (const [packKey, keywords] of Object.entries(MOTIF_KEYWORDS)) {
                  if (matchedPacks.includes(packKey)) continue;
                  if (keywords.some(kw => motifLower.includes(kw))) matchedPacks.push(packKey);
                }
                if (matchedPacks.length === 0) return null;
                return (
                  <div className="space-y-2">
                    {matchedPacks.map(packKey => {
                      const pack = PRESCRIPTION_PACKS[packKey];
                      if (!pack) return null;
                      return (
                        <div key={packKey} className="p-3 rounded-lg border border-primary/30 bg-primary/5">
                          <p className="text-xs font-semibold text-primary mb-2">Pack suggere — {packKey}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">{pack.items.length} items</Badge>
                            <Button size="sm" className="h-7 text-xs" onClick={() => handleApplyPack(packKey)}>
                              Prescrire "{pack.label}"
                            </Button>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {pack.items.map((item, i) => (
                              <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-accent">{PRESCRIPTION_TYPE_ICONS[item.type]} {item.medication_name}</span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              {/* Vitals-based suggestions */}
              {vitals.length > 0 && (() => {
                const lastVitals = vitals[vitals.length - 1];
                const motifLower = (encounter.motif_sfmu || '').toLowerCase();
                const suggestions: Array<{ label: string; reason: string; action: () => void }> = [];
                if (lastVitals.spo2 != null && lastVitals.spo2 < 92) {
                  suggestions.push({ label: 'Oxygenotherapie', reason: `SpO2 ${lastVitals.spo2}% < 92%`, action: () => { setRxType('oxygene'); setRxMeta({ o2_device: 'Masque HC', o2_debit: '6L/min', o2_target: 'SpO2 > 94%' }); } });
                }
                if (lastVitals.eva_douleur != null && lastVitals.eva_douleur > 6) {
                  suggestions.push({ label: 'Antalgique (EVA elevee)', reason: `EVA ${lastVitals.eva_douleur}/10`, action: () => { setRxType('titration'); setNewRx((prev: any) => ({ ...prev, medication_name: 'Morphine', route: 'IV' })); setRxMeta({ titration_dose_init: 2, titration_step: 2, titration_dose_max: 10, titration_interval: '5 min', titration_target: 'EVA < 4' }); } });
                }
                if (lastVitals.fc != null && lastVitals.fc > 120 && ['douleur thoracique', 'dt', 'precordialgie', 'angor'].some(k => motifLower.includes(k))) {
                  suggestions.push({ label: 'Troponine urgente + ECG', reason: `FC ${lastVitals.fc} bpm + contexte DT`, action: () => { setRxType('exam_bio'); setSelectedExams(['Troponine', 'CPK']); setRxMeta({ exam_urgency: 'urgent' }); setNewRx((prev: any) => ({ ...prev, priority: 'stat' })); } });
                }
                if (lastVitals.temperature != null && lastVitals.temperature > 38.5) {
                  suggestions.push({ label: 'Bilan infectieux', reason: `T° ${lastVitals.temperature}°C`, action: () => { setRxType('exam_bio'); setSelectedExams(['NFS', 'CRP', 'Hemocultures', 'ECBU', 'Lactates']); setRxMeta({ exam_urgency: 'urgent' }); } });
                }
                if (lastVitals.pa_systolique != null && lastVitals.pa_systolique < 90) {
                  suggestions.push({ label: 'Remplissage vasculaire', reason: `PAS ${lastVitals.pa_systolique} mmHg`, action: () => { setRxType('perfusion'); setNewRx((prev: any) => ({ ...prev, medication_name: 'NaCl 0.9%', dosage: '500mL', priority: 'stat' })); setRxMeta({ debit: '500 mL/h', duration: 'Bolus' }); } });
                }
                if (suggestions.length === 0) return null;
                return (
                  <div className="p-3 rounded-lg border border-orange-400/30 bg-orange-50 dark:bg-orange-950/20">
                    <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 mb-2 flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5" /> Suggestions basees sur les constantes
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {suggestions.map((s, i) => (
                        <button key={i} type="button" onClick={s.action}
                          className="px-2 py-1 rounded border border-orange-300 dark:border-orange-600 text-xs hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors text-left">
                          <span className="font-medium">{s.label}</span>
                          <span className="text-orange-500 dark:text-orange-400 ml-1">({s.reason})</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Type selector */}
              <div>
                <Label>Type de prescription</Label>
                <Select value={rxType} onValueChange={v => { setRxType(v as PrescriptionType); setRxMeta({}); setSelectedExams([]); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PRESCRIPTION_TYPE_GROUPS.map(group => (
                      <div key={group.label}>
                        <p className="px-2 py-1 text-xs font-semibold text-muted-foreground">{group.label}</p>
                        {group.types.map(t => (
                          <SelectItem key={t} value={t}>{PRESCRIPTION_TYPE_ICONS[t]} {PRESCRIPTION_TYPE_LABELS[t]}</SelectItem>
                        ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Medication fields */}
              {(rxType === 'medicament' || rxType === 'perfusion' || rxType === 'titration' || rxType === 'conditionnel') && (
                <>
                  <div>
                    <Label>Medicament</Label>
                    <Input value={newRx.medication_name} onChange={e => handleMedNameChange(e.target.value)} placeholder="Nom DCI" />
                    {allergyWarning.length > 0 && (
                      <div className="mt-1 p-2 rounded bg-red-50 border border-red-200 dark:bg-red-950/20">
                        <p className="text-xs font-bold text-red-600"><AlertTriangle className="h-3 w-3 inline mr-1" />ALLERGIE: {allergyWarning.join(', ')}</p>
                      </div>
                    )}
                  </div>
                  {drugInteractions.length > 0 && (
                    <div className="space-y-1">
                      {drugInteractions.filter(i => i.level === 'warning').map((i, idx) => (
                        <div key={idx} className="p-2 rounded bg-orange-50 border border-orange-200 dark:bg-orange-950/20">
                          <p className="text-xs font-semibold text-orange-600"><AlertTriangle className="h-3 w-3 inline mr-1" />{i.message}</p>
                        </div>
                      ))}
                      {drugInteractions.some(i => i.level === 'warning') && !interactionConfirmed && (
                        <Button variant="outline" size="sm" className="w-full text-xs border-orange-300 text-orange-600" onClick={() => setInteractionConfirmed(true)}>
                          Confirmer malgre les interactions
                        </Button>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* Type-specific fields */}
              {rxType === 'medicament' && (
                <div className="grid grid-cols-3 gap-2">
                  <div><Label>Dose</Label><Input value={newRx.dosage} onChange={e => setNewRx({ ...newRx, dosage: e.target.value })} placeholder="1g" /></div>
                  <div>
                    <Label>Voie</Label>
                    <Select value={newRx.route} onValueChange={v => setNewRx({ ...newRx, route: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{EXTENDED_MED_ROUTES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>Frequence</Label><Input value={newRx.frequency} onChange={e => setNewRx({ ...newRx, frequency: e.target.value })} placeholder="q6h" /></div>
                </div>
              )}

              {rxType === 'perfusion' && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div><Label>Volume (mL)</Label><Input value={newRx.dosage} onChange={e => setNewRx({ ...newRx, dosage: e.target.value })} placeholder="500mL" /></div>
                    <div><Label>Debit (mL/h)</Label><Input value={rxMeta.debit || ''} onChange={e => setRxMeta({ ...rxMeta, debit: e.target.value })} placeholder="125 mL/h" /></div>
                  </div>
                  <div><Label>Duree</Label><Input value={rxMeta.duration || ''} onChange={e => setRxMeta({ ...rxMeta, duration: e.target.value })} placeholder="4h" /></div>
                </>
              )}

              {rxType === 'titration' && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>Voie</Label>
                      <Select value={newRx.route} onValueChange={v => setNewRx({ ...newRx, route: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{['IV', 'SC', 'IVSE'].map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div><Label>Dose initiale (mg)</Label><Input type="number" value={rxMeta.titration_dose_init || ''} onChange={e => setRxMeta({ ...rxMeta, titration_dose_init: parseFloat(e.target.value) })} placeholder="2" /></div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div><Label>Palier (mg)</Label><Input type="number" value={rxMeta.titration_step || ''} onChange={e => setRxMeta({ ...rxMeta, titration_step: parseFloat(e.target.value) })} placeholder="2" /></div>
                    <div><Label>Dose max (mg)</Label><Input type="number" value={rxMeta.titration_dose_max || ''} onChange={e => setRxMeta({ ...rxMeta, titration_dose_max: parseFloat(e.target.value) })} placeholder="10" /></div>
                    <div><Label>Intervalle</Label><Input value={rxMeta.titration_interval || ''} onChange={e => setRxMeta({ ...rxMeta, titration_interval: e.target.value })} placeholder="5 min" /></div>
                  </div>
                  <div><Label>Objectif</Label><Input value={rxMeta.titration_target || ''} onChange={e => setRxMeta({ ...rxMeta, titration_target: e.target.value })} placeholder="EVA < 4" /></div>
                </>
              )}

              {rxType === 'conditionnel' && (
                <>
                  <div className="grid grid-cols-3 gap-2">
                    <div><Label>Dose</Label><Input value={newRx.dosage} onChange={e => setNewRx({ ...newRx, dosage: e.target.value })} placeholder="3mg" /></div>
                    <div>
                      <Label>Voie</Label>
                      <Select value={newRx.route} onValueChange={v => setNewRx({ ...newRx, route: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{EXTENDED_MED_ROUTES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div><Label>Max doses</Label><Input type="number" value={rxMeta.condition_max_doses || ''} onChange={e => setRxMeta({ ...rxMeta, condition_max_doses: parseInt(e.target.value) })} placeholder="3" /></div>
                  </div>
                  <div>
                    <Label>Condition</Label>
                    <div className="flex flex-wrap gap-1 mb-1">
                      {['si EVA > 6', 'si T > 38.5', 'si PAS > 180', 'si nausees', 'si agitation'].map(c => (
                        <button key={c} type="button" onClick={() => setRxMeta({ ...rxMeta, condition_trigger: c })}
                          className={cn('px-2 py-0.5 rounded border text-[10px] transition-colors', rxMeta.condition_trigger === c ? 'bg-primary text-primary-foreground' : 'hover:bg-accent')}>{c}</button>
                      ))}
                    </div>
                    <Input value={rxMeta.condition_trigger || ''} onChange={e => setRxMeta({ ...rxMeta, condition_trigger: e.target.value })} placeholder="si EVA > 6" />
                  </div>
                  <div><Label>Intervalle min entre doses</Label><Input value={rxMeta.condition_interval || ''} onChange={e => setRxMeta({ ...rxMeta, condition_interval: e.target.value })} placeholder="4h" /></div>
                </>
              )}

              {rxType === 'oxygene' && (
                <>
                  <div>
                    <Label>Dispositif</Label>
                    <Select value={rxMeta.o2_device || ''} onValueChange={v => setRxMeta({ ...rxMeta, o2_device: v })}>
                      <SelectTrigger><SelectValue placeholder="Selectionner..." /></SelectTrigger>
                      <SelectContent>{O2_DEVICES.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><Label>Debit</Label><Input value={rxMeta.o2_debit || ''} onChange={e => setRxMeta({ ...rxMeta, o2_debit: e.target.value })} placeholder="6L/min" /></div>
                    <div>
                      <Label>Cible SpO2</Label>
                      <Select value={rxMeta.o2_target || ''} onValueChange={v => setRxMeta({ ...rxMeta, o2_target: v })}>
                        <SelectTrigger><SelectValue placeholder="Cible..." /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SpO2 > 94%">SpO2 &gt; 94%</SelectItem>
                          <SelectItem value="SpO2 88-92% (BPCO)">SpO2 88-92% (BPCO)</SelectItem>
                          <SelectItem value="SpO2 > 96%">SpO2 &gt; 96%</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </>
              )}

              {rxType === 'exam_bio' && (
                <div className="space-y-2">
                  <Label>Examens biologiques</Label>
                  {EXAM_BIO_CATEGORIES.map(cat => (
                    <div key={cat.label}>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">{cat.label}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {cat.items.map(item => (
                          <label key={item} className={cn('flex items-center gap-1 px-2 py-1 rounded border text-xs cursor-pointer transition-colors',
                            selectedExams.includes(item) ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-accent')}>
                            <input type="checkbox" className="sr-only" checked={selectedExams.includes(item)}
                              onChange={e => setSelectedExams(e.target.checked ? [...selectedExams, item] : selectedExams.filter(x => x !== item))} />
                            {item}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div>
                    <Label>Urgence</Label>
                    <Select value={rxMeta.exam_urgency || 'urgent'} onValueChange={v => setRxMeta({ ...rxMeta, exam_urgency: v as 'urgent' | 'normal' })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="urgent">Urgent</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {rxType === 'exam_imagerie' && (
                <div className="space-y-2">
                  <Label>Type d'imagerie</Label>
                  {EXAM_IMAGERIE_CATEGORIES.map(cat => (
                    <div key={cat.label}>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">{cat.label}</p>
                      <div className="flex flex-wrap gap-1">
                        {cat.items.map(item => (
                          <button key={item} type="button" onClick={() => setRxMeta({ ...rxMeta, exam_site: item })}
                            className={cn('px-2 py-0.5 rounded border text-[10px] transition-colors',
                              rxMeta.exam_site === item ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-accent')}>{item}</button>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div><Label>Indication</Label><Input value={rxMeta.exam_indication || ''} onChange={e => setRxMeta({ ...rxMeta, exam_indication: e.target.value })} placeholder="Indication clinique..." /></div>
                </div>
              )}

              {rxType === 'exam_ecg' && (
                <p className="text-sm text-muted-foreground p-3 rounded bg-accent/30">ECG 12 derivations sera prescrit</p>
              )}

              {rxType === 'surveillance' && (
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>Type</Label><Input value={rxMeta.surveillance_type || ''} onChange={e => setRxMeta({ ...rxMeta, surveillance_type: e.target.value })} placeholder="scope + SpO2" /></div>
                  <div>
                    <Label>Frequence</Label>
                    <Select value={rxMeta.surveillance_frequency || 'continue'} onValueChange={v => setRxMeta({ ...rxMeta, surveillance_frequency: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {['continue', 'horaire', 'q30min', 'q2h', 'q4h'].map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {rxType === 'avis_specialise' && (
                <>
                  <div>
                    <Label>Specialite</Label>
                    <Select value={rxMeta.avis_speciality || ''} onValueChange={v => setRxMeta({ ...rxMeta, avis_speciality: v })}>
                      <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                      <SelectContent>{AVIS_SPECIALTIES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>Motif</Label><Textarea value={rxMeta.avis_motif || ''} onChange={e => setRxMeta({ ...rxMeta, avis_motif: e.target.value })} placeholder="Motif de l'avis..." rows={2} /></div>
                  <div>
                    <Label>Urgence</Label>
                    <Select value={rxMeta.avis_urgency || 'rapide'} onValueChange={v => setRxMeta({ ...rxMeta, avis_urgency: v as 'urgent' | 'rapide' | 'programme' })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="urgent">Urgent</SelectItem>
                        <SelectItem value="rapide">Rapide</SelectItem>
                        <SelectItem value="programme">Programme</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {rxType === 'regime' && (
                <div>
                  <Label>Details</Label>
                  <div className="flex flex-wrap gap-1 mb-1">
                    {['A jeun strict', 'Regime sans sel', 'Boissons libres'].map(r => (
                      <button key={r} type="button" onClick={() => setRxMeta({ ...rxMeta, regime_details: r })}
                        className={cn('px-2 py-0.5 rounded border text-[10px] transition-colors', rxMeta.regime_details === r ? 'bg-primary text-primary-foreground' : 'hover:bg-accent')}>{r}</button>
                    ))}
                  </div>
                  <Input value={rxMeta.regime_details || ''} onChange={e => setRxMeta({ ...rxMeta, regime_details: e.target.value })} />
                </div>
              )}

              {rxType === 'mobilisation' && (
                <div>
                  <Label>Details</Label>
                  <div className="flex flex-wrap gap-1 mb-1">
                    {['Repos strict au lit', 'Lever autorise avec aide', 'Pas d\'appui MIG', 'Pas d\'appui MID'].map(m => (
                      <button key={m} type="button" onClick={() => setRxMeta({ ...rxMeta, mobilisation_details: m })}
                        className={cn('px-2 py-0.5 rounded border text-[10px] transition-colors', rxMeta.mobilisation_details === m ? 'bg-primary text-primary-foreground' : 'hover:bg-accent')}>{m}</button>
                    ))}
                  </div>
                  <Input value={rxMeta.mobilisation_details || ''} onChange={e => setRxMeta({ ...rxMeta, mobilisation_details: e.target.value })} />
                </div>
              )}

              {rxType === 'dispositif' && (
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>Dispositif</Label><Input value={rxMeta.device_name || ''} onChange={e => setRxMeta({ ...rxMeta, device_name: e.target.value })} placeholder="Attelle, minerve..." /></div>
                  <div><Label>Details</Label><Input value={rxMeta.device_details || ''} onChange={e => setRxMeta({ ...rxMeta, device_details: e.target.value })} placeholder="Pied G, taille M..." /></div>
                </div>
              )}

              {/* Priority */}
              <div>
                <Label>Priorite</Label>
                <Select value={newRx.priority} onValueChange={v => setNewRx({ ...newRx, priority: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="routine">Routine</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="stat">STAT</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handlePrescribe} className="w-full" disabled={allergyWarning.length > 0 || (drugInteractions.some(i => i.level === 'warning') && !interactionConfirmed)}>
                {PRESCRIPTION_TYPE_ICONS[rxType]} Valider la prescription
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-4">
        {prescriptions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {PRESCRIPTION_SECTIONS.filter(s => rxGroups[s.key as keyof typeof rxGroups].length > 0).map(s => (
              <Badge key={s.key} variant="outline" className="text-xs gap-1">
                {s.icon} {s.label} ({rxGroups[s.key as keyof typeof rxGroups].length})
              </Badge>
            ))}
          </div>
        )}
        {prescriptions.length === 0 && <p className="text-sm text-muted-foreground">Aucune prescription</p>}
        {PRESCRIPTION_SECTIONS.filter(s => rxGroups[s.key as keyof typeof rxGroups].length > 0).map(s => (
          <div key={s.key}>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">{s.icon} {s.label}</p>
            <div className="space-y-2">
              {rxGroups[s.key as keyof typeof rxGroups].map((rx: any) => (
                <div key={rx.id} className={cn('p-3 rounded-lg border flex items-center justify-between animate-in fade-in duration-200',
                  rx.priority === 'stat' && rx.status === 'active' && 'border-medical-critical/30 animate-pulse',
                  rx.priority === 'urgent' && rx.status === 'active' && 'border-medical-warning/30',
                  rx.status === 'completed' && 'opacity-60',
                  rx.status === 'cancelled' && 'opacity-40 line-through',
                  rx.status === 'suspended' && 'opacity-50 bg-muted/30')}>
                  <div>
                    <p className={cn('font-medium text-sm', rx.status === 'cancelled' && 'line-through')}>{rx.medication_name} — {rx.dosage}</p>
                    <p className="text-xs text-muted-foreground">{rx.route} · {rx.frequency || 'Ponctuel'}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {rx.status === 'active' && (
                      <>
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-medical-warning" onClick={() => handleSuspendPrescription(rx.id)}>Suspendre</Button>
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-medical-critical" onClick={() => handleCancelPrescription(rx.id)}>Annuler</Button>
                      </>
                    )}
                    {rx.status === 'suspended' && (
                      <Button variant="ghost" size="sm" className="h-7 text-xs text-medical-success" onClick={() => handleReactivatePrescription(rx.id)}>Réactiver</Button>
                    )}
                    <Badge variant={rx.status === 'active' ? 'default' : 'secondary'}
                      className={cn(rx.status === 'suspended' && 'bg-medical-warning/10 text-medical-warning border-medical-warning/30')}>
                      {rx.status === 'active' ? 'Active' : rx.status === 'completed' ? 'Administré' : rx.status === 'cancelled' ? 'Annulée' : rx.status === 'suspended' ? 'Suspendue' : rx.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
