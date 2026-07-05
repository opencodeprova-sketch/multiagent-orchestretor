# Routing Policy

## 1. Scopo
Questo documento definisce le regole di routing del sistema multi-agente locale tra LocalAI, OpenCode e MCP. Una routing policy efficace deve essere deterministica, leggibile e semplice da debuggare, specialmente nelle prime versioni del sistema. [web:105][web:229]

## 2. Principio generale
Il routing è governato da LocalAI attraverso il Direttore Generale. OpenCode non decide il routing globale e MCP non prende decisioni architetturali: trasporta soltanto i payload tra i componenti del sistema. [web:105][web:231]

## 3. Regola madre
- Un solo componente decide il routing: LocalAI.
- Un solo componente parla direttamente con l’utente: il livello di direzione.
- I worker eseguono soltanto i task assegnati.
- Il Coordinatore valida, ma non riassegna.
- MCP trasporta, ma non orchestra. [web:230][web:105]

## 4. Routing per ruolo

| Ruolo | Può ricevere | Può decidere | Può rispondere all’utente |
|---|---|---|---|
| LocalAI / Direttore Generale | idee, chiarimenti, stato progetto | sì | sì |
| OpenCode / Executor | task esecutivi | no | no |
| Coordinatore | payload e deliverable | no | no |
| Tester | deliverable validati | no | no |
| MCP | payload strutturati | no | no |

Una buona policy di routing assegna a ogni componente un ambito unico e non sovrapposto, così da evitare conflitti di responsabilità e routing ambiguo. [web:230][web:105]

## 5. Regole di instradamento

### 5.1 Verso LocalAI
Instradare a LocalAI quando il task riguarda:
- intake iniziale;
- domande di chiarimento;
- definizione del progetto;
- aggiornamento del PDR;
- divisione in fasi;
- assegnazione di responsabilità;
- decisioni architetturali;
- priorità e dipendenze.

### 5.2 Verso OpenCode
Instradare a OpenCode quando il task riguarda:
- esecuzione operativa;
- produzione di artifact;
- trasformazione di input in output tecnici;
- lavoro specialistico già definito;
- validazione tecnica locale limitata al task. [web:231][web:105]

### 5.3 Verso Coordinatore
Instradare al Coordinatore quando esiste un payload o deliverable da validare rispetto a:
- struttura;
- campi obbligatori;
- coerenza semantica minima;
- stato di avanzamento del task.

### 5.4 Verso Tester
Instradare al Tester quando:
- il Coordinatore ha restituito PASS_TO_TESTER;
- il deliverable è pronto per verifica;
- il task richiede esito PASS o FAIL esplicito. [web:230][web:229]

## 6. Regole di non-routing
Non instradare:
- task ambigui verso OpenCode;
- payload incompleti verso MCP;
- deliverable non validati verso Tester;
- decisioni di business verso OpenCode;
- compiti di esecuzione verso LocalAI se già formalizzati. [web:105][web:231]

## 7. Routing nella Release 0

### Stato iniziale
Nella Release 0 il routing è minimo e controllato:
- un solo Direttore Generale;
- un solo executor generico in OpenCode;
- Coordinatore separato;
- Tester separato;
- payload MCP simulati;
- nessuna specializzazione avanzata. [web:229][web:231]

### Obiettivo
Ridurre i punti di errore e rendere il flusso facile da validare e documentare. I sistemi supervisor-worker funzionano meglio quando il routing iniziale è semplice, deterministico e osservabile. [web:105][web:225]

## 8. Routing Perplexity MCP

### Capability premium esterna
Perplexity via MCP è trattata come integrazione specialistica richiamabile on-demand. Non sostituisce né il Direttore Generale né l’executor base.

### Regole
- `search` -> Coordinatore
- `ask` -> Coordinatore
- `reason` -> reasoning-specialist
- `research` -> researcher

### Vincolo
L’uso di Perplexity va attivato solo quando aumenta qualità, chiarezza o copertura informativa del task. Le architetture multi-agente efficienti usano sub-agent o capacità esterne solo quando il valore supera il costo di coordinazione. [web:229][web:230]

## 9. Routing decision tree

```text
Se il task è ambiguo o incompleto
  -> LocalAI / CLARIFIER

Se il task richiede definizione, piano o assegnazione
  -> LocalAI / PROJECT_DEFINITION o PHASE_PLANNER

Se il task è esecutivo e già definito
  -> OpenCode / Executor

Se il task produce un payload o deliverable da controllare
  -> Coordinatore

Se il deliverable è validato
  -> Tester

Se il task richiede ricerca esterna o review premium
  -> Perplexity MCP capability appropriata
```

Le policy più robuste usano regole esplicite e verificabili, invece di routing implicito o creativo, perché questo riduce errori e rende il comportamento ripetibile. [web:105][web:229]

## 10. Output ammessi per stato

| Componente | Output ammessi |
|---|---|
| LocalAI | brief, PDR, fase, task, routing decision |
| OpenCode | artifact, log, stato esecuzione |
| Coordinatore | ACK, NEEDS_FIX, PASS_TO_TESTER |
| Tester | PASS, FAIL, test log |
| Perplexity MCP | search result, answer, reasoning, research report |

## 11. Vincoli di controllo
- Nessun worker può cambiare lo scope.
- Nessun worker può rispondere direttamente all’utente.
- Nessun componente può correggere automaticamente errori bloccanti.
- Ogni handoff deve avvenire con payload strutturato.
- Ogni cambio di routing deve essere tracciabile. [web:230][web:227]

## 12. Manutenzione
- aggiornare questa policy quando cambia il numero di agenti;
- aggiornare questa policy quando cambia una capability MCP;
- mantenere separato il routing da architettura e PDR;
- trattare il documento come policy viva e versionata. [web:227][web:234]

## 13. Documenti collegati
### Core (Phase 1-4)
- `pdr-v1.md`
- `architecture-system.md`
- `task-status-model.md`
- `phase-1.md`
- `phase-2.md`
- `phase-3.md`
- `phase-4.md`
- `perplexity-mcp-integration.md`

### Operational (Phase 5)
- `phase-5.md`
- `mcp-payload-schema.md`
- `mcp-payload-template.md`
- `coordinator-checklist.md`
- `tester-checklist.md`
- `project-status-log.md`
- `package-index.md`
- `validation-report-template.md`
- `first-end-to-end-test.md`