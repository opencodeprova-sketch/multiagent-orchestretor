# Task Status Model

## Scopo
Modello standard degli stati task per la Release 0.

| Stato | Significato |
|---|---|
| DRAFT | Task non ancora pronto |
| READY_TO_SEND | Task pronto per invio |
| SENT | Task inviato |
| IN_PROGRESS | Task in esecuzione |
| COMPLETED | Esecuzione completata |
| VALIDATED | Validazione completata |
| NEEDS_FIX | Correzione richiesta |
| FAILED | Esecuzione fallita |
| PASS_TO_TESTER | Pronto per test |
| PASS | Test superato |
| FAIL | Test fallito |

## Regole
- uno stato per volta;
- transizioni esplicite;
- PASS, FAIL e NEEDS_FIX sono stati terminali nel flusso minimo.
