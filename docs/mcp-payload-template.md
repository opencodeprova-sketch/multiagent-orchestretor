# MCP Payload Template

## 1. Scopo
Template pronti all'uso per creare payload MCP conformi allo schema.

## 2. Template Task Nuovo (Direttore Generale)
```json
{
  "task_id": "TASK-XXX",
  "phase": "X",
  "objective": "[Obiettivo chiaro e verificabile]",
  "role": "DirettoreGenerale",
  "input": {
    "idea": "[Descrizione idea o requisito]",
    "constraints": ["[Vincolo 1]", "[Vincolo 2]"],
    "context": "[Contesto aggiuntivo opzionale]"
  },
  "state": "DRAFT",
  "created_ts": "2026-07-XXTHH:MM:SSZ",
  "depends_on": [],
  "outputs": {},
  "log": []
}
```

## 3. Template Task Dipendente
```json
{
  "task_id": "TASK-XXX",
  "phase": "X",
  "objective": "[Obiettivo che dipende da task precedente]",
  "role": "DirettoreGenerale",
  "input": {
    "pdr_ref": "TASK-XXX",
    "phases_requested": [Numero],
    "specifics": "[Dettagli specifici]"
  },
  "state": "READY_TO_SEND",
  "created_ts": "2026-07-XXTHH:MM:SSZ",
  "depends_on": ["TASK-XXX"],
  "outputs": {},
  "log": []
}
```

## 4. Template Task Esecuzione (OpenCode Executor)
```json
{
  "task_id": "TASK-XXX",
  "phase": "X",
  "objective": "[Implementare / Correggere / Testare X]",
  "role": "OpenCodeExecutor",
  "input": {
    "spec_ref": "TASK-XXX",
    "files_to_modify": ["[path/file1]", "[path/file2]"],
    "acceptance_criteria": ["[Criterio 1]", "[C", "[Criterio 2]"]
  },
  "state": "IN_PROGRESS",
  "created_ts": "2026-07-XXTHH:MM:SSZ",
  "depends_on": ["TASK-XXX"],
  "outputs": {},
  "log": []
}
```

## 5. Template Task Test
```json
{
  "task_id": "TASK-XXX",
  "phase": "X",
  "objective": "[Verificare che X funzioni correttamente]",
  "role": "Tester",
  "input": {
    "test_target": "TASK-XXX",
    "test_type": "unit|integration|e2e|contract",
    "expected_outcomes": ["[Outcome 1]", "[Outcome 2]"]
  },
  "state": "READY_TO_SEND",
  "created_ts": "2026-07-XXTHH:MM:SSZ",
  "depends_on": ["TASK-XXX"],
  "outputs": {},
  "log": []
}
```

## 6. Template Risposta Coordinatore (ACK)
```json
{
  "task_id": "TASK-XXX",
  "phase": "X",
  "objective": "Validazione payload TASK-XXX",
  "role": "Coordinatore",
  "input": {
    "validated_task": "TASK-XXX",
    "validation_result": "ACK"
  },
  "state": "VALIDATED",
  "created_ts": "2026-07-XXTHH:MM:SSZ",
  "depends_on": ["TASK-XXX"],
  "outputs": {
    "validation": "ACK",
    "notes": "[Note opzionali]"
  },
  "log": [
    {
      "ts": "2026-07-XXTHH:MM:SSZ",
      "actor": "Coordinatore",
      "event": "VALIDATION_PASSED",
      "task_id": "TASK-XXX",
      "output": "ACK"
    }
  ]
}
```

## 7. Template Risposta Coordinatore (NEEDS_FIX)
```json
{
  "task_id": "TASK-XXX",
  "phase": "X",
  "objective": "Validazione payload TASK-XXX - fix richiesti",
  "role": "Coordinatore",
  "input": {
    "validated_task": "TASK-XXX",
    "validation_result": "NEEDS_FIX",
    "issues": ["[Issue 1]", "[Issue 2]"]
  },
  "state": "NEEDS_FIX",
  "created_ts": "2026-07-XXTHH:MM:SSZ",
  "depends_on": ["TASK-XXX"],
  "outputs": {
    "validation": "NEEDS_FIX",
    "issues": ["[Issue 1]", "[Issue 2]"]
  },
  "log": [
    {
      "ts": "2026-07-XXTHH:MM:SSZ",
      "actor": "Coordinatore",
      "event": "VALIDATION_FAILED",
      "task_id": "TASK-XXX",
      "output": "NEEDS_FIX",
      "issues": ["[Issue 1]", "[Issue 2]"]
    }
  ]
}
```

## 8. Template Completamento Task
```json
{
  "task_id": "TASK-XXX",
  "phase": "X",
  "objective": "[Obiettivo originale]",
  "role": "[Ruolo esecutore]",
  "input": { ... },
  "state": "COMPLETED",
  "created_ts": "2026-07-XXTHH:MM:SSZ",
  "depends_on": ["..."],
  "outputs": {
    "files_created": ["[path/file1]", "[path/file2]"],
    "files_modified": ["[path/file3]"],
    "summary": "[Sintesi risultato]",
    "test_results": "PASS|FAIL|PARTIAL"
  },
  "log": [
    {
      "ts": "2026-07-XXTHH:MM:SSZ",
      "actor": "[Ruolo]",
      "event": "TASK_EXECUTED",
      "task_id": "TASK-XXX"
    },
    {
      "ts": "2026-07-XXTHH:MM:SSZ",
      "actor": "[Ruolo]",
      "event": "TASK_COMPLETED",
      "task_id": "TASK-XXX",
      "output": "COMPLETED"
    }
  ]
}
```

## 9. Istruzioni uso
1. Copia template appropriato
2. Sostituisci tutti i `[placeholder]`
3. Genera `task_id` sequenziale
4. Imposta `created_ts` a ora corrente ISO8601
5. Compila `depends_on` con task_id reali
6. Valida con Coordinatore prima invio