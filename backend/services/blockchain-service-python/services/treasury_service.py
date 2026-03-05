"""
treasury_service.py — Squad Treasury operations on Algorand.

Handles treasury deployment, member deposits, yield recording,
and weighted season-end distribution.
"""

import os
import sys
import base64
import time
from algosdk import transaction, account, mnemonic
from algosdk.v2client import algod

from config import get_algod_client, SYSTEM_MNEMONIC, logger
from services.queue_service import blockchain_queue, PRIORITY_TREASURY_OP

# Add contracts to path
CONTRACTS_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", "blockchain", "contracts")
)
sys.path.insert(0, CONTRACTS_DIR)


class TreasuryService:
    """Manages Squad Treasury operations on the Algorand blockchain."""

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
        """Compile TEAL to bytecode."""
        result = client.compile(teal_source)
        return base64.b64decode(result["result"])

    @staticmethod
    def deploy_treasury(
        squad_id: str,
        creator_address: str,
        season_end_timestamp: int,
        max_members: int = 8,
    ) -> dict:
        """
        Deploy a new Squad Treasury smart contract.

        Args:
            squad_id: UUID of the squad
            creator_address: Squad creator's Algorand address
            season_end_timestamp: Unix timestamp for season end
            max_members: Maximum number of squad members (3-8)

        Returns:
            dict with app_id, treasury_address, tx_id
        """
        logger.info(f"Deploying treasury for squad {squad_id}")

        try:
            client = get_algod_client()
            system_address, system_key = TreasuryService._get_system_credentials()

            # Compile SquadTreasury contract
            from SquadTreasury import (
                get_approval_teal, get_clear_teal, GLOBAL_SCHEMA, LOCAL_SCHEMA
            )

            approval_program = TreasuryService._compile_contract(
                client, get_approval_teal()
            )
            clear_program = TreasuryService._compile_contract(
                client, get_clear_teal()
            )

            params = client.suggested_params()

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
                    creator_address.encode(),
                    season_end_timestamp.to_bytes(8, "big"),
                    max_members.to_bytes(8, "big"),
                ],
            )

            signed_txn = app_txn.sign(system_key)
            tx_id = client.send_transaction(signed_txn)
            result = transaction.wait_for_confirmation(client, tx_id, 4)
            app_id = result["application-index"]

            # Fund the treasury application account with minimum balance
            treasury_address = transaction.logic.get_application_address(app_id)

            fund_txn = transaction.PaymentTxn(
                sender=system_address,
                sp=params,
                receiver=treasury_address,
                amt=300_000,  # 0.3 ALGO min balance for app with local state
            )
            signed_fund = fund_txn.sign(system_key)
            fund_tx_id = client.send_transaction(signed_fund)
            transaction.wait_for_confirmation(client, fund_tx_id, 4)

            logger.info(f"Treasury deployed: app_id={app_id}, address={treasury_address}")

            return {
                "success": True,
                "app_id": app_id,
                "treasury_address": treasury_address,
                "tx_id": tx_id,
                "squad_id": squad_id,
                "status": "DEPLOYED",
                "max_members": max_members,
                "season_end": season_end_timestamp,
            }

        except Exception as e:
            logger.error(f"Treasury deployment failed: {e}")
            blockchain_queue.enqueue(
                "deploy_treasury",
                {
                    "squad_id": squad_id,
                    "creator_address": creator_address,
                    "season_end_timestamp": season_end_timestamp,
                    "max_members": max_members,
                },
                PRIORITY_TREASURY_OP,
            )
            return {"success": False, "error": str(e), "queued": True}

    @staticmethod
    def deposit(
        app_id: int,
        member_address: str,
        amount_microalgos: int,
    ) -> dict:
        """
        Record a member's contribution to the treasury.

        This creates an atomic group: payment + application call.

        Args:
            app_id: Treasury application ID
            member_address: Contributing member's address
            amount_microalgos: Contribution in microAlgos

        Returns:
            dict with tx_id and deposit details
        """
        logger.info(
            f"Depositing {amount_microalgos} uALGO to treasury {app_id} "
            f"from {member_address}"
        )

        try:
            client = get_algod_client()
            system_address, system_key = TreasuryService._get_system_credentials()
            params = client.suggested_params()

            treasury_address = transaction.logic.get_application_address(app_id)

            # Atomic group: payment + app call
            payment_txn = transaction.PaymentTxn(
                sender=system_address,  # System relays the payment
                sp=params,
                receiver=treasury_address,
                amt=amount_microalgos,
            )

            app_call_txn = transaction.ApplicationCallTxn(
                sender=system_address,
                sp=params,
                index=app_id,
                on_complete=transaction.OnComplete.NoOpOC,
                app_args=[
                    b"deposit",
                    amount_microalgos.to_bytes(8, "big"),
                ],
            )

            # Group transactions
            gid = transaction.calculate_group_id([payment_txn, app_call_txn])
            payment_txn.group = gid
            app_call_txn.group = gid

            signed_payment = payment_txn.sign(system_key)
            signed_app = app_call_txn.sign(system_key)

            tx_id = client.send_transactions([signed_payment, signed_app])
            transaction.wait_for_confirmation(client, tx_id, 4)

            logger.info(f"Deposit recorded: {amount_microalgos} uALGO to treasury {app_id}")

            return {
                "success": True,
                "tx_id": tx_id,
                "app_id": app_id,
                "member": member_address,
                "amount": amount_microalgos,
                "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
            }

        except Exception as e:
            logger.error(f"Deposit failed: {e}")
            return {"success": False, "error": str(e)}

    @staticmethod
    def distribute(
        app_id: int,
        distributions: list,
    ) -> dict:
        """
        Execute season-end weighted distribution.

        Distributes principal + yield to each member based on their
        VitalScore improvement percentage.

        Args:
            app_id: Treasury application ID
            distributions: List of {"address": str, "amount": int}

        Returns:
            dict with distribution results
        """
        logger.info(f"Executing distribution for treasury {app_id}")

        try:
            client = get_algod_client()
            system_address, system_key = TreasuryService._get_system_credentials()
            params = client.suggested_params()

            # Step 1: Begin distribution mode
            begin_txn = transaction.ApplicationCallTxn(
                sender=system_address,
                sp=params,
                index=app_id,
                on_complete=transaction.OnComplete.NoOpOC,
                app_args=[b"begin_distribution"],
            )
            signed_begin = begin_txn.sign(system_key)
            begin_tx_id = client.send_transaction(signed_begin)
            transaction.wait_for_confirmation(client, begin_tx_id, 4)

            # Step 2: Distribute to each member
            dist_results = []
            for dist in distributions:
                dist_txn = transaction.ApplicationCallTxn(
                    sender=system_address,
                    sp=params,
                    index=app_id,
                    on_complete=transaction.OnComplete.NoOpOC,
                    app_args=[
                        b"distribute",
                        dist["address"].encode(),
                        int(dist["amount"]).to_bytes(8, "big"),
                    ],
                )
                signed_dist = dist_txn.sign(system_key)
                dist_tx_id = client.send_transaction(signed_dist)
                transaction.wait_for_confirmation(client, dist_tx_id, 4)

                dist_results.append({
                    "address": dist["address"],
                    "amount": dist["amount"],
                    "tx_id": dist_tx_id,
                })

            # Step 3: Mark season as completed
            complete_txn = transaction.ApplicationCallTxn(
                sender=system_address,
                sp=params,
                index=app_id,
                on_complete=transaction.OnComplete.NoOpOC,
                app_args=[b"complete"],
            )
            signed_complete = complete_txn.sign(system_key)
            complete_tx_id = client.send_transaction(signed_complete)
            transaction.wait_for_confirmation(client, complete_tx_id, 4)

            logger.info(
                f"Distribution complete for treasury {app_id}: "
                f"{len(dist_results)} members paid"
            )

            return {
                "success": True,
                "app_id": app_id,
                "distributions": dist_results,
                "total_distributed": sum(d["amount"] for d in distributions),
                "members_paid": len(dist_results),
                "complete_tx_id": complete_tx_id,
            }

        except Exception as e:
            logger.error(f"Distribution failed: {e}")
            blockchain_queue.enqueue(
                "distribute_treasury",
                {"app_id": app_id, "distributions": distributions},
                PRIORITY_ESCROW_RELEASE,  # Same priority as escrow releases
            )
            return {"success": False, "error": str(e), "queued": True}
