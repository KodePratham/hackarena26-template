"""
nft_service.py — Soul-Bound Token (SBT) operations on Algorand.

Handles SBT minting, monthly snapshot updates, and metadata retrieval
using the py-algorand-sdk and PyTeal-compiled contracts.
"""

import os
import sys
import base64
import json
import time
from algosdk import transaction, account, mnemonic
from algosdk.v2client import algod

from config import (
    get_algod_client,
    SYSTEM_MNEMONIC,
    logger,
)
from services.ipfs_service import IPFSService
from services.queue_service import blockchain_queue, PRIORITY_NFT_MINT, PRIORITY_NFT_UPDATE

# Add contracts to path for importing PyTeal contracts
CONTRACTS_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", "blockchain", "contracts")
)
sys.path.insert(0, CONTRACTS_DIR)


class NFTService:
    """Manages Soul-Bound Token operations on the Algorand blockchain."""

    @staticmethod
    def _get_system_credentials():
        """Get system wallet address and private key."""
        if not SYSTEM_MNEMONIC:
            raise ValueError("SYSTEM_MNEMONIC not configured")
        private_key = mnemonic.to_private_key(SYSTEM_MNEMONIC)
        address = account.address_from_private_key(private_key)
        return address, private_key

    @staticmethod
    def _compile_contract(client: algod.AlgodClient, teal_source: str) -> bytes:
        """Compile TEAL source to bytecode via Algorand node."""
        try:
            result = client.compile(teal_source)
            return base64.b64decode(result["result"])
        except Exception as e:
            logger.error(f"TEAL compilation failed: {e}")
            raise

    @staticmethod
    def mint_sbt(user_id: str, user_address: str) -> dict:
        """
        Mint a Soul-Bound Token (SBT) for a new user.

        Steps:
        1. Create initial metadata and pin to IPFS
        2. Compile SoulBoundNFT PyTeal contract
        3. Deploy the smart contract application
        4. Create the NFT ASA (ARC-69)
        5. Return asset details

        Args:
            user_id: Internal user ID
            user_address: User's Algorand address

        Returns:
            dict with asset_id, app_id, ipfs_hash, metadata
        """
        logger.info(f"Minting SBT for user {user_id} at {user_address}")

        try:
            client = get_algod_client()
            system_address, system_key = NFTService._get_system_credentials()

            # Step 1: Create initial SBT metadata (ARC-69)
            initial_metadata = {
                "standard": "VitalScore-SBT-v1",
                "ownerAddress": user_address,
                "createdAt": time.strftime("%Y-%m-%d"),
                "monthlySnapshots": [],
                "badges": [],
                "aggregateSummary": {
                    "lifetimeHighScore": 0,
                    "averageScore12M": 0,
                    "totalChallengesCompleted": 0,
                    "totalSquadSeasonsCompleted": 0,
                    "improvingMonths": 0,
                    "decliningMonths": 0,
                },
            }

            # Step 2: Pin metadata to IPFS
            ipfs_result = IPFSService.pin_json(initial_metadata)
            ipfs_hash = ipfs_result["ipfs_hash"]

            # Step 3: Compile SoulBoundNFT contract
            from SoulBoundNFT import get_approval_teal, get_clear_teal, GLOBAL_SCHEMA, LOCAL_SCHEMA

            approval_teal = get_approval_teal()
            clear_teal = get_clear_teal()

            approval_program = NFTService._compile_contract(client, approval_teal)
            clear_program = NFTService._compile_contract(client, clear_teal)

            # Step 4: Deploy Application
            params = client.suggested_params()

            global_schema = transaction.StateSchema(
                GLOBAL_SCHEMA["num_uints"],
                GLOBAL_SCHEMA["num_byte_slices"],
            )
            local_schema = transaction.StateSchema(
                LOCAL_SCHEMA["num_uints"],
                LOCAL_SCHEMA["num_byte_slices"],
            )

            app_txn = transaction.ApplicationCreateTxn(
                sender=system_address,
                sp=params,
                on_complete=transaction.OnComplete.NoOpOC,
                approval_program=approval_program,
                clear_program=clear_program,
                global_schema=global_schema,
                local_schema=local_schema,
                app_args=[
                    user_address.encode(),         # owner
                    ipfs_hash.encode(),            # initial metadata hash
                ],
            )

            signed_txn = app_txn.sign(system_key)
            tx_id = client.send_transaction(signed_txn)
            result = transaction.wait_for_confirmation(client, tx_id, 4)
            app_id = result["application-index"]

            # Step 5: Create associated NFT ASA (ARC-69)
            asset_txn = transaction.AssetConfigTxn(
                sender=system_address,
                sp=params,
                total=1,              # Unique — only 1 token
                default_frozen=True,  # Frozen by default (soul-bound)
                unit_name="VSBT",
                asset_name=f"VitalScore SBT #{user_id[:8]}",
                manager=system_address,
                reserve=system_address,
                freeze=system_address,
                clawback=system_address,
                url=f"ipfs://{ipfs_hash}",
                decimals=0,
                strict_empty_address_check=False,
                note=json.dumps(initial_metadata).encode(),  # ARC-69: metadata in note
            )

            signed_asset = asset_txn.sign(system_key)
            asset_tx_id = client.send_transaction(signed_asset)
            asset_result = transaction.wait_for_confirmation(client, asset_tx_id, 4)
            asset_id = asset_result["asset-index"]

            logger.info(f"SBT minted: app_id={app_id}, asset_id={asset_id}, ipfs={ipfs_hash}")

            return {
                "success": True,
                "app_id": app_id,
                "asset_id": asset_id,
                "ipfs_hash": ipfs_hash,
                "metadata_url": ipfs_result["metadata_url"],
                "tx_id": tx_id,
                "asset_tx_id": asset_tx_id,
                "metadata": initial_metadata,
            }

        except Exception as e:
            logger.error(f"SBT minting failed: {e}")
            # Queue for retry if it's a transient failure
            blockchain_queue.enqueue(
                "mint_sbt",
                {"user_id": user_id, "user_address": user_address},
                PRIORITY_NFT_MINT,
            )
            return {
                "success": False,
                "error": str(e),
                "queued": True,
                "message": "SBT mint queued for retry",
            }

    @staticmethod
    def update_monthly_snapshot(user_id: str, snapshot_data: dict) -> dict:
        """
        Update the SBT with a new monthly score snapshot.

        Steps:
        1. Compute input hash of scoring data
        2. Create new snapshot entry
        3. Pin updated metadata to IPFS
        4. Call update_metadata on the smart contract

        Args:
            user_id: Internal user ID
            snapshot_data: Score snapshot data (score, band, trajectory, etc.)

        Returns:
            dict with new ipfs_hash and snapshot details
        """
        logger.info(f"Updating monthly snapshot for user {user_id}")

        try:
            # Step 1: Compute cryptographic hash of inputs (privacy-preserving)
            input_hash = IPFSService.compute_input_hash(snapshot_data.get("inputs", {}))

            # Step 2: Create snapshot entry
            snapshot = {
                "month": time.strftime("%Y-%m"),
                "score": snapshot_data.get("score", 0),
                "band": snapshot_data.get("band", "UNKNOWN"),
                "trajectory": snapshot_data.get("trajectory", "STABLE"),
                "challengeCompletionRate": snapshot_data.get("challengeCompletionRate", 0),
                "streakDays": snapshot_data.get("streakDays", 0),
                "squadParticipant": snapshot_data.get("squadParticipant", False),
                "inputHash": input_hash,
            }

            # Step 3: Pin updated metadata to IPFS
            updated_metadata = {
                "standard": "VitalScore-SBT-v1",
                "userId": user_id,
                "updatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
                "latestSnapshot": snapshot,
            }
            ipfs_result = IPFSService.pin_json(updated_metadata)

            logger.info(f"Snapshot updated for {user_id}: {ipfs_result['ipfs_hash']}")

            return {
                "success": True,
                "new_ipfs_hash": ipfs_result["ipfs_hash"],
                "metadata_url": ipfs_result["metadata_url"],
                "snapshot": snapshot,
                "input_hash": input_hash,
            }

        except Exception as e:
            logger.error(f"Snapshot update failed for {user_id}: {e}")
            blockchain_queue.enqueue(
                "update_snapshot",
                {"user_id": user_id, "snapshot_data": snapshot_data},
                PRIORITY_NFT_UPDATE,
            )
            return {
                "success": False,
                "error": str(e),
                "queued": True,
            }

    @staticmethod
    def get_nft_metadata(user_id: str) -> dict:
        """
        Get NFT metadata for a user.

        In production, this queries the database for the stored asset_id and ipfs_hash,
        then retrieves the full metadata from IPFS.

        Args:
            user_id: Internal user ID

        Returns:
            dict with asset_id, ipfs_hash, and metadata
        """
        logger.info(f"Fetching NFT metadata for user {user_id}")

        # In production: query DB for user's SBT record
        # For now, return a structured response
        return {
            "user_id": user_id,
            "standard": "VitalScore-SBT-v1",
            "message": "Query database for user_tokens table to get asset_id and ipfs_hash",
        }
