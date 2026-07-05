# Specifica: AgentStatusPanel - Dashboard Stati Agenti Real-time

## 1. Panoramica
Componente React singolo per monitoraggio stati di 5 agenti via WebSocket nativo.

## 2. Requisiti Funzionali
- **RF-01**: Renderizzare 5 card agente (DirettoreGenerale, Coordinatore, OpenCodeExecutor, Tester, Reviewer)
- **RF-02**: Aggiornamento stati via WebSocket con latenza < 500ms
- **RF-03**: Color coding: verde=ACTIVE, giallo=BUSY, rosso=ERROR, grigio=IDLE
- **RF-04**: Auto-reconnect WebSocket su disconnessione
- **RF-05**: Fallback graceful se WebSocket non disponibile

## 3. Requisiti Non Funzionali
- **RNF-01**: React 18 + Tailwind CSS only
- **RNF-02**: Zero dipendenze stato esterne (no Redux, Zustand, Jotai)
- **RNF-03**: TypeScript strict mode
- **RNF-04**: Bundle size < 15KB gzipped

## 4. Interfaccia Componente
```tsx
interface AgentStatus {
  id: string;
  name: string;
  role: 'DirettoreGenerale' | 'Coordinatore' | 'OpenCodeExecutor' | 'Tester' | 'Reviewer';
  state: 'ACTIVE' | 'BUSY' | 'ERROR' | 'IDLE';
  lastUpdate: string; // ISO8601
}

interface AgentStatusPanelProps {
  agents: AgentStatus[];
  websocketUrl: string;
}
```

## 5. Stati WebSocket
| Evento | Azione |
|--------|--------|
| `open` | Imposta tutti agenti IDLE, avvia heartbeat |
| `message` | Parse JSON, aggiorna agente corrispondente |
| `close` | Tenta reconnect ogni 3s (max 5 tentativi) |
| `error` | Log error, mantieni ultimi stati noti |

## 6. Mock Data (per sviluppo)
```json
[
  {"id":"dg-001","name":"DirettoreGenerale","role":"DirettoreGenerale","state":"ACTIVE","lastUpdate":"2026-07-05T02:10:00Z"},
  {"id":"co-001","name":"Coordinatore","role":"Coordinatore","state":"BUSY","lastUpdate":"2026-07-05T02:10:05Z"},
  {"id":"oc-001","name":"OpenCodeExecutor","role":"OpenCodeExecutor","state":"ACTIVE","lastUpdate":"2026-07-05T02:10:02Z"},
  {"id":"te-001","name":"Tester","role":"Tester","state":"IDLE","lastUpdate":"2026-07-05T02:09:58Z"},
  {"id":"re-001","name":"Reviewer","role":"Reviewer","state":"IDLE","lastUpdate":"2026-07-05T02:09:55Z"}
]
```

## 7. Criteri di Accettazione
- [ ] Componente compila TypeScript strict senza errori
- [ ] Renderizza 5 card con nomi e ruoli corretti
- [ ] Colori stati corrispondono a specifica
- [ ] WebSocket connette a URL fornito
- [ ] Aggiornamento stato < 500ms da messaggio server
- [ ] Reconnet automatico su disconnessione
- [ ] Nessun errore console in sviluppo