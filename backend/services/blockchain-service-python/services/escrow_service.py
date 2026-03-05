"""
escrow_service.py — Challenge Escrow operations on Algorand.

Handles stake locking, verification, and release using the
ChallengeEscrow PyTeal smart contract.
"""

import os
import sys
import base64
import time
from algosdk import transaction, account, mnemonic
from algosdk.v2client import algod

from config import (
    get_algod_client,
    SYSTEM_MNEMONIC,
    COMMUNITY_POOL_ADDRESS,
    logger,
)
from services.queue_service import blockchain_queue, PRIORITY_ESCROW_RELEASE

# Add contracts to path
CONTRACTS_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", "blockchain", "contracts")
)
sys.path.insert(0, CONTRACTS_DIR)


class EscrowService:
    """Manages challenge escrow operations on Algorand."""

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
        """Compile TEAL source to bytecode."""
        result = client.compile(teal_source)
        return base64.b64decode(result["result"])

    @staticmethod
    def lock_stake(
        user_id: str,
        user_address: str,
        challenge_id: str,
        amount_microalgos: int,
        deadline_timestamp: int,
    ) -> dict:
        """
        Lock a challenge stake in an Algorand escrow contract.

        Steps:
        1. Compile ChallengeEscrow PyTeal contract
        2. Deploy the escrow application
        3. Fund the escrow with the stake amount
        4. Return escrow details

        Args:
            user_id: Internal user ID
            user_address: User's Algorand address
            challenge_id: UUID of the challenge
            amount_microalgos: Stake amount in microAlgos
            deadline_timestamp: Unix timestamp for challenge deadline

        Returns:
            dict with app_id, escrow_address, tx_id
        """
        logger.info(
            f"Locking stake of {amount_microalgos} uALGO for user {user_id} "
            f"on challenge {challenge_id}"
        )

        try:
            client = get_algod_client()
            system_address, system_key = EscrowService._get_system_credentials()

            # Step 1: Compile ChallengeEscrow contract
            from ChallengeEscrow import (
                get_approval_teal, get_clear_teal, GLOBAL_SCHEMA, LOCAL_SCHEMA
            )

            approval_teal = get_approval_teal()
            clear_teal = get_clear_teal()

            approval_program = EscrowService._compile_contract(client, approval_teal)
            clear_program = EscrowService._compile_contract(client, clear_teal)

            # Step 2: Deploy escrow application
            params = client.suggested_params()

            community_pool = COMMUNITY_POOL_ADDRESS or system_address

            app_txn = transaction.ApplicationCreateTxn(
                sender=system_address,
                sp=params,
                on_complete=transaction.OnComplete.NoOpOC,
                approval_program=approval_program,
                clear_program=clear_program,
                global_schema=transaction.StateSchema(
                    GLOBAL_SCHEMA["num_uints"],
                    GLOBAL_SCHEMA["num_byte_slices"],
                ),
                local_schema=transaction.StateSchema(
                    LOCAL_SCHEMA["num_uints"],
                    LOCAL_SCHEMA["num_byte_slices"],
                ),
                app_args=[
                    user_address.encode(),
                    amount_microalgos.to_bytes(8, "big"),
                    challenge_id.encode(),
                    deadline_timestamp.to_bytes(8, "big"),
                    community_pool.encode(),
                ],
            )

            signed_app = app_txn.sign(system_key)
            app_tx_id = client.send_transaction(signed_app)
            app_result = transaction.wait_for_confirmation(client, app_tx_id, 4)
            app_id = app_result["application-index"]

            # Step 3: Fund the escrow application account
            escrow_address = transaction.logic.get_application_address(app_id)

            # Minimum balance + stake amount
            fund_amount = amount_microalgos + 200_000  # 0.2 ALGO min balance

            fund_txn = transaction.PaymentTxn(
                sender=system_address,
                sp=params,
                receiver=escrow_address,
                amt=fund_amount,
            )

            signed_fund = fund_txn.sign(system_key)
            fund_tx_id = client.send_transaction(signed_fund)
            transaction.wait_for_confirmation(client, fund_tx_id, 4)

            logger.info(
                f"Escrow deployed: app_id={app_id}, address={escrow_address}, "
                f"amount={amount_microalgos}"
            )

            return {
                "success": True,
                "app_id": app_id,
                "escrow_address": escrow_address,
                "tx_id": app_tx_id,
                "fund_tx_id": fund_tx_id,
                "amount_locked": amount_microalgos,
                "deadline": deadline_timestamp,
                "locked_at": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
            }

        except Exception as e:
            logger.error(f"Escrow lock failed: {e}")
            # Per design: Do NOT proceed with challenge if stake cannot be locked
            return {
                "success": False,
                "error": str(e),
                "queued": False,  # Escrow failures are NOT queued — user must be notified
                "message": "Couldn't lock your stake. Your money was not moved.",
            }

    @staticmethod
    def release_stake(app_id: int, success: bool) -> dict:
        """
        Release an escrowed stake after challenge verification.

        On success: returns stake to user
        On failure: sends stake to community pool

        Args:
            app_id: The escrow application ID
            success: Whether the challenge was completed successfully

        Returns:
            dict with release status and tx_id
        """
        logger.info(f"Releasing escrow {app_id} (success={success})")

        try:
            client = get_algod_client()
            system_address, system_key = EscrowService._get_system_credentials()
            params = client.suggested_params()

            # Step 1: Verify completion
            verify_txn = transaction.ApplicationCallTxn(
                sender=system_address,
                sp=params,
                index=app_id,
                on_complete=transaction.OnComplete.NoOpOC,
                app_args=[
                    b"verify_completion",
                    b"1" if success else b"0",
                ],
            )
            signed_verify = verify_txn.sign(system_key)
            verify_tx_id = client.send_transaction(signed_verify)
            transaction.wait_for_confirmation(client, verify_tx_id, 4)

            # Step 2: Release funds
            release_method = "release_success" if success else "release_failure"

            release_txn = transaction.ApplicationCallTxn(
                sender=system_address,
                sp=params,
                index=app_id,
                on_complete=transaction.OnComplete.NoOpOC,
                app_args=[release_method.encode()],
            )
            signed_release = release_txn.sign(system_key)
            release_tx_id = client.send_transaction(signed_release)
            transaction.wait_for_confirmation(client, release_tx_id, 4)

            status = "RELEASED_TO_USER" if success else "FORFEITED_TO_COMMUNITY_POOL"
            logger.info(f"Escrow {app_id} released: {status}")

            return {
                "success": True,
                "status": status,
                "verify_tx_id": verify_tx_id,
                "release_tx_id": release_tx_id,
                "app_id": app_id,
            }

        except Exception as e:
            logger.error(f"Escrow release failed: {e}")
            # Queue release for retry — this is high priority
            blockchain_queue.enqueue(
                "release_escrow",
                {"app_id": app_id, "success": success},
                PRIORITY_ESCROW_RELEASE,
            )
            return {
                "success": False,
                "error": str(e),
                "queued": True,
                "message": "Release queued for retry",
            }

    @staticmethod
    def extend_deadline(app_id: int) -> dict:
        """
        Extend escrow deadline by 48 hours.

        Called when verification data is unavailable at the original deadline.

        Args:
            app_id: The escrow application ID

        Returns:
            dict with extension status
        """
        logger.info(f"Extending deadline for escrow {app_id} by 48h")

        try:
            client = get_algod_client()
            system_address, system_key = EscrowService._get_system_credentials()
            params = client.suggested_params()

            extend_txn = transaction.ApplicationCallTxn(
                sender=system_address,
                sp=params,
                index=app_id,
                on_complete=transaction.OnComplete.NoOpOC,
                app_args=[b"extend_deadline"],
            )
            signed_txn = extend_txn.sign(system_key)
            tx_id = client.send_transaction(signed_txn)
            transaction.wait_for_confirmation(client, tx_id, 4)

            logger.info(f"Deadline extended for escrow {app_id}")
            return {"success": True, "tx_id": tx_id, "extension_hours": 48}

        except Exception as e:
            logger.error(f"Deadline extension failed: {e}")
            return {"success": False, "error": str(e)}
