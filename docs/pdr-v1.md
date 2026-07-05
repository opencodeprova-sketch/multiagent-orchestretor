# PDR v1 - Sistema multi-agente locale LocalAI / OpenCode / MCP

## 1. Identificazione
- Project ID: MA-LOCAL-001
- Nome progetto: Sistema multi-agente locale LocalAI / OpenCode / MCP
- Versione: v1.0
- Stato: Draft attivo
- Owner: Direttore Generale
- Fonte di verità: PDR

## 2. Obiettivo
Costruire un sistema multi-agente locale modulare, progressivo e testabile che separi chiaramente direzione, esecuzione, test e revisione.

## 3. Principi architetturali
- LocalAI = direzione, pianificazione e smistamento
- OpenCode = esecuzione con agenti specialisti
- MCP = canale strutturato di passaggio dei payload e dei task
- Prima si chiarisce, poi si pianifica, poi si esegue
- Prima di aumentare la complessità, si testa sempre il flusso minimo

## 4. Ruoli
### 4.1 Direttore Generale
- Ascolta l’idea
- Fa domande di chiarimento
- Definisce il progetto
- Prepara il PDR
- Divide il lavoro in fasi
- Decide cosa va su LocalAI e cosa va su OpenCode

### 4.2 Coordinatore
- Riceve payload via MCP
- Valida struttura e coerenza semantica minima
- Risponde con ACK, NEEDS_FIX o PASS_TO_TESTER
- Non corregge automaticamente gli errori

### 4.3 Sender
- Invia payload strutturati
- Mantiene input, output e responsabilità chiari

### 4.4 Tester
- Verifica che flusso e risultato siano corretti
- Restituisce esito esplicito

### 4.5 Assembler / Reviewer finale
- Integra i pezzi finiti
- Controlla il progetto completo

## 5. Scope
### In scope
- Definizione del Direttore Generale
- PDR
- Divisione in fasi
- Separazione LocalAI / OpenCode
- Payload MCP strutturati
- Flusso minimo end-to-end
- Test e documentazione

### Out of scope
- Automazione complessa non testata
- Correzione automatica degli errori
- Aumento prematuro della complessità
- Implementazione reale dei moduli base nella release 0

## 6. Release 0
- Solo progettazione e validazione del flusso
- Nessuna implementazione reale dei moduli base
- Test end-to-end solo su payload MCP simulati
- OpenCode con un solo executor generico
- Direttore Generale come modulo LocalAI con FSM interna
- Documentazione aggiornata a ogni task chiuso

## 7. PDR machine-readable
```yaml
pdr:
  project_id: "MA-LOCAL-001"
  name: "Sistema multi-agente locale LocalAI / OpenCode / MCP"
  version: "1.0"
  status: "draft_active"
  source_of_truth: "PDR"

  objective: >
    Costruire un sistema multi-agente locale modulare, progressivo e testabile
    che separi chiaramente direzione, esecuzione, test e revisione.

  architecture:
    localai: "direzione, pianificazione e smistamento"
    opencode: "esecuzione con agente unico generico nella release 0"
    mcp: "canale strutturato per payload e task"

  director_general:
    model: "localai_module"
    fsm_states:
      - INTAKE
      - CLARIFIER
      - PROJECT_DEFINITION
      - PDR_BUILDER
      - PHASE_PLANNER
      - ROUTER

  coordinator:
    validation:
      structural: true
      semantic_minimal: true
      auto_correction: false
    allowed_outputs:
      - ACK
      - NEEDS_FIX
      - PASS_TO_TESTER

  opencode:
    release_0_executor_count: 1
    executor_type: "generic"

  release_0:
    focus:
      - "design only"
      - "flow validation"
      - "simulated MCP payload tests"
    exclude:
      - "real module implementation"
      - "complex multi-agent specialization"
```

## 8. Success metrics
- Ogni task ha owner, input, output, stato e acceptance criteria
- Ogni fase produce un output verificabile
- Il flusso minimo passa con esito chiaro
- Nessun errore viene corretto in modo silenzioso
- La documentazione resta coerente con lo stato del progetto

## 9. Open questions
- Nessuna critica bloccante per Release 0
- Eventuali estensioni future solo dopo validazione del flusso base

## 10. Documentazione collegata
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