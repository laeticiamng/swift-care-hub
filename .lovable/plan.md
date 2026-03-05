

# Ajout du secret SECURITY_WEBHOOK_URL

L'Edge Function `csp-report` utilise déjà ce secret pour envoyer des alertes sécurité (violations CSP répétées, patterns d'attaque) vers Slack ou Discord. Il suffit de configurer la valeur.

## Ce qui sera fait

1. **Ajout du secret** `SECURITY_WEBHOOK_URL` via l'outil de secrets — vous saisirez l'URL de votre webhook Slack (`https://hooks.slack.com/services/...`) ou Discord (`https://discord.com/api/webhooks/...`).

2. **Aucun changement de code nécessaire** — le code dans `csp-report/index.ts` et `rate-limit/index.ts` lit déjà `Deno.env.get("SECURITY_WEBHOOK_URL")` et envoie les alertes au format compatible Slack + Discord.

## Où obtenir l'URL

- **Slack** : App Settings → Incoming Webhooks → Create New Webhook → copier l'URL
- **Discord** : Paramètres du canal → Intégrations → Webhooks → Nouveau webhook → copier l'URL

