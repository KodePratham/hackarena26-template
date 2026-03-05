"""
ipfs_service.py — IPFS integration for metadata storage.

Supports both local IPFS nodes (via HTTP API) and Pinata (for production pinning).
"""

import json
import hashlib
import requests
from config import (
    IPFS_NODE_URL,
    IPFS_GATEWAY_URL,
    PINATA_API_KEY,
    PINATA_SECRET_KEY,
    logger,
)


class IPFSService:
    """Handles IPFS pinning and retrieval of NFT metadata."""

    @staticmethod
    def pin_json(metadata: dict) -> dict:
        """
        Pin JSON metadata to IPFS.

        Uses Pinata if API keys are configured, otherwise falls back to local IPFS node.

        Args:
            metadata: Dictionary to pin as JSON

        Returns:
            dict with ipfs_hash and metadata_url
        """
        json_str = json.dumps(metadata, sort_keys=True)

        if PINATA_API_KEY and PINATA_SECRET_KEY:
            return IPFSService._pin_via_pinata(json_str)
        else:
            return IPFSService._pin_via_local(json_str)

    @staticmethod
    def _pin_via_pinata(json_str: str) -> dict:
        """Pin JSON to IPFS via Pinata API."""
        try:
            url = "https://api.pinata.cloud/pinning/pinJSONToIPFS"
            headers = {
                "Content-Type": "application/json",
                "pinata_api_key": PINATA_API_KEY,
                "pinata_secret_api_key": PINATA_SECRET_KEY,
            }
            payload = {
                "pinataContent": json.loads(json_str),
                "pinataMetadata": {"name": "VitalScore-SBT-Metadata"},
            }
            response = requests.post(url, json=payload, headers=headers, timeout=30)
            response.raise_for_status()
            ipfs_hash = response.json()["IpfsHash"]

            logger.info(f"Pinned to IPFS via Pinata: {ipfs_hash}")
            return {
                "ipfs_hash": ipfs_hash,
                "metadata_url": f"{IPFS_GATEWAY_URL}/{ipfs_hash}",
            }
        except Exception as e:
            logger.error(f"Pinata pinning failed: {e}")
            # Fallback: generate deterministic hash
            return IPFSService._generate_fallback_hash(json_str)

    @staticmethod
    def _pin_via_local(json_str: str) -> dict:
        """Pin JSON to a local IPFS node."""
        try:
            url = f"{IPFS_NODE_URL}/api/v0/add"
            files = {"file": ("metadata.json", json_str)}
            response = requests.post(url, files=files, timeout=30)
            response.raise_for_status()
            ipfs_hash = response.json()["Hash"]

            logger.info(f"Pinned to local IPFS: {ipfs_hash}")
            return {
                "ipfs_hash": ipfs_hash,
                "metadata_url": f"{IPFS_GATEWAY_URL}/{ipfs_hash}",
            }
        except Exception as e:
            logger.warning(f"Local IPFS pinning failed: {e}")
            return IPFSService._generate_fallback_hash(json_str)

    @staticmethod
    def _generate_fallback_hash(json_str: str) -> dict:
        """Generate a deterministic hash as fallback when IPFS is unavailable."""
        content_hash = hashlib.sha256(json_str.encode()).hexdigest()
        mock_cid = f"Qm{content_hash[:44]}"  # CIDv0-like format

        logger.warning(f"Using fallback hash (IPFS unavailable): {mock_cid}")
        return {
            "ipfs_hash": mock_cid,
            "metadata_url": f"{IPFS_GATEWAY_URL}/{mock_cid}",
            "fallback": True,
        }

    @staticmethod
    def get_metadata(ipfs_hash: str) -> dict:
        """
        Retrieve metadata from IPFS.

        Args:
            ipfs_hash: The IPFS CID

        Returns:
            Parsed JSON metadata
        """
        try:
            url = f"{IPFS_GATEWAY_URL}/{ipfs_hash}"
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Failed to retrieve IPFS metadata: {e}")
            return {"error": str(e), "ipfs_hash": ipfs_hash}

    @staticmethod
    def compute_input_hash(data: dict) -> str:
        """
        Compute SHA-256 hash of scoring inputs for on-chain verification.
        Never stores raw data — only the hash goes on-chain.

        Args:
            data: Score input data to hash

        Returns:
            Hex-encoded SHA-256 hash
        """
        json_str = json.dumps(data, sort_keys=True)
        return hashlib.sha256(json_str.encode()).hexdigest()
