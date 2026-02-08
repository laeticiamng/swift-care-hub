import { useState } from 'react';
import { X, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const TIPS_BY_ROLE: Record<string, string[]> = {
  medecin: [
    'Cliquez sur un patient pour accéder à son dossier complet avec diagnostics et prescriptions.',
    'Filtrez vos patients avec le bouton "Mes patients" pour vous concentrer sur votre charge.',
    'Les résultats critiques apparaissent en rouge sur les cartes — cliquez pour les consulter.',
  ],
  ide: [
    'La pancarte regroupe constantes, prescriptions et transmissions sur un seul écran.',
    'Administrez un médicament en 1 tap : ajustez la dose si besoin, puis cliquez OK.',
    'Les transmissions DAR se pré-remplissent avec les dernières constantes et actes.',
  ],
  ioa: [
    'Les patients arrivent automatiquement dans votre file — triez-les par ordre de priorité.',
    'Le temps d\'attente se colore en rouge au-delà de 60 minutes.',
    'Après le tri, le patient apparaît sur le board pour prise en charge.',
  ],
  as: [
    'Sélectionnez un patient puis choisissez votre action : constantes, surveillance, brancardage ou confort.',
    'Les zones tactiles sont optimisées pour une saisie rapide, même avec des gants.',
    'Chaque action est automatiquement tracée dans le dossier patient.',
  ],
  secretaire: [
    'Recherchez un patient existant en tapant son nom — les homonymes sont détectés automatiquement.',
    'Cliquez sur une admission pour consulter le statut du patient en temps réel.',
    'Le compteur "En attente" vous aide à anticiper la charge des urgences.',
  ],
};

interface OnboardingBannerProps {
  role: string;
}

export function OnboardingBanner({ role }: OnboardingBannerProps) {
  const storageKey = `urgenceos_onboarded_${role}`;
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(storageKey) === 'true');

  if (dismissed) return null;

  const tips = TIPS_BY_ROLE[role] || [];
  if (tips.length === 0) return null;

  const handleDismiss = () => {
    localStorage.setItem(storageKey, 'true');
    setDismissed(true);
  };

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
            <Lightbulb className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold mb-2">Bienvenue sur UrgenceOS</p>
            <ul className="space-y-1.5">
              {tips.map((tip, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary font-bold text-xs mt-0.5">{i + 1}.</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="shrink-0 h-7 w-7" onClick={handleDismiss}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex justify-end mt-3">
        <Button size="sm" variant="outline" onClick={handleDismiss}>J'ai compris</Button>
      </div>
    </div>
  );
}
