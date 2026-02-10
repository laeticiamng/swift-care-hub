/**
 * M1-03 — Identity Verification Lock Dialog
 * Every critical action requires Nom+DDN or Nom+IPP
 * Non-bypassable
 */

import { useState } from 'react';
import { Shield, Lock, CheckCircle, XCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { verifyIdentity, generateIPP } from '@/lib/homonymy-detection';
import type { PatientIdentity } from '@/lib/sih-types';

interface IdentityVerificationDialogProps {
  open: boolean;
  patient: PatientIdentity;
  actionLabel: string;
  onVerified: (method: 'nom_ddn' | 'nom_ipp') => void;
  onCancel: () => void;
}

export function IdentityVerificationDialog({
  open, patient, actionLabel, onVerified, onCancel,
}: IdentityVerificationDialogProps) {
  const [method, setMethod] = useState<'nom_ddn' | 'nom_ipp'>('nom_ddn');
  const [inputNom, setInputNom] = useState('');
  const [inputSecond, setInputSecond] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);

  const handleVerify = () => {
    const isValid = verifyIdentity(patient, inputNom, inputSecond, method);
    if (isValid) {
      setError('');
      setAttempts(0);
      onVerified(method);
    } else {
      setAttempts(prev => prev + 1);
      setError(`Identite non confirmee. Tentative ${attempts + 1}/3.`);
      if (attempts >= 2) {
        setError('3 tentatives echouees. Action bloquee. Contactez le referent identite.');
      }
    }
  };

  const isBlocked = attempts >= 3;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onCancel(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            <DialogTitle>Verification d'identite obligatoire</DialogTitle>
          </div>
          <DialogDescription>
            Action: <strong>{actionLabel}</strong>
            <br />
            Patient: <strong>{patient.nom.toUpperCase()} {patient.prenom}</strong>
          </DialogDescription>
        </DialogHeader>

        {isBlocked ? (
          <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-center space-y-2">
            <XCircle className="h-8 w-8 text-red-600 mx-auto" />
            <p className="text-sm font-bold text-red-600">Action bloquee</p>
            <p className="text-xs text-red-600/80">3 tentatives echouees. Contactez le referent identitovigilance.</p>
          </div>
        ) : (
          <>
            <Tabs value={method} onValueChange={(v) => { setMethod(v as 'nom_ddn' | 'nom_ipp'); setError(''); setInputSecond(''); }}>
              <TabsList className="w-full">
                <TabsTrigger value="nom_ddn" className="flex-1">Nom + Date de naissance</TabsTrigger>
                <TabsTrigger value="nom_ipp" className="flex-1">Nom + IPP</TabsTrigger>
              </TabsList>

              <TabsContent value="nom_ddn" className="space-y-3 mt-3">
                <div className="space-y-2">
                  <Label htmlFor="verify-nom-1">Nom du patient</Label>
                  <Input
                    id="verify-nom-1"
                    placeholder="Saisir le nom..."
                    value={inputNom}
                    onChange={(e) => setInputNom(e.target.value)}
                    className="min-h-[44px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="verify-ddn">Date de naissance (AAAA-MM-JJ)</Label>
                  <Input
                    id="verify-ddn"
                    type="date"
                    value={inputSecond}
                    onChange={(e) => setInputSecond(e.target.value)}
                    className="min-h-[44px]"
                  />
                </div>
              </TabsContent>

              <TabsContent value="nom_ipp" className="space-y-3 mt-3">
                <div className="space-y-2">
                  <Label htmlFor="verify-nom-2">Nom du patient</Label>
                  <Input
                    id="verify-nom-2"
                    placeholder="Saisir le nom..."
                    value={inputNom}
                    onChange={(e) => setInputNom(e.target.value)}
                    className="min-h-[44px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="verify-ipp">IPP (Identifiant Permanent Patient)</Label>
                  <Input
                    id="verify-ipp"
                    placeholder="IPP-XXXXXXXX"
                    value={inputSecond}
                    onChange={(e) => setInputSecond(e.target.value)}
                    className="min-h-[44px]"
                  />
                </div>
              </TabsContent>
            </Tabs>

            {error && (
              <p className="text-sm text-red-600 font-medium animate-in fade-in">{error}</p>
            )}
          </>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onCancel} className="min-h-[44px]">Annuler</Button>
          {!isBlocked && (
            <Button onClick={handleVerify} className="min-h-[44px]" disabled={!inputNom.trim() || !inputSecond.trim()}>
              <Shield className="h-4 w-4 mr-2" />
              Confirmer l'identite
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
