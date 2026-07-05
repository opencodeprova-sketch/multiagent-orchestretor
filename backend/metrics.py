import logging

import psutil

from models import SystemMetrics

logger = logging.getLogger(__name__)


def collect_metrics(project_progress: int = 0) -> SystemMetrics:
    mem = psutil.virtual_memory()
    cpu = psutil.cpu_percent(interval=None)

    return SystemMetrics(
        cpu_percent=round(cpu, 1),
        memory_percent=round(mem.percent, 1),
        memory_used_gb=round(mem.used / (1024**3), 1),
        memory_total_gb=round(mem.total / (1024**3), 1),
        tokens_per_min=0.0,
        api_calls=0,
        project_progress=project_progress,
    )
