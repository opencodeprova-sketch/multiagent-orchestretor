# Riepilogo MCP Perplexity - setup completato

## Architettura
OpenCode (agenti) -> MCP stdio -> npx -y perplexity-web-api-mcp (server Rust)
-> api.perplexity.ai (sessione Pro)

## File di registrazione
C:\Users\manue\.config\opencode\opencode.json - sezione mcp.perplexity-web (righe 95-107)

## Stato attuale

| Voce | Valore |
|---|---|
| enabled | true (attivo) |
| Trasporto | stdio locale |
| Comando | npx -y perplexity-web-api-mcp |
| Autenticazione | Token sessione (PERPLEXITY_SESSION_TOKEN + PERPLEXITY_CSRF_TOKEN) |
| API key | Nessuna - usa sessione Pro |

## 4 tool disponibili

| Tool | Tempo | Cosa fa | Usato da |
|---|---|---|---|
| perplexity_search | 3-8s | Cerca web, restituisce link + snippet | Coordinatore |
| perplexity_ask | 3-10s | Risposta AI con citazioni | Coordinatore |
| perplexity_reason | 5-15s | Ragionamento step-by-step | reasoning-specialist |
| perplexity_research | 30-90s | Ricerca multi-fonte approfondita | researcher |

## Policy routing (AGENTS.md)
- search -> Coordinatore (uso libero)
- ask -> Coordinatore (uso libero)
- reason -> reasoning-specialist (solo ragionamento strutturato)
- research -> researcher (solo ricerche approfondite, 30-90s)

## Comandi d'uso (dopo riavvio OpenCode)
- "Cerca su web [X]" -> usa perplexity_search
- "Spiega [Y] con fonti" -> usa perplexity_ask
- "Ragiona su [Z]" -> usa perplexity_reason
- "Ricerca approfondita [W]" -> usa perplexity_research

## Modelli Perplexity (tramite sessione Pro)
Con token Pro attivi, i tool usano sonar-pro (default) o modelli migliori in base alla query. Non serve scegliere - il server sceglie automaticamente.

## Test eseguiti

| Tool | Esito | Risposta |
|---|---|---|
| perplexity_search | OK | Link e snippet su AI news |
| perplexity_ask | OK | "Parigi" (capitale Francia) + "Quattro" (2+2) |
| perplexity_reason | OK | Problema treni: 200km/140km/h = 1.43h |
| perplexity_research | OK | Analisi framework web 2026 con 15 fonti |