import logging
import sys
import json
from pathlib import Path
from loguru import logger

LOG_DIR = Path(__file__).resolve().parent.parent.parent.parent / "logs"
LOG_DIR.mkdir(exist_ok=True)

logger.remove()
logger.add(
    sys.stdout,
    format="{time:YYYY-MM-DD HH:mm:ss} | {level} | {message}",
    level="INFO",
)
logger.add(
    LOG_DIR / "medexplain.log",
    format="{time:YYYY-MM-DD HH:mm:ss} | {level} | {message}",
    level="DEBUG",
    rotation="10 MB",
    retention="7 days",
)

def get_logger():
    return logger
