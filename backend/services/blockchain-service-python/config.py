"""
config.py — Configuration for the Blockchain Integration Service.

Loads environment variables and provides Algorand client, database,
Redis, and IPFS connection setup.
"""

import os
import logging
from dotenv import load_dotenv
from algosdk.v2client import algod

load_dotenv()

# ─── Logging ───
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("blockchain-service")


# ─── Server Config ───
PORT = int(os.getenv("PORT", "3006"))
DEBUG = os.getenv("FLASK_DEBUG", "false").lower() == "true"


# ─── Algorand Config ───
ALGOD_TOKEN = os.getenv("ALGOD_TOKEN", "a" * 64)
ALGOD_SERVER = os.getenv("ALGOD_SERVER", "http://localhost")
ALGOD_PORT = os.getenv("ALGOD_PORT", "4001")
ALGOD_ADDRESS = f"{ALGOD_SERVER}:{ALGOD_PORT}"

# System wallet (mnemonic → private key)
SYSTEM_MNEMONIC = os.getenv("SYSTEM_MNEMONIC", "")
VITAL_TOKEN_ASSET_ID = int(os.getenv("VITAL_TOKEN_ASSET_ID", "0"))
COMMUNITY_POOL_ADDRESS = os.getenv("COMMUNITY_POOL_ADDRESS", "")


# ─── Database Config ───
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://vitalscore:vitalscore@localhost:5432/vitalscore"
)


# ─── Redis Config ───
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")


# ─── IPFS Config ───
IPFS_NODE_URL = os.getenv("IPFS_NODE_URL", "http://localhost:5001")
IPFS_GATEWAY_URL = os.getenv("IPFS_GATEWAY_URL", "https://gateway.pinata.cloud/ipfs")
PINATA_API_KEY = os.getenv("PINATA_API_KEY", "")
PINATA_SECRET_KEY = os.getenv("PINATA_SECRET_KEY", "")


# ─── Blockchain Queue Config ───
QUEUE_PROCESS_INTERVAL = int(os.getenv("QUEUE_PROCESS_INTERVAL", "30"))
QUEUE_MAX_RETRIES = int(os.getenv("QUEUE_MAX_RETRIES", "3"))
QUEUE_ALERT_THRESHOLD = int(os.getenv("QUEUE_ALERT_THRESHOLD", "1000"))


def get_algod_client() -> algod.AlgodClient:
    """Create and return an Algorand client."""
    return algod.AlgodClient(ALGOD_TOKEN, ALGOD_ADDRESS)


def check_algorand_status() -> dict:
    """Check if the Algorand node is reachable."""
    try:
        client = get_algod_client()
        status = client.status()
        logger.info(
            f"Algorand node connected. Last round: {status.get('last-round', 'unknown')}"
        )
        return {"connected": True, "last_round": status.get("last-round")}
    except Exception as e:
        logger.warning(f"Algorand node unreachable: {e}")
        return {"connected": False, "error": str(e)}
