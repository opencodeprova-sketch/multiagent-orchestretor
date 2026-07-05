# First End-to-End Test

## 1. Scopo
Documentare il primo test end-to-end reale del flusso minimo: Direttore → Coordinatore → Executor → Tester → Reviewer.

## 2. Obiettivo Test
Validare che il flusso completo definito nelle Phase 1-5 funzioni con payload MCP reali.

## 3. Scenario di Test
**Progetto**: "Agent Status Dashboard" - Componente React per monitoraggio stati agenti
**Fasi coinvolte**: 5 (simulazione multi-task consecutivi)

## 4. Payload Sequenza

### Task 1: Definizione Progetto (Direttore Generale)
```json
{
  "task_id": "TASK-001",
  "phase": "5",
  "objective": "Definire specifica: dashboard React per stati agenti real-time",
  "role": "DirettoreGenerale",
  "input": {
    "idea": "Dashboard singolo componente mostra stati 5 agenti via WebSocket",
    "constraints": ["React 18 + Tailwind", "WebSocket nativo", "Nessuna libreria stato esterna"],
    "acceptance_criteria": [
      "Componente AgentStatusPanel renderizza 5 agenti",
      "Stati aggiornati via WebSocket < 500ms",
      "Colore per stato: verde=attivo, giallo=occupato, rosso=errore"
    ]
  },
  "state": "DRAFT",
  "created_ts": "2026-07-04T23:00:00Z",
  "depends_on": [],
  "outputs": {},
  "log": []
}
```

### Task 2: Suddivisione Fasi (Direttore Generale)
```json
{
  "task_id": "TASK-002",
  "phase": "5",
  "objective": "Suddividere dashboard in 3 fasi implementative",
  "role": "DirettoreGenerale",
  "input": {
    "pdr_ref": "TASK-001",
    "phases_requested": 3,
    "phase_breakdown": {
      "Fase 1": "Componente base + mock data",
      "Fase 2": "Integrazione WebSocket reale",
      "Fase 3": "Styling Tailwind + animazioni stati"
    }
  },
  "state": "READY_TO_SEND",
  "created_ts": "2026-07-04T23:05:00Z",
  "depends_on": ["TASK-001"],
  "outputs": {},
  "log": []
}
```

### Task 3: Implementazione Fase 1 (OpenCode Executor)
```json
{
  "task_id": "TASK-003",
  "phase": "5",
  "objective": "Implementare AgentStatusPanel con mock data",
  "role": "OpenCodeExecutor",
  "input": {
    "spec_ref": "TASK-002",
    "phase": "Fase 1",
    "files_to_create": [
      "src/components/AgentStatusPanel.tsx",
      "src/components/AgentStatusPanel.test.tsx"
    ],
    "acceptance_criteria": [
      "Componente renderizza 5 card agente",
      "Mock data: 3 attivi, 1 occupato, 1 errore",
      "TypeScript strict mode passa",
      "Test unitario: render + conteggio stati"
    ]
  },
  "state": "IN_PROGRESS",
  "created_ts": "2026-07-04T23:10:00Z",
  "depends_on": ["TASK-002"],
  "outputs": {},
  "log": []
}
```

### Task 4: Test Fase 1 (Tester)
```json
{
  "task_id": "TASK-004",
  "phase": "5",
  "objective": "Verificare implementazione Fase 1",
  "role": "Tester",
  "input": {
    "test_target": "TASK-003",
    "test_type": "unit",
    "test_commands": [
      "npm run typecheck",
      "npm test -- AgentStatusPanel"
    ],
    "expected_outcomes": [
      "TypeScript: 0 errori",
      "Test: 2 passed (render, state count)",
      "Coverage: > 80% component"
    ]
  },
  "state": "READY_TO_SEND",
  "created_ts": "2026-07-04T23:20:00Z",
  "depends_on": ["TASK-003"],
  "outputs": {},
  "log": []
}
```

## 5. Flusso Stati Atteso
```
TASK-001: DRAFT → READY_TO_SEND → SENT → IN_PROGRESS → COMPLETED → VALIDATED → PASS_TO_TESTER → PASS
TASK-002: DRAFT → READY_TO_SEND → SENT → IN_PROGRESS → COMPLETED → VALIDATED → PASS_TO_TESTER → PASS
TASK-003: DRAFT → READY_TO_SEND → SENT → IN_PROGRESS → COMPLETED → VALIDATED → PASS_TO_TESTER → PASS
TASK-004: DRAFT → READY_TO_SEND → SENT → IN_PROGRESS → COMPLETED → VALIDATED → PASS
```

## 6. Validazioni per Step

### Step 1: Coordinatore valida TASK-001
- [ ] Struttura payload corretta
- [ ] Objective chiaro, acceptance_criteria presenti
- [ ] State DRAFT → READY_TO_SEND ok
- [ ] Output: ACK

### Step 2: Coordinatore valida TASK-002
- [ ] depends_on TASK-001 = COMPLETED
- [ ] Phase breakdown coerente
- [ ] Output: ACK

### Step 3: Executor esegue TASK-003
- [ ] Crea file specificati
- [ ] Mock data implementato
- [ ] TypeScript passa
- [ ] State: COMPLETED

### Step 4: Coordinatore valida TASK-003
- [ ] File creati esistono
- [ ] Outputs.files_created match
- [ ] Output: PASS_TO_TESTER

### Step 5: Tester esegue TASK-004
- [ ] Typecheck: 0 errori
- [ ] Unit test: 2 passed
- [ ] Output: PASS

### Step 6: Reviewer finale
- [ ] Tutti e 4 task PASS
- [ ] Documentazione aggiornata
- [ ] Integrazione pronta

## 7. Criteri PASS Test E2E
- [ ] Tutti e 4 task completano con esito PASS
- [ ] Nessun task in NEEDS_FIX o FAIL
- [ ] Transizioni stato conformi Phase 4
- [ ] Log completa per ogni task
- [ ] Contract test passati per ogni payload
- [ ] File prodotti compilano e test passano
- [ ] Tempo totale < 30 min (simulato)

## 8. Metriche Raccolta
| Metrica | Target | Reale |
|---------|--------|-------|
| Task totali | 4 | - |
| Task PASS | 4 | - |
| Task NEEDS_FIX | 0 | - |
| Task FAIL | 0 | - |
| Tempo setup | < 5 min | - |
| Tempo esecuzione | < 20 min | - |
| Validazioni Coordinatore | 3 | - |
| Test eseguiti | 1 suite | - |

## 9. Report Finale Atteso
```markdown
# E2E Test Report - 2026-07-04

## Summary
- **Status**: PASS
- **Duration**: XX min
- **Tasks**: 4/4 PASS
- **Blocking Issues**: 0

## Task Details
- TASK-001: PASS (Direttore definizione)
- TASK-002: PASS (Direttore suddivisione)
- TASK-003: PASS (Executor implementazione)
- TASK-004: PASS (Tester verifica)

## Artifacts Created
- src/components/AgentStatusPanel.tsx
- src/components/AgentStatusPanel.test.tsx

## Validation Log
[link to aggregated log]

## Go/No-Go
✅ GO - Flusso minimo validato, pronto per Phase 6
```

## 10. Esecuzione
Questo test DEVE essere eseguito dopo completamento Phase 5 docs e prima di qualsiasi Phase 6.

**Comando avvio**: (da definire con orchestratore reale)
```bash
# Simulazione: ogni task processato manualmente seguendo checklist
# Reale: orchestrator avvia sequenza automatica
```

## 11. Rollback Criteria
Se QUALSIASI task FAIL → Interrompere, analizzare, fixare, rieseguire da task fallito.