# Phase 2 - Modello task e primo flusso MCP simulato

## 1. Scopo
Questa fase serve a definire il modello formale del task, lo schema del payload MCP simulato e il primo flusso end-to-end controllato tra Direttore Generale, OpenCode, Coordinatore e Tester. La documentazione di workflow è più utile quando trasforma i passaggi operativi in regole ripetibili, verificabili e facili da aggiornare. [web:240][web:247]

## 2. Obiettivo fase
- definire il task model minimo della Release 0;
- formalizzare il payload MCP simulato;
- descrivere il flusso end-to-end minimo;
- produrre il primo scenario testabile;
- stabilire criteri di PASS / NEEDS_FIX per il flusso simulato.

## 3. Owner
- Owner primario: Direttore Generale / LocalAI
- Esecuzione simulata: OpenCode / Executor generico
- Validazione: Coordinatore
- Verifica finale: Tester

## 4. Input
- `pdr-v1.md`
- `architecture-system.md`
- `routing-policy.md`
- `phase-1.md`
- decisioni bloccate della Release 0

## 5. Output attesi
- task model formale;
- schema payload MCP simulato;
- scenario end-to-end definito;
- checklist di validazione del Coordinatore;
- checklist di test del Tester;
- esito PASS o NEEDS_FIX della fase.

Un deliverable di fase è valido solo se può essere riutilizzato in modo coerente nelle fasi successive e se i criteri di accettazione sono osservabili. [web:243][web:255]

## 6. Task model Release 0

### Campi obbligatori
- task_id
- project_id
- phase_id
- sender_role
- target_role
- objective
- inputs
- constraints
- expected_outputs
- acceptance_criteria
- status

### Regole
- ogni task ha un owner chiaro;
- ogni task ha scope limitato;
- ogni task ha output verificabile;
- ogni task deve poter essere validato senza interpretazioni ambigue.

## 7. Schema payload MCP simulato

```yaml
task_payload:
  task_id: "TASK-0001"
  project_id: "MA-LOCAL-001"
  phase_id: "PHASE-02"
  sender_role: "DirettoreGenerale"
  target_role: "OpenCode.Executor"
  status: "READY_TO_SEND"

  objective: "Produrre un deliverable simulato coerente con la Release 0"
  inputs:
    - "pdr-v1"
    - "routing-policy"
    - "architecture-system"
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

## 8. Scenario minimo end-to-end

### Flusso
1. Il Direttore Generale genera un task simulato.
2. Il task viene instradato verso OpenCode.
3. OpenCode produce un deliverable simulato e un log.
4. Il Coordinatore verifica struttura e coerenza semantica minima.
5. Se valido, il Coordinatore restituisce PASS_TO_TESTER.
6. Il Tester esegue la verifica finale del flusso.
7. Il risultato finale è PASS o FAIL.

### Rappresentazione sintetica

```text
Direttore Generale
  ->
Payload MCP simulato
  ->
OpenCode.Executor
  ->
Deliverable simulato + log
  ->
Coordinatore
  ->
PASS_TO_TESTER
  ->
Tester
  ->
PASS / FAIL
```

I workflow documentati in step espliciti migliorano consistenza e trasferibilità del processo, specialmente quando il sistema è ancora in fase di definizione. [web:244][web:246]

## 9. Deliverable simulato atteso

```yaml
simulated_result:
  task_id: "TASK-0001"
  execution_status: "COMPLETED"
  deliverable: "artifact simulato release 0"
  execution_log:
    - "task ricevuto"
    - "input letti"
    - "output generato"
```

## 10. Validazione Coordinatore

### Checklist
- [ ] payload completo
- [ ] campi obbligatori presenti
- [ ] target coerente con il routing
- [ ] objective chiaro
- [ ] inputs coerenti con objective
- [ ] expected_outputs coerenti con objective
- [ ] acceptance_criteria verificabili
- [ ] deliverable presente
- [ ] execution_log presente

### Output ammessi
- ACK
- NEEDS_FIX
- PASS_TO_TESTER

### Regola
Se manca anche un solo campo obbligatorio o se il task è semanticamente incoerente, il risultato deve essere NEEDS_FIX. [web:243][web:266]

## 11. Test Tester

### Checklist
- [ ] il flusso parte dal Direttore Generale
- [ ] il task arriva a OpenCode
- [ ] OpenCode produce output simulato
- [ ] il Coordinatore valida correttamente
- [ ] il Tester riceve solo deliverable validati
- [ ] il risultato finale è esplicito
- [ ] il flusso è documentabile

### Output ammessi
- PASS
- FAIL

## 12. Criteri di chiusura fase

### PASS
La fase è chiusa se:
- esiste uno schema task stabile;
- esiste un payload MCP simulato completo;
- il flusso end-to-end minimo è definito;
- la validazione del Coordinatore è formalizzata;
- il test finale è formalizzato.

### NEEDS_FIX
La fase non è chiusa se:
- manca il task model;
- il payload non è completo;
- il routing non è deterministico;
- i criteri di validazione o test sono ambigui.

I criteri di accettazione devono essere misurabili e privi di ambiguità, altrimenti non supportano una chiusura di fase affidabile. [web:243][web:257]

## 13. Checklist fase
- [ ] Task model formalizzato
- [ ] Schema payload formalizzato
- [ ] Scenario end-to-end definito
- [ ] Deliverable simulato definito
- [ ] Checklist Coordinatore definita
- [ ] Checklist Tester definita
- [ ] Criteri PASS / NEEDS_FIX definiti

## 14. Stato iniziale
- Stato: IN_PROGRESS

## 15. Prossima fase
Phase 3:
- esecuzione del primo payload MCP simulato;
- registrazione log;
- validazione Coordinatore;
- test finale del flusso.