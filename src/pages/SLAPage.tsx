import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SLAPage() {
  useEffect(() => {
    document.title = 'SLA UrgenceOS — Accord de Niveau de Service';
  }, []);

  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Screen-only toolbar */}
      <div className="print:hidden sticky top-0 z-50 bg-background/80 backdrop-blur border-b px-6 py-3 flex items-center justify-between">
        <Link to="/statut" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Retour au statut
        </Link>
        <Button size="sm" onClick={handlePrint} className="gap-1.5">
          <Download className="h-4 w-4" /> Télécharger en PDF
        </Button>
      </div>

      {/* Print-optimized document */}
      <article className="max-w-[210mm] mx-auto px-8 py-12 print:px-[20mm] print:py-[15mm] print:max-w-none text-sm leading-relaxed">
        {/* Header */}
        <header className="text-center mb-12 pb-8 border-b-2 border-primary/20">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Document contractuel</p>
          <h1 className="text-3xl font-bold mb-2">Accord de Niveau de Service (SLA)</h1>
          <p className="text-lg text-muted-foreground">UrgenceOS — Plateforme de gestion des urgences hospitalières</p>
          <div className="mt-6 inline-flex gap-6 text-xs text-muted-foreground">
            <span>Version 1.0</span>
            <span>•</span>
            <span>Date d'effet : 1er janvier 2025</span>
            <span>•</span>
            <span>Révision annuelle</span>
          </div>
        </header>

        {/* Parties */}
        <Section n="1" title="Parties">
          <p><strong>Éditeur :</strong> EmotionsCare SASU — SIREN 944 505 445 — Capital social 1 000 € — Siège social : Rue Caudron, Amiens 80000, France.</p>
          <p className="mt-2"><strong>Client :</strong> L'établissement de santé signataire du contrat de licence UrgenceOS (ci-après « le Client »).</p>
        </Section>

        {/* Objet */}
        <Section n="2" title="Objet">
          <p>
            Le présent Accord de Niveau de Service (SLA) définit les engagements de disponibilité, de performance
            et de support pris par EmotionsCare dans le cadre de la fourniture de la plateforme UrgenceOS.
            Il s'applique à l'ensemble des composants de la plateforme : application web (PWA), API & backend,
            base de données, authentification, et services temps réel.
          </p>
        </Section>

        {/* Disponibilité */}
        <Section n="3" title="Engagements de disponibilité">
          <table className="w-full border-collapse mt-4 text-sm">
            <thead>
              <tr className="border-b-2 border-primary/20">
                <th className="text-left py-2 pr-4 font-semibold">Indicateur</th>
                <th className="text-left py-2 pr-4 font-semibold">Engagement</th>
                <th className="text-left py-2 font-semibold">Détails</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="py-3 pr-4 font-medium">Disponibilité mensuelle</td>
                <td className="py-3 pr-4 font-bold text-primary">99,9 %</td>
                <td className="py-3 text-muted-foreground">Mesurée sur 30 jours glissants, hors maintenance planifiée</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium">RTO (Recovery Time Objective)</td>
                <td className="py-3 pr-4 font-bold text-primary">&lt; 15 minutes</td>
                <td className="py-3 text-muted-foreground">Temps maximum de restauration après incident critique</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium">RPO (Recovery Point Objective)</td>
                <td className="py-3 pr-4 font-bold text-primary">&lt; 5 minutes</td>
                <td className="py-3 text-muted-foreground">Perte de données maximale tolérée — sauvegardes continues PITR</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium">Uptime annuel cible</td>
                <td className="py-3 pr-4 font-bold text-primary">99,95 %</td>
                <td className="py-3 text-muted-foreground">Objectif annuel incluant les fenêtres de maintenance</td>
              </tr>
            </tbody>
          </table>
        </Section>

        {/* Maintenance */}
        <Section n="4" title="Maintenance planifiée">
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>Les fenêtres de maintenance sont programmées en <strong>période creuse</strong> (nuit ou week-end).</li>
            <li>Le Client est notifié <strong>72 heures minimum</strong> avant toute maintenance planifiée.</li>
            <li>La durée maximale d'une fenêtre de maintenance est de <strong>2 heures</strong>.</li>
            <li>Les maintenances d'urgence (correctifs de sécurité critiques) peuvent être effectuées sans préavis, avec notification immédiate.</li>
          </ul>
        </Section>

        {/* Support */}
        <Section n="5" title="Support et gestion des incidents">
          <table className="w-full border-collapse mt-4 text-sm">
            <thead>
              <tr className="border-b-2 border-primary/20">
                <th className="text-left py-2 pr-4 font-semibold">Priorité</th>
                <th className="text-left py-2 pr-4 font-semibold">Description</th>
                <th className="text-left py-2 pr-4 font-semibold">Temps de réponse</th>
                <th className="text-left py-2 font-semibold">Temps de résolution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="py-3 pr-4"><span className="px-2 py-0.5 rounded bg-destructive/10 text-destructive font-semibold text-xs">P1 — Critique</span></td>
                <td className="py-3 pr-4">Service totalement indisponible ou perte de données</td>
                <td className="py-3 pr-4 font-bold">&lt; 30 min</td>
                <td className="py-3 font-bold">&lt; 4 heures</td>
              </tr>
              <tr>
                <td className="py-3 pr-4"><span className="px-2 py-0.5 rounded bg-orange-500/10 text-orange-600 font-semibold text-xs">P2 — Majeur</span></td>
                <td className="py-3 pr-4">Fonctionnalité critique dégradée, contournement possible</td>
                <td className="py-3 pr-4 font-bold">&lt; 2 heures</td>
                <td className="py-3 font-bold">&lt; 24 heures</td>
              </tr>
              <tr>
                <td className="py-3 pr-4"><span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 font-semibold text-xs">P3 — Mineur</span></td>
                <td className="py-3 pr-4">Anomalie non bloquante, impact limité</td>
                <td className="py-3 pr-4 font-bold">&lt; 8 heures</td>
                <td className="py-3 font-bold">&lt; 5 jours ouvrés</td>
              </tr>
              <tr>
                <td className="py-3 pr-4"><span className="px-2 py-0.5 rounded bg-muted text-muted-foreground font-semibold text-xs">P4 — Évolution</span></td>
                <td className="py-3 pr-4">Demande d'amélioration ou question fonctionnelle</td>
                <td className="py-3 pr-4 font-bold">&lt; 24 heures</td>
                <td className="py-3">Planifié en roadmap</td>
              </tr>
            </tbody>
          </table>

          <div className="mt-6 p-4 rounded-lg border bg-muted/30">
            <p className="font-medium mb-1">Canal de signalement</p>
            <p className="text-muted-foreground">
              Email : <strong>support@urgenceos.fr</strong> — Astreinte 24/7 pour les incidents P1.
            </p>
          </div>
        </Section>

        {/* Sécurité */}
        <Section n="6" title="Sécurité et conformité">
          <div className="grid grid-cols-2 gap-4 mt-4">
            {[
              ['Chiffrement en transit', 'TLS 1.2+ sur toutes les connexions'],
              ['Chiffrement au repos', 'AES-256 pour les données stockées'],
              ['Sauvegardes', 'Continues (PITR) — rétention 30 jours'],
              ['Row Level Security', 'Isolation stricte des données par établissement'],
              ['Authentification', 'MFA (TOTP) obligatoire pour les comptes administrateurs'],
              ['Audit trail', 'Logs immutables de toutes les actions critiques'],
              ['Hébergement', 'Infrastructure européenne (Francfort) — certification HDS en cours'],
              ['Tests de sécurité', 'Audits de sécurité réguliers, scans de vulnérabilités automatisés'],
            ].map(([label, detail]) => (
              <div key={label} className="p-3 rounded-lg border">
                <p className="font-medium text-xs">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{detail}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Monitoring */}
        <Section n="7" title="Monitoring et transparence">
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>Monitoring automatisé <strong>24/7</strong> avec vérification toutes les <strong>5 minutes</strong>.</li>
            <li>Page de statut publique accessible à l'adresse <strong>urgenceos.fr/statut</strong>.</li>
            <li>Historique de disponibilité sur <strong>90 jours glissants</strong>.</li>
            <li>Notification proactive en cas de dégradation ou d'incident.</li>
          </ul>
        </Section>

        {/* Pénalités */}
        <Section n="8" title="Pénalités et compensations">
          <table className="w-full border-collapse mt-4 text-sm">
            <thead>
              <tr className="border-b-2 border-primary/20">
                <th className="text-left py-2 pr-4 font-semibold">Disponibilité mensuelle</th>
                <th className="text-left py-2 font-semibold">Compensation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="py-3 pr-4">≥ 99,9 %</td>
                <td className="py-3 text-muted-foreground">Aucune — engagement respecté</td>
              </tr>
              <tr>
                <td className="py-3 pr-4">99,0 % — 99,9 %</td>
                <td className="py-3">Avoir de <strong>10 %</strong> de la redevance mensuelle</td>
              </tr>
              <tr>
                <td className="py-3 pr-4">95,0 % — 99,0 %</td>
                <td className="py-3">Avoir de <strong>25 %</strong> de la redevance mensuelle</td>
              </tr>
              <tr>
                <td className="py-3 pr-4">&lt; 95,0 %</td>
                <td className="py-3">Avoir de <strong>50 %</strong> de la redevance mensuelle</td>
              </tr>
            </tbody>
          </table>
          <p className="mt-4 text-xs text-muted-foreground">
            Les compensations sont appliquées sous forme d'avoir sur la facture suivante, sur demande écrite du Client dans les 30 jours suivant la fin du mois concerné.
          </p>
        </Section>

        {/* Exclusions */}
        <Section n="9" title="Exclusions">
          <p className="mt-2">Les engagements du présent SLA ne s'appliquent pas dans les cas suivants :</p>
          <ul className="list-disc pl-5 space-y-1 mt-2 text-muted-foreground">
            <li>Force majeure (catastrophe naturelle, coupure réseau nationale, etc.)</li>
            <li>Maintenance planifiée notifiée dans les délais prévus</li>
            <li>Dysfonctionnement imputable au Client (mauvaise configuration, usage non conforme)</li>
            <li>Indisponibilité de services tiers hors du périmètre d'EmotionsCare</li>
          </ul>
        </Section>

        {/* Révision */}
        <Section n="10" title="Révision et durée">
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>Le présent SLA est révisé <strong>annuellement</strong> ou lors de tout changement majeur de l'infrastructure.</li>
            <li>Toute modification est communiquée au Client <strong>30 jours</strong> avant son entrée en vigueur.</li>
            <li>Le Client dispose d'un droit de résiliation en cas de dégradation substantielle des engagements.</li>
          </ul>
        </Section>

        {/* Footer / Signatures */}
        <div className="mt-16 pt-8 border-t-2 border-primary/20">
          <div className="grid grid-cols-2 gap-12">
            <div>
              <p className="font-semibold mb-1">Pour EmotionsCare SASU</p>
              <p className="text-xs text-muted-foreground">Représentant légal</p>
              <div className="mt-8 border-b border-dashed border-muted-foreground/30 w-48" />
              <p className="text-xs text-muted-foreground mt-1">Date et signature</p>
            </div>
            <div>
              <p className="font-semibold mb-1">Pour l'Établissement Client</p>
              <p className="text-xs text-muted-foreground">Représentant habilité</p>
              <div className="mt-8 border-b border-dashed border-muted-foreground/30 w-48" />
              <p className="text-xs text-muted-foreground mt-1">Date et signature</p>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-12">
            EmotionsCare SASU — SIREN 944 505 445 — Amiens, France — support@urgenceos.fr
          </p>
        </div>
      </article>
    </div>
  );
}

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-lg font-bold mb-3">
        <span className="text-primary mr-2">Article {n}.</span>{title}
      </h2>
      {children}
    </section>
  );
}
