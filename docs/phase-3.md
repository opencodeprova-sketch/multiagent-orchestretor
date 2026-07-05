# Phase 3 - Esecuzione del primo payload MCP simulato

## 1. Scopo
Questa fase serve a eseguire il primo payload MCP simulato della Release 0, registrare i log minimi, validare il risultato con il Coordinatore e chiudere il primo test end-to-end controllato.

## 2. Obiettivo fase
- eseguire il primo task simulato;
- produrre deliverable simulato e log;
- validare il flusso con il Coordinatore;
- testare il passaggio verso il Tester;
- registrare esito PASS o FAIL.

## 3. Owner
- Owner primario: OpenCode / Executor generico
- Routing e controllo: Direttore Generale / LocalAI
- Validazione: Coordinatore
- Verifica finale: Tester

## 4. Input
- `pdr-v1.md`
- `architecture-system.md`
- `routing-policy.md`
- `phase-1.md`
- `phase-2.md`
- primo payload MCP simulato

## 5. Output attesi
- esecuzione simulata completata;
- deliverable simulato registrato;
- execution log registrato;
- esito Coordinatore;
- esito Tester.

## 6. Payload in esecuzione
```yaml
task_payload:
  task_id: "TASK-0001"
  project_id: "MA-LOCAL-001"
  phase_id: "PHASE-03"
  sender_role: "DirettoreGenerale"
  target_role: "OpenCode.Executor"
  status: "READY_TO_SEND"
  objective: "Produrre un artifact simulato e log coerenti con la Release 0"
  inputs:
    - "pdr-v1"
    - "architecture-system"
    - "routing-policy"
  constraints:
    - "nessuna auto-correzione"
    - "scope immutabile"
    - "output strutturato"
  expected_outputs:
    - "deliverable"
    - "execution_log"
    - "execution_status"
  acceptance_criteria:
    - "campi completi"
    - "output coerente con objective"
    - "validabile dal Coordinatore"
```

## 7. Output simulato atteso
```yaml
simulated_result:
  task_id: "TASK-0001"
  execution_status: "COMPLETED"
  deliverable: "artifact simulato release 0"
  execution_log:
    - "task ricevuto"
    - "input caricati"
    - "deliverable generato"
    - "output inviato al Coordinatore"
```

## 8. Checklist OpenCode
- [ ] payload ricevuto
- [ ] objective letto
- [ ] inputs caricati
- [ ] constraints rispettati
- [ ] output prodotto
- [ ] execution_log prodotto
- [ ] stato finale impostato

## 9. Checklist Coordinatore
- [ ] task_id presente
- [ ] payload valido
- [ ] output presente
- [ ] log presente
- [ ] objective coerente con output
- [ ] acceptance_criteria verificabili

## 10. Checklist Tester
- [ ] ricezione solo dopo PASS_TO_TESTER
- [ ] flusso completo verificato
- [ ] esito finale esplicito
- [ ] log coerente con il flusso

## 11. Output ammessi
### Coordinatore
- ACK
- NEEDS_FIX
- PASS_TO_TESTER

### Tester
- PASS
- FAIL

## 12. Criteri di chiusura
### PASS
- payload eseguito;
- output simulato presente;
- validazione Coordinatore completata;
- test finale completato.

### NEEDS_FIX
- payload incompleto;
- output assente;
- log assente;
- incoerenza tra objective e deliverable.

## 13. Stato iniziale
- Stato: READY

## 14. Prossima fase
Phase 4:
- consolidamento schema log;
- normalizzazione stati task;
- definizione contract test minimi.
