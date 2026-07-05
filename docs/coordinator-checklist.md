# Coordinator Checklist

## 1. Scopo
Checklist operativa per il Coordinatore per validare ogni payload MCP in ingresso.

## 2. Validazione Strutturale (Obbligatoria)
### Campi sempre obbligatori
- [ ] `task_id` presente e formato corretto (TASK-XXX)
- [ ] `phase` presente e coerente con progetto corrente
- [ ] `objective` presente, non vuoto, > 10 caratteri
- [ ] `role` presente e in elenco ruoli validi
- [ ] `input` presente e oggetto valido
- [ ] `state` presente e in elenco stati validi (Phase 4)
- [ ] `created_ts` presente e formato ISO8601 valido
- [ ] `depends_on` array (vuoto o con task_id esistenti)

### Campi opzionali in ingresso, obbligatori su COMPLETED
- [ ] `outputs` oggetto — **opzionale in ingresso**, **obbligatorio se state=COMPLETED**
- [ ] `log` array — **opzionale in ingresso**, **obbligatorio se state=COMPLETED**

## 3. Validazione Semantica Minima (Obbligatoria)
- [ ] `objective` coerente con `role` e `phase`
- [ ] `input` contiene campi attesi per quel `role`
- [ ] `depends_on` riferisce task completati (state = COMPLETED o VALIDATED)
- [ ] Transizione `state` ammessa (vedi Phase 4 regole)
- [ ] Nessun campo critico mancante per il tipo di task

## 4. Validazione Contesto (Obbligatoria)
- [ ] Task non duplicato (task_id univoco)
- [ ] Dipendenze risolte (task in depends_on hanno esito PASS)
- [ ] Nessun conflitto con task in corso stessi file/risorse
- [ ] `phase` non inferiore a fase corrente progetto

## 5. Output Ammessi (Solo questi tre)
- [ ] **ACK** → Payload valido, procedere
- [ ] **NEEDS_FIX** → Problemi specifici da risolvere, elencati in `issues`
- [ ] **PASS_TO_TESTER** → Task completato, pronto per test

## 6. Azioni Vietate
- [ ] NON correggere automaticamente errori nel payload
- [ ] NON assumere campi mancanti
- [ ] NON modificare `state` senza validazione
- [ ] NON approvare se `depends_on` non risolte

## 7. Log Obbligatorio per Ogni Validazione
```yaml
- ts: "[ISO8601]"
  actor: "Coordinatore"
  event: "VALIDATION_PASSED|VALIDATION_FAILED"
  task_id: "[TASK-XXX]"
  output: "ACK|NEEDS_FIX|PASS_TO_TESTER"
  issues: ["[solo se NEEDS_FIX]"]
```

## 8. Report di Validazione Standard
Al termine di ogni validazione, generare report usando:
- **Template**: `validation-report-template.md`
- **Variante**: 3.1 Coordinatore - Validazione Ingresso
- **Output**: STRUCTURAL + SEMANTIC → ACK | NEEDS_FIX

## 9. Checklist Rapida (Memo)
```
STRUTTURA: task_id | phase | objective | role | input | state | created_ts | depends_on | outputs* | log*
SEMANTICA: objective↔role | input↔role | depends_on risolte | state transition ok
CONTESTO: univoco | dipendenze ok | no conflitti | phase corretta
OUTPUT: solo ACK / NEEDS_FIX / PASS_TO_TESTER
LOG: sempre scritto per validazione
* outputs/log: opzionali in ingresso, obbligatori su COMPLETED
```

## 10. Escalation
Se validazione bloccante non risolvibile → escalation a Direttore Generale con:
- Task_id
- Motivo blocco
- Opzioni proposte