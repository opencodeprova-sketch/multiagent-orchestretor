# Architecture System

## 1. Scopo
Questo documento descrive l’architettura di riferimento del sistema multi-agente locale basato su LocalAI, OpenCode e MCP. La documentazione architetturale deve chiarire struttura, componenti, flussi e responsabilità, restando sintetica, aggiornata e coerente con l’evoluzione del sistema. [web:208][web:219]

## 2. Obiettivo architetturale
L’obiettivo è costruire un sistema modulare, progressivo e testabile che separi in modo netto direzione, esecuzione, trasporto, test e revisione. La scelta architetturale privilegia semplicità iniziale, tracciabilità dei task e validazione del flusso minimo prima dell’aumento di complessità. [web:219][web:222]

## 3. Componenti principali

| Componente | Ruolo | Responsabilità |
|---|---|---|
| LocalAI | Direzione | Intake, chiarimento, definizione progetto, PDR, pianificazione fasi, routing |
| OpenCode | Esecuzione | Esecuzione operativa dei task assegnati |
| MCP | Trasporto | Passaggio strutturato di payload, task e risultati |
| Coordinatore | Validazione | Controllo struttura e coerenza semantica minima |
| Tester | Verifica | Test del flusso e validazione output |
| Assembler / Reviewer | Integrazione finale | Assemblaggio e controllo complessivo |

La documentazione di architettura è più utile quando descrive i componenti e le loro interazioni in modo chiaro, con separazione tra vista concettuale e vista operativa. [web:210][web:215]

## 4. Architettura logica

### 4.1 LocalAI
LocalAI è il livello di direzione e orchestrazione. Decide il flusso, controlla lo stato globale del progetto e assegna i task al livello operativo corretto.

### 4.2 OpenCode
OpenCode è il livello esecutivo. Nella Release 0 usa un solo executor generico, per minimizzare complessità, debugging e costi di coordinamento.

### 4.3 MCP
MCP è il canale strutturato di scambio tra componenti. Non prende decisioni di business e non sostituisce l’orchestrazione: trasporta payload, capability e risultati tra i nodi del sistema. [web:208][web:222]

## 5. Direttore Generale

Il Direttore Generale è implementato come modulo LocalAI con FSM interna. Questa scelta migliora controllo, tracciabilità e validazione delle transizioni rispetto a un singolo prompt monolitico. [web:219]

### FSM interna
- INTAKE
- CLARIFIER
- PROJECT_DEFINITION
- PDR_BUILDER
- PHASE_PLANNER
- ROUTER

### Regola
Ogni stato produce un output verificabile e abilita il passaggio allo stato successivo solo se i dati minimi richiesti sono completi. [web:208][web:219]

## 6. Flusso operativo

```text
Utente
  ->
LocalAI / Direttore Generale
  ->
Definizione progetto
  ->
PDR
  ->
Pianificazione fasi
  ->
Routing task
  ->
MCP payload
  ->
OpenCode executor
  ->
Coordinatore
  ->
Tester
  ->
Documentazione aggiornata
  ->
Assembler / Reviewer finale
```

Un buon documento architetturale deve mostrare il flusso principale con una rappresentazione semplice e leggibile, evitando dettagli eccessivi nelle prime versioni. [web:211][web:220]

## 7. Validazione

### 7.1 Coordinatore
Il Coordinatore valida:
- struttura del payload;
- campi obbligatori;
- coerenza semantica minima tra objective, inputs e acceptance criteria.

Il Coordinatore non corregge mai automaticamente gli errori. Può solo restituire:
- ACK
- NEEDS_FIX
- PASS_TO_TESTER

### 7.2 Tester
Il Tester verifica il flusso minimo end-to-end e produce un esito esplicito PASS o FAIL. [web:222][web:219]

## 8. Release 0

### Decisioni bloccate
- solo progettazione e validazione del flusso;
- test su payload MCP simulati;
- nessuna implementazione reale dei moduli base;
- un solo executor generico in OpenCode;
- documentazione aggiornata a ogni task chiuso.

La documentazione architetturale deve riflettere lo stato reale del sistema e va trattata come asset vivo, aggiornato insieme al progetto. [web:219][web:208]

## 9. Integrazioni esterne

### Perplexity MCP
Perplexity via MCP è una capability premium esterna disponibile per:
- ricerca web;
- risposta con fonti;
- reasoning strutturato;
- research approfondita.

Questa integrazione non sostituisce LocalAI né OpenCode, ma viene usata come servizio specialistico on-demand. [web:208]

Documento collegato:
- `perplexity-mcp-integration.md`

## 10. Documenti correlati
### Core (Phase 1-4)
- `pdr-v1.md`
- `routing-policy.md`
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

## 11. Regole di manutenzione
- aggiornare questo documento quando cambia l’architettura;
- non duplicare dettagli presenti in altri documenti;
- mantenere separati architettura, policy, integrazioni e fasi;
- usare questo file come vista architetturale di riferimento. [web:219][web:212]