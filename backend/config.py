from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="ORCHESTRATOR_")

    host: str = "127.0.0.1"
    port: int = 8000
    opencode_bin: str = "opencode"
    project_dir: Path = Path.cwd()
    human_approval: bool = False
    full_auto: bool = True
    metrics_interval_sec: float = 2.0
    max_discussion_rounds: int = 3

    agent_colors: dict[str, str] = {
        "Manager": "#f97316",
        "Architect": "#3b82f6",
        "Coder": "#22c55e",
        "Reviewer": "#a855f7",
        "Tester": "#a855f7",
        "Utente": "#f97316",
        "System": "#8a96b4",
    }


settings = Settings()
