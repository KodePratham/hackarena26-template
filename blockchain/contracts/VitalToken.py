"""
VitalToken.py — VitalScore Reward Token (Algorand Standard Asset)

This module provides helper functions for creating and managing the VitalToken ASA
(Algorand Standard Asset) using the py-algorand-sdk. VitalToken is a fungible reward
token issued to users for completing challenges and milestones.

Note: VitalToken is an ASA, not a smart contract. This module uses the Algorand SDK
to create and manage the asset programmatically.

Functions:
    - create_vital_token_asa: Create the VitalToken ASA on Algorand
    - issue_tokens: Transfer tokens from reserve to user
    - get_balance: Check VitalToken balance for an address
    - burn_tokens: Burn tokens (clawback back to reserve, then freeze)
"""

from algosdk import transaction, account, mnemonic
from algosdk.v2client import algod
import json


# ─── ASA Configuration ───
VITAL_TOKEN_CONFIG = {
    "asset_name": "VitalToken",
    "unit_name": "VITAL",
    "total": 1_000_000_000,  # 1 billion total supply
    "decimals": 6,
    "default_frozen": False,
    "url": "https://vitalscore.in/token",
    "metadata_hash": None,  # Set during creation
}


def create_algod_client(algod_address: str, algod_token: str) -> algod.AlgodClient:
    """Create an Algorand node client."""
    return algod.AlgodClient(algod_token, algod_address)


def create_vital_token_asa(
    client: algod.AlgodClient,
    creator_private_key: str,
) -> dict:
    """
    Create the VitalToken ASA on the Algorand blockchain.

    The creator address is set as manager, reserve, freeze, and clawback.
    This gives the VitalScore system full control over token issuance.

    Args:
        client: Algorand client instance
        creator_private_key: Private key of the system wallet

    Returns:
        dict with asset_id and transaction_id
    """
    creator_address = account.address_from_private_key(creator_private_key)
    params = client.suggested_params()

    # Create Asset Configuration Transaction
    txn = transaction.AssetConfigTxn(
        sender=creator_address,
        sp=params,
        total=VITAL_TOKEN_CONFIG["total"],
        default_frozen=VITAL_TOKEN_CONFIG["default_frozen"],
        unit_name=VITAL_TOKEN_CONFIG["unit_name"],
        asset_name=VITAL_TOKEN_CONFIG["asset_name"],
        manager=creator_address,     # Can reconfigure
        reserve=creator_address,     # Reserve address holds un-minted tokens
        freeze=creator_address,      # Can freeze accounts
        clawback=creator_address,    # Can clawback for burns
        url=VITAL_TOKEN_CONFIG["url"],
        decimals=VITAL_TOKEN_CONFIG["decimals"],
        strict_empty_address_check=False,
    )

    # Sign and send
    signed_txn = txn.sign(creator_private_key)
    tx_id = client.send_transaction(signed_txn)

    # Wait for confirmation
    result = transaction.wait_for_confirmation(client, tx_id, 4)
    asset_id = result["asset-index"]

    return {
        "asset_id": asset_id,
        "tx_id": tx_id,
        "asset_name": VITAL_TOKEN_CONFIG["asset_name"],
        "unit_name": VITAL_TOKEN_CONFIG["unit_name"],
        "total_supply": VITAL_TOKEN_CONFIG["total"],
        "decimals": VITAL_TOKEN_CONFIG["decimals"],
    }


def opt_in_to_token(
    client: algod.AlgodClient,
    user_private_key: str,
    asset_id: int,
) -> str:
    """
    User opts in to receive VitalToken (required before any transfer).

    Args:
        client: Algorand client
        user_private_key: User's private key
        asset_id: VitalToken ASA ID

    Returns:
        Transaction ID
    """
    user_address = account.address_from_private_key(user_private_key)
    params = client.suggested_params()

    # Opt-in is a 0-amount transfer to self
    txn = transaction.AssetTransferTxn(
        sender=user_address,
        sp=params,
        receiver=user_address,
        amt=0,
        index=asset_id,
    )

    signed_txn = txn.sign(user_private_key)
    tx_id = client.send_transaction(signed_txn)
    transaction.wait_for_confirmation(client, tx_id, 4)

    return tx_id


def issue_tokens(
    client: algod.AlgodClient,
    system_private_key: str,
    receiver_address: str,
    asset_id: int,
    amount: int,
) -> dict:
    """
    Issue VitalTokens from the system reserve to a user.

    Args:
        client: Algorand client
        system_private_key: System wallet private key (reserve)
        receiver_address: User's Algorand address
        asset_id: VitalToken ASA ID
        amount: Number of tokens to issue (in smallest unit)

    Returns:
        dict with tx_id and amount
    """
    system_address = account.address_from_private_key(system_private_key)
    params = client.suggested_params()

    txn = transaction.AssetTransferTxn(
        sender=system_address,
        sp=params,
        receiver=receiver_address,
        amt=amount,
        index=asset_id,
    )

    signed_txn = txn.sign(system_private_key)
    tx_id = client.send_transaction(signed_txn)
    transaction.wait_for_confirmation(client, tx_id, 4)

    return {
        "tx_id": tx_id,
        "amount": amount,
        "receiver": receiver_address,
        "asset_id": asset_id,
    }


def get_balance(
    client: algod.AlgodClient,
    address: str,
    asset_id: int,
) -> int:
    """
    Get VitalToken balance for an address.

    Args:
        client: Algorand client
        address: Algorand address to check
        asset_id: VitalToken ASA ID

    Returns:
        Token balance (in smallest unit)
    """
    account_info = client.account_info(address)

    for asset in account_info.get("assets", []):
        if asset["asset-id"] == asset_id:
            return asset["amount"]

    return 0  # Not opted in or zero balance


def burn_tokens(
    client: algod.AlgodClient,
    system_private_key: str,
    from_address: str,
    asset_id: int,
    amount: int,
) -> dict:
    """
    Burn VitalTokens (clawback from user to reserve for destruction).

    Used for partner merchant redemption — user burns tokens for discounts.

    Args:
        client: Algorand client
        system_private_key: System wallet key (clawback authority)
        from_address: Address to burn tokens from
        asset_id: VitalToken ASA ID
        amount: Number of tokens to burn

    Returns:
        dict with tx_id and amount burned
    """
    system_address = account.address_from_private_key(system_private_key)
    params = client.suggested_params()

    # Clawback transaction: moves tokens from user back to reserve
    txn = transaction.AssetTransferTxn(
        sender=system_address,
        sp=params,
        receiver=system_address,  # Send back to reserve
        amt=amount,
        index=asset_id,
        revocation_target=from_address,  # Clawback from this address
    )

    signed_txn = txn.sign(system_private_key)
    tx_id = client.send_transaction(signed_txn)
    transaction.wait_for_confirmation(client, tx_id, 4)

    return {
        "tx_id": tx_id,
        "amount_burned": amount,
        "from_address": from_address,
        "asset_id": asset_id,
    }


if __name__ == "__main__":
    print("VitalToken ASA Configuration:")
    print(json.dumps(VITAL_TOKEN_CONFIG, indent=2))
    print("\nThis module provides SDK-based functions for ASA management.")
    print("Use create_vital_token_asa() to deploy the token on Algorand.")
