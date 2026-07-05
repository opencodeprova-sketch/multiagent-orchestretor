# Validation Report Template

## 1. Scopo
Template standard per report di validazione formale (Coordinatore, Tester, Reviewer).

## 2. Struttura Report
```markdown
# Validation Report - [TASK-XXX]

## 1. Metadata
- **Task ID**: TASK-XXX
- **Phase**: X
- **Validator**: [Coordinatore|Tester|Reviewer]
- **Validation Date**: 2026-07-XXTHH:MM:SSZ
- **Validation Type**: STRUCTURAL|SEMANTIC|FUNCTIONAL|CONTRACT|FINAL

## 2. Payload Validato
```json
{ ... payload completo ... }
```

## 3. Checklist Eseguita
- [ ] Check 1: [descrizione] - PASS/FAIL
- [ ] Check 2: [descrizione] - PASS/FAIL
- [ ] Check N: [descrizione] - PASS/FAIL

## 4. Risultati Dettagliati

### 4.1 Validazione Strutturale
| Campo | Atteso | Reale | Esito |
|-------|--------|-------|-------|
| task_id | TASK-XXX | TASK-XXX | ✅ |
| phase | "5" | "5" | ✅ |
| objective | non vuoto | "Implementare..." | ✅ |
| ... | ... | ... | ... |

### 4.2 Validazione Semantica
| Regola | Verifica | Esito | Note |
|--------|----------|-------|------|
| objective↔role coerenza | DirettoreGenerale + definizione | ✅ | |
| depends_on risolte | TASK-001 COMPLETED | ✅ | |
| state transition | DRAFT → READY_TO_SEND | ✅ | |

### 4.3 Validazione Funzionale (se Tester)
| Test | Input | Expected | Actual | Esito |
|------|-------|----------|--------|-------|
| Unit test | ... | PASS | PASS | ✅ |
| Integration | ... | PASS | FAIL | ❌ |

### 4.4 Contract Test (Phase 4)
| Criterio | Verifica | Esito |
|----------|----------|-------|
| Campi obbligatori | Tutti presenti | ✅ |
| Stato valido | IN_PROGRESS in elenco | ✅ |
| Objective non vuoto | 45 char | ✅ |
| Outputs coerenti | File creati = dichiarati | ✅ |
| Log non vuoto | 3 entry | ✅ |
| Esito ammesso | PASS | ✅ |

## 5. Issues Riscontrate
| ID | Severità | Descrizione | File/Riga | Suggerimento Fix |
|----|----------|-------------|-----------|------------------|
| V-001 | BLOCKER | Campo `depends_on` riferimento inesistente | payload.json:15 | Correggere task_id |
| V-002 | WARNING | Log entry manca timestamp | log.yaml:3 | Aggiungere ts ISO8601 |

**Severità**: BLOCKER | WARNING | INFO

## 6. Esito Finale
- **VALIDATION RESULT**: PASS | NEEDS_FIX | FAIL

### Se PASS:
- Task approvato per fase successiva
- Prossimo stato suggerito: [VALIDATED|PASS_TO_TESTER|COMPLETED]

### Se NEEDS_FIX:
- Task torna a emittente con issues elenco
- Bloccanti da risolvere: [N]
- Warning da considerare: [N]
- Deadline fix suggerita: [data]

### Se FAIL:
- Task respinto
- Motivo: [descrizione]
- Richiede riesame architetturale/PRD

## 7. Note Validatore
[Note libere, osservazioni, raccomandazioni]

## 8. Firma
- **Validator**: [Nome/Ruolo]
- **Timestamp**: 2026-07-XXTHH:MM:SSZ
- **Next Review**: [se applicabile]
```

## 3. Template Varianti

### 3.1 Coordinatore - Validazione Ingresso
- Type: STRUCTURAL + SEMANTIC
- Output: ACK | NEEDS_FIX
- Focus: Campi obbligatori, coerenza role/input, depends_on, state transition

### 3.2 Tester - Validazione Esecuzione
- Type: FUNCTIONAL + CONTRACT
- Output: PASS | FAIL | PARTIAL
- Focus: File esistono, build ok, test passano, criteria accettazione

### 3.3 Reviewer - Validazione Finale
- Type: FINAL (tutti i tipi)
- Output: PASS | NEEDS_FIX
- Focus: Completezza, coerenza architetturale, documentazione, integrazione

## 4. Regole Compilazione
- [ ] Usa template appropriato per ruolo
- [ ] Compila TUTTE le sezioni (N/A se non applicabile)
- [ ] Issues: una per riga, severità esplicita
- [ ] Esito finale UNA sola opzione
- [ ] Timestamp ISO8601 obbligatorio
- [ ] Allega payload validato (sezione 2)

## 5. Esempio Compilato (Coordinatore)
```markdown
# Validation Report - TASK-003

## 1. Metadata
- Task ID: TASK-003
- Phase: 5
- Validator: Coordinatore
- Validation Date: 2026-07-04T22:15:00Z
- Validation Type: STRUCTURAL+SEMANTIC

## 3. Checklist
- [x] task_id formato corretto - PASS
- [x] phase coerente - PASS
- [x] objective non vuoto - PASS
- [x] role valido - PASS
- [x] input ha spec_ref - PASS
- [x] state IN_PROGRESS valido - PASS
- [x] created_ts ISO8601 - PASS
- [x] depends_on TASK-002 COMPLETED - PASS
- [x] state transition READY_TO_SEND→IN_PROGRESS ok - PASS

## 4.2 Semantica
| Regola | Verifica | Esito |
|--------|----------|-------|
| objective↔role | OpenCodeExecutor + implementazione | ✅ |
| depends_on | TASK-002 COMPLETED | ✅ |

## 5. Issues: NESSUNA

## 6. Esito: PASS → Output: ACK
Prossimo stato: VALIDATED → PASS_TO_TESTER
```