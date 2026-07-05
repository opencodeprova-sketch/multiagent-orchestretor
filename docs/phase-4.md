# Phase 4 - Normalizzazione stati, log e contract test

## 1. Scopo
Questa fase serve a rendere stabile il comportamento del flusso minimo definendo stati standard, formato log e contract test minimi per i payload MCP simulati.

## 2. Obiettivo fase
- definire stati task standard;
- definire struttura log minima;
- definire contract test minimi;
- ridurre ambiguità di validazione.

## 3. Stati standard task
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

## 4. Regole stati
- ogni task ha un solo stato corrente;
- ogni transizione deve essere tracciata;
- gli stati finali sono PASS, FAIL, NEEDS_FIX;
- nessuna transizione implicita.

## 5. Struttura log minima
```yaml
execution_log:
  - ts: "2026-07-04T21:00:00Z"
    actor: "DirettoreGenerale"
    event: "TASK_CREATED"
  - ts: "2026-07-04T21:01:00Z"
    actor: "OpenCode.Executor"
    event: "TASK_EXECUTED"
  - ts: "2026-07-04T21:02:00Z"
    actor: "Coordinatore"
    event: "VALIDATION_PASSED"
```

## 6. Contract test minimi
- presenza campi obbligatori;
- presenza stato valido;
- objective non vuoto;
- outputs coerenti con objective;
- log non vuoto;
- esito finale ammesso.

## 7. Checklist fase
- [ ] elenco stati definito
- [ ] regole di transizione definite
- [ ] formato log definito
- [ ] contract test definiti
- [ ] output finali ammessi definiti

## 8. Criteri PASS
- schema stati approvato;
- formato log approvato;
- contract test riusabili;
- nessuna ambiguità bloccante.

## 9. Prossima fase
Phase 5:
- simulazione multi-task minima;
- test con almeno due payload consecutivi;
- revisione documentazione.
