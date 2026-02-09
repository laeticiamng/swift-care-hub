import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Cookie, ChevronDown, ChevronUp } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const CONSENT_KEY = 'urgenceos-cookie-consent';

interface CookiePreferences {
  essential: boolean;     // Always true — session auth
  preferences: boolean;   // Theme, onboarding
  consent_stored: boolean; // Consent cookie itself
}

function getStoredConsent(): CookiePreferences | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    preferences: true,
    consent_stored: true,
  });

  useEffect(() => {
    const consent = getStoredConsent();
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const saveConsent = (prefs: CookiePreferences) => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(prefs));
    setVisible(false);
  };

  const acceptAll = () => {
    saveConsent({ essential: true, preferences: true, consent_stored: true });
  };

  const refuseAll = () => {
    saveConsent({ essential: true, preferences: false, consent_stored: true });
  };

  const saveCustom = () => {
    saveConsent({ ...preferences, essential: true, consent_stored: true });
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 animate-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-xl mx-auto bg-card/95 backdrop-blur-xl border rounded-2xl shadow-lg p-5 space-y-4">
        <div className="flex items-start gap-3">
          <Cookie className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground leading-relaxed flex-1">
            Ce site utilise uniquement des cookies techniques necessaires a son fonctionnement (session, preferences, consentement). Aucun cookie publicitaire ou de suivi.{' '}
            <Link to="/politique-confidentialite" className="text-primary hover:underline">En savoir plus</Link>
          </p>
        </div>

        {showCustomize && (
          <div className="space-y-3 border-t pt-3">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Cookies essentiels</Label>
                <p className="text-xs text-muted-foreground">Session d'authentification Supabase</p>
              </div>
              <Switch checked disabled />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Preferences</Label>
                <p className="text-xs text-muted-foreground">Theme clair/sombre, onboarding</p>
              </div>
              <Switch checked={preferences.preferences} onCheckedChange={(v) => setPreferences({ ...preferences, preferences: v })} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Consentement</Label>
                <p className="text-xs text-muted-foreground">Memorisation de votre choix (13 mois)</p>
              </div>
              <Switch checked disabled />
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <Button variant="outline" size="sm" onClick={refuseAll} className="shrink-0">
            Refuser tout
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowCustomize(!showCustomize)} className="shrink-0 gap-1">
            Personnaliser {showCustomize ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </Button>
          {showCustomize ? (
            <Button size="sm" onClick={saveCustom} className="shrink-0">
              Enregistrer mes choix
            </Button>
          ) : (
            <Button size="sm" onClick={acceptAll} className="shrink-0">
              Accepter tout
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
