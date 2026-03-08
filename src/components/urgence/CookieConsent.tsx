import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Cookie, ChevronDown, ChevronUp, X } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const CONSENT_KEY = 'urgenceos-cookie-consent';

interface CookiePreferences {
  essential: boolean;
  preferences: boolean;
  consent_stored: boolean;
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
  const [expanded, setExpanded] = useState(false);
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

  const acceptAll = () => saveConsent({ essential: true, preferences: true, consent_stored: true });
  const refuseAll = () => saveConsent({ essential: true, preferences: false, consent_stored: true });
  const saveCustom = () => saveConsent({ ...preferences, essential: true, consent_stored: true });

  if (!visible) return null;

  // Slim mode (default)
  if (!expanded) {
    return (
      <div className="fixed bottom-0 inset-x-0 z-50 animate-in slide-in-from-bottom-2 duration-300">
        <div className="bg-card/95 backdrop-blur-xl border-t shadow-lg">
          <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 min-w-0">
              <Cookie className="h-4 w-4 text-primary shrink-0 hidden sm:block" />
              <p className="text-xs text-muted-foreground sm:truncate">
                Cookies techniques uniquement (session, préférences).{' '}
                <Link to="/politique-confidentialite" className="text-primary hover:underline">En savoir plus</Link>
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="ghost" size="sm" className="h-7 px-2.5 text-xs" onClick={() => setExpanded(true)}>
                Personnaliser
              </Button>
              <Button variant="ghost" size="sm" className="h-7 px-2.5 text-xs" onClick={refuseAll}>
                Refuser
              </Button>
              <Button size="sm" className="h-7 px-3 text-xs" onClick={acceptAll}>
                Accepter
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Expanded customization panel
  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 animate-in slide-in-from-bottom-4 duration-300">
      <div className="max-w-md mx-auto bg-card/95 backdrop-blur-xl border rounded-2xl shadow-lg p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cookie className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Paramètres cookies</span>
          </div>
          <button onClick={() => setExpanded(false)} className="p-1 rounded-md hover:bg-accent">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <div className="space-y-3 border-t pt-3">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Essentiels</Label>
              <p className="text-xs text-muted-foreground">Session d'authentification</p>
            </div>
            <Switch checked disabled />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Préférences</Label>
              <p className="text-xs text-muted-foreground">Thème, onboarding</p>
            </div>
            <Switch checked={preferences.preferences} onCheckedChange={(v) => setPreferences({ ...preferences, preferences: v })} />
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={refuseAll}>
            Refuser tout
          </Button>
          <Button size="sm" className="flex-1" onClick={saveCustom}>
            Enregistrer
          </Button>
        </div>
      </div>
    </div>
  );
}
