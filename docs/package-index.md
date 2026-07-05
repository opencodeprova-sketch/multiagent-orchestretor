# Package Index - Documentazione Operativa Sistema Multi-Agente

## 1. Scopo
Indice canonico di tutti i documenti del progetto. Fonte di verità per navigazione, versioning e dipendenze.

## 2. Struttura Package

```
docs/
├── CORE (Foundation - Phase 1-4)
│   ├── pdr-v1.md                    # Project Document Reference v1
│   ├── architecture-system.md       # Architettura sistema
│   ├── routing-policy.md            # Policy routing agenti
│   ├── task-status-model.md         # Modello stati task
│   ├── phase-1.md                   # Fase 1 - Setup & Clarification
│   ├── phase-2.md                   # Fase 2 - Director Definition
│   ├── phase-3.md                   # Fase 3 - Coordinator & MCP
│   └── phase-4.md                   # Fase 4 - Normalizzazione
│
├── OPERATIONAL (Phase 5 - Package Operativo)
│   ├── phase-5.md                   # Fase 5 - Simulazione Multi-Task
│   ├── mcp-payload-schema.md        # Schema JSON payload MCP
│   ├── mcp-payload-template.md      # Template payload pronti uso
│   ├── coordinator-checklist.md     # Checklist validazione Coordinatore
│   ├── tester-checklist.md          # Checklist verifica Tester
│   ├── project-status-log.md        # Log stato progetto
│   ├── package-index.md             # Questo file
│   ├── validation-report-template.md # Template report validazione
│   └── first-end-to-end-test.md     # Primo test E2E reale
│
└── REFERENCE (Archiviati)
    └── archive/                     # Progetti precedenti
```

## 3. Documenti Core (Phase 1-4) — COMPLETI

| File | Versione | Stato | Descrizione |
|------|----------|-------|-------------|
| pdr-v1.md | v1.0 | ✅ FINAL | Riferimento progetto, ruoli, scope, release 0 |
| architecture-system.md | v1.0 | ✅ FINAL | Architettura LocalAI/OpenCode/MCP, principi |
| routing-policy.md | v1.0 | ✅ FINAL | Routing agenti, mapping task→agente |
| task-status-model.md | v1.0 | ✅ FINAL | 12 stati, regole transizione, output ammessi |
| phase-1.md | v1.0 | ✅ FINAL | Setup, clarificazione, PDR |
| phase-2.md | v1.0 | ✅ FINAL | Definizione Direttore, divisione fasi |
| phase-3.md | v1.0 | ✅ FINAL | Coordinatore, MCP, payload structure |
| phase-4.md | v1.0 | ✅ FINAL | Stati standard, log, contract test |

## 4. Documenti Operativi (Phase 5) — COMPLETATI

| File | Versione | Stato | Descrizione |
|------|----------|-------|-------------|
| phase-5.md | v0.1 | ✅ CREATED | Simulazione multi-task, 2+ payload consecutivi |
| mcp-payload-schema.md | v0.1 | ✅ CREATED | Schema JSON completo payload MCP |
| mcp-payload-template.md | v0.1 | ✅ CREATED | Template pronti uso per ogni tipo task |
| coordinator-checklist.md | v0.1 | ✅ CREATED | Checklist validazione ingresso payload |
| tester-checklist.md | v0.1 | ✅ CREATED | Checklist verifica esecuzione task |
| project-status-log.md | v0.1 | ✅ CREATED | Log centrale stato progetto |
| package-index.md | v0.1 | ✅ CREATED | Questo indice |
| validation-report-template.md | v0.1 | ✅ CREATED | Template report validazione formale |
| first-end-to-end-test.md | v0.1 | ✅ CREATED | Primo test E2E reale documentato |

## 5. Dipendenze Tra Documenti

```
pdr-v1.md
    ├── architecture-system.md
    ├── routing-policy.md
    └── task-status-model.md
        ├── phase-1.md
        ├── phase-2.md
        ├── phase-3.md
        └── phase-4.md
            ├── phase-5.md
            ├── mcp-payload-schema.md
            ├── mcp-payload-template.md
            ├── coordinator-checklist.md (usa task-status-model, phase-4)
            ├── tester-checklist.md (usa task-status-model, phase-4)
            ├── project-status-log.md (registra tutti)
            ├── package-index.md (indice tutti)
            ├── validation-report-template.md
            └── first-end-to-end-test.md (usa tutti operational)
```

## 6. Versioning
- **Core docs**: v1.x = stable, breaking changes = v2.0
- **Operational docs**: v0.x = draft, v1.0 = primo release validato
- **Ogni modifica**: entry in project-status-log.md

## 7. Regole Manutenzione
- [ ] Package-index aggiornato a ogni nuovo documento
- [ ] Version bump su modifica sostanziale
- [ ] Cross-reference verificati (no link rotti)
- [ ] Status sincronizzato con project-status-log.md

## 8. Quick Reference - Ruoli & Documenti

| Ruolo | Documenti Primari | Documenti Operativi |
|-------|-------------------|---------------------|
| Direttore Generale | pdr-v1.md, phase-1.md, phase-2.md | project-status-log.md |
| Coordinatore | phase-3.md, phase-4.md, task-status-model.md | coordinator-checklist.md, mcp-payload-schema.md |
| Tester | phase-4.md, task-status-model.md | tester-checklist.md, validation-report-template.md |
| Sender/Executor | phase-3.md, routing-policy.md | mcp-payload-template.md |
| Reviewer/Assembler | Tutti | package-index.md, validation-report-template.md |

## 9. Prossimi Aggiornamenti Previsti
1. Promotion operational docs a v1.0
2. First E2E test execution & documentazione
3. Phase 6 planning (se necessaria)