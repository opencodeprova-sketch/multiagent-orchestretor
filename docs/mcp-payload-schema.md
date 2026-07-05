# MCP Payload Schema

## 1. Scopo
Definisce lo schema JSON canonico per tutti i payload MCP scambiati nel sistema.

## 2. Schema base (task payload)
```json
{
  "task_id": "string",
  "phase": "string",
  "objective": "string",
  "role": "string",
  "input": "object",
  "state": "string",
  "created_ts": "ISO8601",
  "depends_on": ["string"],
  "outputs": "object",
  "log": "array"
}
```

## 3. Campi obbligatori
| Campo | Tipo | Descrizione |
|-------|------|-------------|
| task_id | string | Identificativo univoco (es. TASK-001) |
| phase | string | Fase del progetto (es. "5") |
| objective | string | Obiettivo chiaro e verificabile |
| role | string | Ruolo emittente (DirettoreGenerale, Coordinatore, etc.) |
| input | object | Dati di input specifici del task |
| state | string | Stato corrente (vedi Phase 4) |
| created_ts | string | Timestamp creazione ISO8601 |

## 4. Campi opzionali
| Campo | Tipo | Descrizione |
|-------|------|-------------|
| depends_on | array[string] | Dipendenze da altri task_id |
| outputs | object | Risultati prodotti dal task |
| log | array[object] | Array di entry log (vedi Phase 4) |

## 5. Stati validi (da Phase 4)
- DRAFT
- READY_TO_SEND
- SENT
- IN_PROGRESS
- COMPLETED
- VALIDATED
- NEEDS_FIX
- FAILED
- PASS_TO_TESTER
- PASS
- FAIL

## 6. Ruoli validi
- DirettoreGenerale
- Coordinatore
- Sender
- Tester
- AssemblerReviewer
- OpenCodeExecutor

## 7. Eventi log standard
- TASK_CREATED
- VALIDATION_PASSED
- VALIDATION_FAILED
- TASK_EXECUTED
- TEST_STARTED
- TEST_PASSED
- TEST_FAILED
- INTEGRATION_STARTED
- INTEGRATION_COMPLETED

## 8. Esempio payload completo
```json
{
  "task_id": "TASK-003",
  "phase": "5",
  "objective": "Implementare componente React Dashboard",
  "role": "OpenCodeExecutor",
  "input": {
    "spec_ref": "TASK-002",
    "component": "AgentStatusPanel",
    "props": ["agents", "websocket"]
  },
  "state": "IN_PROGRESS",
  "created_ts": "2026-07-04T22:10:00Z",
  "depends_on": ["TASK-002"],
  "outputs": {},
  "log": [
    {
      "ts": "2026-07-04T22:10:00Z",
      "actor": "OpenCodeExecutor",
      "event": "TASK_EXECUTED",
      "task_id": "TASK-003"
    }
  ]
}
```

## 9. Validazione Coordinatore
Il Coordinatore deve verificare:
- Tutti i campi obbligatori presenti
- task_id univoco
- phase coerente con progetto
- state in elenco validi
- role in elenco validi
- created_ts formato ISO8601 valido
- depends_on riferisce task_id esistenti
- objective non vuoto (> 10 caratteri)