# Phase 5 - Simulazione multi-task minima e test consecutivi

## 1. Scopo
Eseguire la prima simulazione completa con almeno due payload MCP consecutivi per validare il flusso end-to-end definito nelle Phase 1-4.

## 2. Obiettivo fase
- Simulare due task consecutivi con payload MCP completi
- Verificare transizioni di stato corrette
- Validare struttura log e contract test
- Confermare routing policy operativa

## 3. Payload Task 1 - Definizione progetto
```json
{
  "task_id": "TASK-001",
  "phase": "5",
  "objective": "Definire specifica progetto: dashboard monitoraggio agenti",
  "role": "DirettoreGenerale",
  "input": {
    "idea": "Dashboard per visualizzare stati agenti in tempo reale",
    "constraints": ["solo React + Tailwind", "WebSocket per aggiornamenti live"]
  },
  "state": "DRAFT",
  "created_ts": "2026-07-04T22:00:00Z"
}
```

## 4. Payload Task 2 - Suddivisione in fasi
```json
{
  "task_id": "TASK-002",
  "phase": "5",
  "objective": "Suddividere dashboard in fasi implementative",
  "role": "DirettoreGenerale",
  "input": {
    "pdr_ref": "TASK-001",
    "phases_requested": 3
  },
  "state": "READY_TO_SEND",
  "created_ts": "2026-07-04T22:05:00Z",
  "depends_on": ["TASK-001"]
}
```

## 5. Flusso simulato atteso
```
TASK-001: DRAFT → READY_TO_SEND → SENT → IN_PROGRESS → COMPLETED → VALIDATED → PASS_TO_TESTER → PASS
TASK-002: DRAFT → READY_TO_SEND → SENT → IN_PROGRESS → COMPLETED → VALIDATED → PASS_TO_TESTER → PASS
```

## 6. Verifiche contract test
- [ ] Campi obbligatori presenti in entrambi i payload
- [ ] Stati validi secondo Phase 4
- [ ] Objective non vuoto
- [ ] Output coerenti con objective
- [ ] Log non vuoto per ogni transizione
- [ ] Esito finale ammesso (PASS/FAIL/NEEDS_FIX)

## 7. Log atteso (estratto)
```yaml
execution_log:
  - ts: "2026-07-04T22:00:00Z"
    actor: "DirettoreGenerale"
    event: "TASK_CREATED"
    task_id: "TASK-001"
  - ts: "2026-07-04T22:01:00Z"
    actor: "Coordinatore"
    event: "VALIDATION_PASSED"
    task_id: "TASK-001"
    output: "ACK"
  - ts: "2026-07-04T22:05:00Z"
    actor: "DirettoreGenerale"
    event: "TASK_CREATED"
    task_id: "TASK-002"
    depends_on: ["TASK-001"]
  - ts: "2026-07-04T22:06:00Z"
    actor: "Coordinatore"
    event: "VALIDATION_PASSED"
    task_id: "TASK-002"
    output: "ACK"
```

## 8. Criteri PASS fase
- Due payload consecutivi processati senza errori bloccanti
- Transizioni stato conformi a Phase 4
- Log completa e tracciabile
- Contract test passati per entrambi i task
- Nessuna correzione automatica silenziosa

## 9. Output finale
- `phase-5-simulation-result.md` con esito completo
- Log aggregato dei due task
- Report contract test
- Go/No-Go per fase successiva