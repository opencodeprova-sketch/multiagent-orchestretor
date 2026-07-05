# OpenCode Agentic Orchestrator

App desktop per orchestrare agenti AI tramite la CLI OpenCode.

## Struttura

```
backend/          FastAPI + WebSocket + subprocess opencode
src/              Frontend React + Tailwind (esportato da Bolt)
start-backend.bat Avvio rapido backend su Windows
```

## Avvio (Windows)

### 1. Backend

```bat
start-backend.bat
```

Oppure manualmente:

```bat
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

API: http://127.0.0.1:8000  
WebSocket: ws://127.0.0.1:8000/ws

### 2. Frontend

```bat
npm install
npm run dev
```

Apri http://localhost:5173

## Protocollo WebSocket

**Client → Server**
- `chat_message` — messaggio utente/agente
- `start_orchestration` — avvia ciclo discussione + esecuzione
- `execute_command` — esegue comando opencode
- `approve_command` / `reject_command` — approvazione umana

**Server → Client**
- `chat_broadcast` — messaggi chat
- `terminal_output` — output live CLI opencode
- `agent_update` — progresso e stato agenti
- `log_entry` — log dashboard
- `system_metrics` — CPU/RAM via psutil
- `command_proposal` — richiesta approvazione

## Comandi chat

- Messaggio normale → discussione agenti → `opencode run`
- `/run <messaggio>` → esecuzione diretta opencode

## Variabili ambiente

| Variabile | Default | Descrizione |
|-----------|---------|-------------|
| `ORCHESTRATOR_HOST` | 127.0.0.1 | Host API |
| `ORCHESTRATOR_PORT` | 8000 | Porta API |
| `ORCHESTRATOR_OPENCODE_BIN` | opencode | Path CLI |
| `ORCHESTRATOR_FULL_AUTO` | true | Esecuzione automatica |
| `ORCHESTRATOR_HUMAN_APPROVAL` | false | Richiede approvazione |
