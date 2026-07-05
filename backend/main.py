import asyncio
import logging
from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from models import WsEventType
from opencode_runner import OpencodeRunner
from orchestrator import Orchestrator
from websocket_manager import WebSocketManager

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger(__name__)

ws_manager = WebSocketManager()
runner = OpencodeRunner()
orchestrator = Orchestrator(ws_manager, runner)
_stop_metrics = asyncio.Event()
_metrics_task: asyncio.Task | None = None


@asynccontextmanager
async def lifespan(_: FastAPI):
    global _metrics_task
    _stop_metrics.clear()
    await orchestrator.initialize()
    _metrics_task = asyncio.create_task(orchestrator.broadcast_metrics_loop(_stop_metrics))
    logger.info("Orchestrator backend avviato su %s:%d", settings.host, settings.port)
    yield
    _stop_metrics.set()
    if _metrics_task:
        await _metrics_task


app = FastAPI(
    title="Opencode Agentic Orchestrator API",
    version="0.3.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    opencode_ok = await runner.verify_installation()
    return {
        "status": "ok",
        "version": "0.3.0",
        "opencode_installed": opencode_ok,
        "opencode_bin": runner.binary,
        "connections": ws_manager.connection_count,
        "project_dir": str(settings.project_dir),
    }


@app.get("/api/agents")
async def get_agents():
    return {"agents": [a.model_dump() for a in orchestrator.agents.values()]}


@app.get("/api/chat")
async def get_chat():
    return {"messages": [m.model_dump() for m in orchestrator.chat_history]}


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)

    await ws_manager.send(
        websocket,
        WsEventType.CONNECTION_STATUS,
        {
            "opencode_installed": await runner.verify_installation(),
            "opencode_bin": runner.binary,
            "last_sync": orchestrator.last_sync,
            "message": "Connesso all'orchestratore",
        },
    )
    await ws_manager.send(websocket, WsEventType.SETTINGS_UPDATE, orchestrator._settings_payload())

    # Invia stato MCP, Plugin, Skills
    await ws_manager.send(websocket, WsEventType.MCP_UPDATE, orchestrator.mcp_servers)
    await ws_manager.send(websocket, WsEventType.PLUGIN_UPDATE, orchestrator.plugins)
    await ws_manager.send(websocket, WsEventType.SKILL_UPDATE, orchestrator.skills)

    # Invia config OpenCode completa (agenti, skills, regole)
    from opencode_runner import get_opencode_config
    try:
        config = get_opencode_config()
        await ws_manager.send(websocket, WsEventType.SYNC_UPDATE, {
            "config": config,
            "last_sync": orchestrator.last_sync,
        })
    except Exception as e:
        logger.error("Failed to send OpenCode config: %s", e)

    # Invia snapshot stato corrente al nuovo client
    for agent_id, agent in orchestrator.agents.items():
        await ws_manager.send(websocket, WsEventType.AGENT_UPDATE, {"agent_id": agent_id, **agent.model_dump()})
    for msg in orchestrator.chat_history:
        await ws_manager.send(websocket, WsEventType.CHAT_BROADCAST, msg.model_dump())

    try:
        while True:
            data = await websocket.receive_json()
            await orchestrator.handle_message(data)
    except WebSocketDisconnect:
        await ws_manager.disconnect(websocket)
    except Exception as exc:
        logger.exception("WebSocket error")
        await ws_manager.send(websocket, WsEventType.ERROR, {"message": str(exc)})
        await ws_manager.disconnect(websocket)


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=False,
        log_level="info",
    )
