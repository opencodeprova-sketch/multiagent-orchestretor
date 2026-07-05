# Phase 1 - Intake e chiarimento controllato

## 1. Scopo
Questa fase serve a trasformare l’idea iniziale in un brief chiaro, verificabile e pronto per la formalizzazione nel PDR. La documentazione di workflow è più efficace quando definisce passaggi, responsabilità, checklist e output attesi in modo esplicito. [web:240][web:246]

## 2. Obiettivo fase
- chiarire il progetto;
- confermare i confini architetturali;
- chiudere le decisioni minime per la Release 0;
- produrre input stabili per PDR, architettura e routing policy.

## 3. Owner
- Owner primario: Direttore Generale / LocalAI
- Supporto: nessuno
- Validazione finale: Coordinatore
- Verifica finale: Tester

## 4. Input
- idea iniziale del sistema multi-agente;
- regole dello Space;
- ruoli definiti;
- obiettivo della chat;
- decisioni raccolte nella fase di chiarimento.

## 5. Output attesi
- brief chiarito;
- decisioni architetturali minime bloccate;
- confine Release 0 definito;
- regole base di routing;
- base sufficiente per PDR v1.

Un output di fase deve essere osservabile e verificabile, altrimenti la fase non è realmente chiusa. [web:243][web:250]

## 6. Decisioni bloccate
- Direttore Generale = modulo LocalAI con FSM interna
- Primo test = payload MCP simulati
- Coordinatore = validazione strutturale + semantica minima, senza correzione
- OpenCode Release 0 = un solo executor generico
- PDR = YAML macchina + Markdown umano
- Documentazione = aggiornata a ogni task chiuso
- Release 0 = solo progettazione e validazione del flusso

## 7. Checklist fase
- [x] Obiettivo del sistema definito
- [x] Ruoli principali confermati
- [x] Separazione LocalAI / OpenCode / MCP confermata
- [x] Direttore Generale definito
- [x] Strategia test Release 0 definita
- [x] Politica di validazione del Coordinatore definita
- [x] Executor iniziale di OpenCode definito
- [x] Formato PDR definito
- [x] Politica aggiornamento documentazione definita
- [x] Confine Release 0 definito

Le checklist in Markdown rendono le fasi più controllabili e tracciabili, specialmente nei progetti iterativi. [web:245]

## 8. Domande di chiarimento chiuse

| ID | Domanda | Decisione |
|---|---|---|
| Q1 | Direttore Generale monolitico o FSM interna? | FSM interna |
| Q2 | Test simulato o prototipo locale? | Test simulato |
| Q3 | Coordinatore solo struttura o anche semantica? | Struttura + semantica minima |
| Q4 | Un executor o più specialisti? | Un executor generico |
| Q5 | PDR solo YAML o doppio formato? | YAML + Markdown |
| Q6 | Doc a ogni task o fine fase? | A ogni task |
| Q7 | Release 0 solo design o anche implementazione? | Solo design e validazione |

## 9. FSM del Direttore Generale

```text
INTAKE
  ->
CLARIFIER
  ->
PROJECT_DEFINITION
  ->
PDR_BUILDER
  ->
PHASE_PLANNER
  ->
ROUTER
```

### Regola
Si passa allo stato successivo solo se l’output minimo dello stato corrente è completo e verificabile.

## 10. Template payload MCP simulato

```yaml
task_payload:
  task_id: "TASK-0001"
  project_id: "MA-LOCAL-001"
  phase_id: "PHASE-01"
  sender_role: "DirettoreGenerale"
  target_role: "OpenCode.Executor"
  status: "READY_TO_SEND"

  objective: "Eseguire un task definito nella Release 0"
  inputs:
    - "brief chiarito"
    - "regole di validazione"
    - "routing policy"
  constraints:
    - "nessuna auto-correzione"
    - "output strutturato"
    - "scope immutabile"
  expected_outputs:
    - "artifact"
    - "log"
    - "execution_status"
  acceptance_criteria:
    - "payload completo"
    - "output coerente con objective"
    - "esito validabile dal Coordinatore"
```

## 11. Validazione fase

### Coordinatore
Controlla:
- campi obbligatori presenti;
- struttura del payload;
- coerenza semantica minima;
- allineamento tra obiettivo e output atteso.

### Output ammessi
- ACK
- NEEDS_FIX
- PASS_TO_TESTER

## 12. Criterio di chiusura

### PASS
La fase è chiusa se:
- tutte le decisioni bloccanti sono state prese;
- la checklist è completa;
- il PDR può essere scritto senza nuove domande critiche;
- il primo payload MCP simulato è costruibile.

### NEEDS_FIX
La fase non è chiusa se:
- esistono domande architetturali aperte;
- manca almeno una decisione bloccante;
- il payload non è ancora formalizzabile.

I criteri di accettazione devono essere chiari e osservabili, così da permettere una chiusura di fase non ambigua. [web:243]

## 13. Deliverable prodotti dalla fase
### Core (Phase 1-4)
- `pdr-v1.md`
- `architecture-system.md`
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

## 14. Stato finale
- Stato: PASS
- Note: Fase 1 chiusa, base documentale minima presente nello Space

## 15. Prossima fase
Phase 2:
- definizione task model;
- definizione schema payload MCP;
- simulazione del primo flusso end-to-end;
- validazione Coordinatore -> Tester.