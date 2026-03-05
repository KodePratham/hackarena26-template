"""
token_service.py — VitalToken (ASA) operations on Algorand.

Handles token balance queries, reward issuance, and token burns
using the py-algorand-sdk.
"""

import os
import sys
from algosdk import transaction, account, mnemonic
from algosdk.v2client import algod

from config import (
    get_algod_client,
    SYSTEM_MNEMONIC,
    VITAL_TOKEN_ASSET_ID,
    logger,
)
from services.queue_service import blockchain_queue, PRIORITY_TOKEN_ISSUE

# Add contracts to path
CONTRACTS_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", "blockchain", "contracts")
)
sys.path.insert(0, CONTRACTS_DIR)


class TokenService:
    """Manages VitalToken ASA operations."""

    @staticmethod
    def _get_system_credentials():
        """Get system wallet address and private key."""
        if not SYSTEM_MNEMONIC:
            raise ValueError("SYSTEM_MNEMONIC not configured")
        private_key = mnemonic.to_private_key(SYSTEM_MNEMONIC)
        address = account.address_from_private_key(private_key)
        return address, private_key

    @staticmethod
    def get_balance(user_address: str) -> dict:
        """
        Get VitalToken balance for an address.

        Args:
            user_address: Algorand address to check

        Returns:
            dict with balance and asset info
        """
        logger.info(f"Checking VitalToken balance for {user_address}")

        try:
            if not VITAL_TOKEN_ASSET_ID:
                return {
                    "user_address": user_address,
                    "asset_id": 0,
                    "balance": 0,
                    "symbol": "VITAL",
                    "message": "VitalToken ASA not yet created",
                }

            client = get_algod_client()

            # Import from contracts module
            from VitalToken import get_balance as _get_balance

            balance = _get_balance(client, user_address, VITAL_TOKEN_ASSET_ID)

            return {
                "user_address": user_address,
                "asset_id": VITAL_TOKEN_ASSET_ID,
                "balance": balance,
                "symbol": "VITAL",
                "decimals": 6,
            }

        except Exception as e:
            logger.error(f"Balance check failed: {e}")
            return {
                "user_address": user_address,
                "asset_id": VITAL_TOKEN_ASSET_ID,
                "balance": 0,
                "symbol": "VITAL",
                "error": str(e),
            }

    @staticmethod
    def issue_tokens(
        user_address: str,
        amount: int,
        reason: str,
    ) -> dict:
        """
        Issue VitalTokens to a user as a reward.

        Args:
            user_address: Recipient's Algorand address
            amount: Number of tokens (in smallest unit, 6 decimals)
            reason: Reason for issuance (e.g., "challenge_completed")

        Returns:
            dict with tx_id and issuance details
        """
        logger.info(
            f"Issuing {amount} VITAL to {user_address} for: {reason}"
        )

        try:
            if not VITAL_TOKEN_ASSET_ID:
                return {
                    "success": False,
                    "error": "VitalToken ASA not configured",
                }

            client = get_algod_client()

            # Import from contracts module
            from VitalToken import issue_tokens as _issue_tokens

            system_address, system_key = TokenService._get_system_credentials()

            result = _issue_tokens(
                client, system_key, user_address, VITAL_TOKEN_ASSET_ID, amount
            )

            logger.info(f"Issued {amount} VITAL to {user_address}: tx={result['tx_id']}")

            return {
                "success": True,
                "tx_id": result["tx_id"],
                "amount": amount,
                "symbol": "VITAL",
                "recipient": user_address,
                "reason": reason,
            }

        except Exception as e:
            logger.error(f"Token issuance failed: {e}")
            # Queue for retry
            blockchain_queue.enqueue(
                "issue_tokens",
                {
                    "user_address": user_address,
                    "amount": amount,
                    "reason": reason,
                },
                PRIORITY_TOKEN_ISSUE,
            )
            return {
                "success": False,
                "error": str(e),
                "queued": True,
                "message": "Token issuance queued for retry",
            }

    @staticmethod
    def create_vital_token() -> dict:
        """
        Create the VitalToken ASA (one-time setup).

        Returns:
            dict with asset_id and creation details
        """
        logger.info("Creating VitalToken ASA")

        try:
            client = get_algod_client()
            system_address, system_key = TokenService._get_system_credentials()

            from VitalToken import create_vital_token_asa

            result = create_vital_token_asa(client, system_key)

            logger.info(f"VitalToken created: asset_id={result['asset_id']}")

            return {
                "success": True,
                **result,
                "message": f"Set VITAL_TOKEN_ASSET_ID={result['asset_id']} in .env",
            }

        except Exception as e:
            logger.error(f"VitalToken creation failed: {e}")
            return {"success": False, "error": str(e)}
