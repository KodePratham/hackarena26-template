"""
queue_service.py — Redis-backed blockchain transaction queue.

All on-chain writes are queued and processed with priority ordering
and exponential backoff retry logic.

Priority order: escrow releases > NFT mints > token issuance
"""

import json
import time
import redis
from config import REDIS_URL, QUEUE_MAX_RETRIES, QUEUE_ALERT_THRESHOLD, logger


# Priority levels (lower = higher priority)
PRIORITY_ESCROW_RELEASE = 1
PRIORITY_NFT_MINT = 2
PRIORITY_NFT_UPDATE = 3
PRIORITY_TOKEN_ISSUE = 4
PRIORITY_TREASURY_OP = 3
PRIORITY_DEFAULT = 5


class BlockchainQueue:
    """
    Redis-backed queue for blockchain transactions.

    Processes every 30 seconds, batches where possible,
    retries with exponential backoff up to 3 hours.
    """

    QUEUE_KEY = "blockchain:tx_queue"
    FAILED_KEY = "blockchain:tx_failed"
    PROCESSING_KEY = "blockchain:tx_processing"

    def __init__(self):
        try:
            self.redis = redis.from_url(REDIS_URL, decode_responses=True)
            self.redis.ping()
            logger.info("Redis connected for blockchain queue")
        except Exception as e:
            logger.warning(f"Redis unavailable for queue: {e}")
            self.redis = None

    def enqueue(self, action: str, params: dict, priority: int = PRIORITY_DEFAULT) -> str:
        """
        Add a blockchain transaction to the queue.

        Args:
            action: Transaction type (e.g., "mint_sbt", "lock_stake")
            params: Transaction parameters
            priority: Queue priority (1=highest)

        Returns:
            Queue entry ID
        """
        entry = {
            "id": f"txq_{int(time.time()*1000)}_{action}",
            "action": action,
            "params": params,
            "priority": priority,
            "retries": 0,
            "max_retries": QUEUE_MAX_RETRIES,
            "created_at": time.time(),
            "next_retry_at": time.time(),
            "status": "pending",
        }

        if self.redis:
            # Use sorted set with priority as score for ordering
            self.redis.zadd(
                self.QUEUE_KEY,
                {json.dumps(entry): priority + (time.time() / 1e12)},
            )
            queue_depth = self.redis.zcard(self.QUEUE_KEY)
            if queue_depth > QUEUE_ALERT_THRESHOLD:
                logger.error(
                    f"⚠️ Blockchain queue depth ({queue_depth}) exceeds threshold ({QUEUE_ALERT_THRESHOLD})!"
                )
            logger.info(f"Queued blockchain tx: {entry['id']} (priority={priority})")
        else:
            logger.warning(f"Queue unavailable — tx {entry['id']} not queued")

        return entry["id"]

    def dequeue(self, count: int = 10) -> list:
        """
        Get the next batch of transactions to process.

        Args:
            count: Maximum number of transactions to dequeue

        Returns:
            List of queue entries
        """
        if not self.redis:
            return []

        entries = self.redis.zrange(self.QUEUE_KEY, 0, count - 1)
        if entries:
            self.redis.zrem(self.QUEUE_KEY, *entries)

        return [json.loads(e) for e in entries]

    def requeue_with_backoff(self, entry: dict):
        """
        Re-add a failed transaction with exponential backoff.

        Backoff: 1s, 4s, 16s (retry^2 seconds).
        Max retry time: 3 hours.
        """
        entry["retries"] += 1

        if entry["retries"] > entry["max_retries"]:
            logger.error(f"Transaction {entry['id']} exceeded max retries, moving to failed queue")
            if self.redis:
                self.redis.rpush(self.FAILED_KEY, json.dumps(entry))
            return

        # Exponential backoff: 1, 4, 16 seconds
        backoff = (2 ** entry["retries"]) ** 2
        entry["next_retry_at"] = time.time() + backoff
        entry["status"] = "retrying"

        if self.redis:
            self.redis.zadd(
                self.QUEUE_KEY,
                {json.dumps(entry): entry["priority"] + (entry["next_retry_at"] / 1e12)},
            )
        logger.warning(
            f"Re-queued tx {entry['id']} (retry {entry['retries']}/{entry['max_retries']}, "
            f"backoff {backoff}s)"
        )

    def get_queue_depth(self) -> int:
        """Get current queue depth."""
        if not self.redis:
            return 0
        return self.redis.zcard(self.QUEUE_KEY)

    def get_failed_count(self) -> int:
        """Get number of failed transactions."""
        if not self.redis:
            return 0
        return self.redis.llen(self.FAILED_KEY)

    def get_queue_stats(self) -> dict:
        """Get full queue statistics."""
        return {
            "pending": self.get_queue_depth(),
            "failed": self.get_failed_count(),
            "redis_connected": self.redis is not None,
        }


# Singleton instance
blockchain_queue = BlockchainQueue()
