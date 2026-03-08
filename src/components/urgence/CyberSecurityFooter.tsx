import { useI18n } from '@/i18n/I18nContext';
import { Shield, Lock, AlertCircle } from 'lucide-react';

export function CyberSecurityFooter() {
  const { t } = useI18n();

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 py-3 px-4 border-t bg-card/50 text-[11px] text-muted-foreground">
      <span className="flex items-center gap-1.5">
        <Lock className="h-3 w-3 text-green-500" />
        <span className="font-medium text-green-600 dark:text-green-400">TLS 1.3</span>
        — {t.cyber.encrypted}
      </span>
      <span className="hidden sm:inline text-muted-foreground/30">|</span>
      <span className="flex items-center gap-1.5">
        <Shield className="h-3 w-3 text-primary" />
        {t.cyber.lastAudit}: <span className="font-medium">2026-02-15</span>
      </span>
      <span className="hidden sm:inline text-muted-foreground/30">|</span>
      <span className="flex items-center gap-1.5">
        <AlertCircle className="h-3 w-3 text-green-500" />
        {t.cyber.incidents}: <span className="font-medium text-green-600 dark:text-green-400">0</span>
        — {t.cyber.secure}
      </span>
    </div>
  );
}
