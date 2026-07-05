# Tester Checklist

## 1. Scopo
Checklist operativa per il Tester per verificare correttezza esecuzione task.

## 2. Pre-condizioni (Prima di iniziare)
- [ ] Task in stato `PASS_TO_TESTER` (validato da Coordinatore)
- [ ] `outputs` del task **popolati** con risultati dichiarati (obbligatorio per test)
- [ ] `log` **completa** fino a `TASK_COMPLETED` (obbligatorio per test)
- [ ] Accesso a file/risorse indicate in `outputs.files_created/modified`
- [ ] Criteri di accettazione chiari (da `input.acceptance_criteria.acceptance_criteria` o PDR)

## 3. Verifica Esecuzione (Obbligatoria)
- [ ] File creati esistono nei path dichiarati
- [ ] File modificati mostrano cambiamenti attesi
- [ ] Codice compila/build senza errori
- [ ] Nessun regresso su funzionalità esistenti (smoke test)
- [ ] Output coerente con `objective` dichiarato

## 4. Test Funzionali (Per tipo task)
### Implementazione
- [ ] Unit test passano (se previsti)
- [ ] Integration test passano (se previsti)
- [ ] Criteri accettazione tutti soddisfatti
- [ ] Edge cases gestiti (empty, null, boundary)

### Correzione Bug
- [ ] Bug riprodotto prima della fix
- [ ] Fix risolve il bug (test di regressione passa)
- [ ] Nessun nuovo bug introdotto

### Refactoring
- [ ] Comportamento identico pre/post refactor
- [ ] Test suite completa passa
- [ ] Performance non degradate

## 5. Test Contrattuali (Contract Test - Phase 4)
- [ ] Campi obbligatori payload presenti
- [ ] Stato finale in {PASS, FAIL, NEEDS_FIX}
- [ ] Objective non vuoto
- [ ] Outputs coerenti con objective
- [ ] Log non vuoto
- [ ] Esito finale ammesso

## 6. Verifica Documentazione
- [ ] README/CHANGELOG aggiornati se necessario
- [ ] Commenti codice per logiche complesse
- [ ] Nessun `TODO`/`FIXME` non giustificato

## 7. Output Test (Solo questi tre)
- [ ] **PASS** → Tutto corretto, task chiudibile
- [ ] **FAIL** → Problemi bloccanti, task torna a NEEDS_FIX
- [ ] **PARTIAL** → Funziona ma con caveat documentati

## 8. Log Obbligatorio
```yaml
- ts: "[ISO8601]"
  actor: "Tester"
  event: "TEST_STARTED|TEST_PASSED|TEST_FAILED"
  task_id: "[TASK-XXX]"
  test_type: "unit|integration|e2e|contract|smoke"
  result: "PASS|FAIL|PARTIAL"
  notes: "[dettagli se FAIL/PARTIAL]"
```

## 9. Report di Validazione Standard
Al termine di ogni test, generare report usando:
- **Template**: `validation-report-template.md`
- **Variante**: 3.2 Tester - Validazione Esecuzione
- **Output**: FUNCTIONAL + CONTRACT → PASS | FAIL | PARTIAL

## 10. Checklist Rapida (Memo)
```
PRE: PASS_TO_TESTER | outputs popolati (obbligatori) | log completa (obbligatoria) | accesso file
EXEC: file esistono | build ok | no regressioni | objective match
FUNC: unit ok | integration ok | acceptance ok | edge cases
CONTRACT: campi obbligatori | stato valido | objective | outputs | log | esito
DOC: readme | commenti | no TODO non giustificati
OUTPUT: solo PASS / FAIL / PARTIAL
LOG: sempre scritto per test
```

## 11. Escalation
Se test bloccanti → task torna a `NEEDS_FIX` con:
- Task_id
- Elenco test falliti
- Dettagli errori
- Suggerimenti fix