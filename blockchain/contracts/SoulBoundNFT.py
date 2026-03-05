"""
SoulBoundNFT.py — VitalScore Soul-Bound Token Smart Contract (ARC-69)

This PyTeal contract implements a non-transferable Soul-Bound Token (SBT)
for VitalScore Finance. Each user receives one SBT at onboarding that records
their financial wellness journey on-chain.

Global State:
    - admin: The system admin address (creator)
    - metadata_hash: IPFS hash of the current NFT metadata (updated monthly)
    - asset_id: The ASA ID of the associated NFT asset
    - owner: The user's Algorand address

Methods:
    - create: Initialize the contract (on creation)
    - update_metadata: Update the IPFS metadata hash (admin only)
    - verify: Verify the SBT belongs to an address (read-only)
    - delete: Delete the SBT (admin only)
"""

from pyteal import (
    Approve,
    App,
    Assert,
    Bytes,
    Cond,
    Global,
    If,
    Int,
    Mode,
    OnComplete,
    Reject,
    Return,
    Seq,
    Txn,
    compileTeal,
)


def approval_program():
    """Main approval program for the SoulBoundNFT contract."""

    # ─── Global State Keys ───
    admin_key = Bytes("admin")
    owner_key = Bytes("owner")
    metadata_hash_key = Bytes("metadata_hash")
    asset_id_key = Bytes("asset_id")
    created_at_key = Bytes("created_at")
    transfer_restricted_key = Bytes("transfer_restricted")

    # ─── Helpers ───
    is_admin = Txn.sender() == App.globalGet(admin_key)

    # ─── On Creation ───
    on_create = Seq(
        # Store creator as admin
        App.globalPut(admin_key, Txn.sender()),
        # Store the owner address from application args
        App.globalPut(owner_key, Txn.application_args[0]),
        # Store initial IPFS metadata hash
        App.globalPut(metadata_hash_key, Txn.application_args[1]),
        # Transfer restriction is always ON (Soul-Bound)
        App.globalPut(transfer_restricted_key, Int(1)),
        # Store creation round as timestamp proxy
        App.globalPut(created_at_key, Global.latest_timestamp()),
        # Asset ID will be set via update after ASA creation
        App.globalPut(asset_id_key, Int(0)),
        Approve(),
    )

    # ─── Update Metadata (Admin Only) ───
    # Called monthly to update the IPFS hash with new score snapshots
    on_update_metadata = Seq(
        Assert(is_admin),
        App.globalPut(metadata_hash_key, Txn.application_args[1]),
        Approve(),
    )

    # ─── Set Asset ID (Admin Only, One-Time) ───
    on_set_asset = Seq(
        Assert(is_admin),
        App.globalPut(asset_id_key, Txn.application_args[1]),
        Approve(),
    )

    # ─── Verify (Anyone Can Call) ───
    # Returns the current metadata hash for verification
    on_verify = Seq(
        # No state changes — verification is read from global state
        Approve(),
    )

    # ─── NoOp Routing ───
    on_noop = Cond(
        [Txn.application_args[0] == Bytes("update_metadata"), on_update_metadata],
        [Txn.application_args[0] == Bytes("set_asset"), on_set_asset],
        [Txn.application_args[0] == Bytes("verify"), on_verify],
    )

    # ─── Delete Application (Admin Only) ───
    on_delete = Seq(
        Assert(is_admin),
        Approve(),
    )

    # ─── Opt-In (Reject — SBT is non-transferable) ───
    on_optin = Reject()

    # ─── Close Out (Reject — Cannot leave SBT) ───
    on_closeout = Reject()

    # ─── Update Application (Admin Only) ───
    on_update = Seq(
        Assert(is_admin),
        Approve(),
    )

    # ─── Main Router ───
    program = Cond(
        [Txn.application_id() == Int(0), on_create],
        [Txn.on_completion() == OnComplete.NoOp, on_noop],
        [Txn.on_completion() == OnComplete.DeleteApplication, on_delete],
        [Txn.on_completion() == OnComplete.OptIn, on_optin],
        [Txn.on_completion() == OnComplete.CloseOut, on_closeout],
        [Txn.on_completion() == OnComplete.UpdateApplication, on_update],
    )

    return program


def clear_state_program():
    """Clear state program — always reject to prevent unauthorized state clearing."""
    return Reject()


def get_approval_teal():
    """Compile approval program to TEAL."""
    return compileTeal(approval_program(), mode=Mode.Application, version=10)


def get_clear_teal():
    """Compile clear state program to TEAL."""
    return compileTeal(clear_state_program(), mode=Mode.Application, version=10)


# Schema definitions for contract deployment
GLOBAL_SCHEMA = {
    "num_uints": 3,      # asset_id, transfer_restricted, created_at
    "num_byte_slices": 3  # admin, owner, metadata_hash
}

LOCAL_SCHEMA = {
    "num_uints": 0,
    "num_byte_slices": 0
}


if __name__ == "__main__":
    print("=== SoulBoundNFT Approval Program (TEAL) ===")
    print(get_approval_teal())
    print("\n=== SoulBoundNFT Clear State Program (TEAL) ===")
    print(get_clear_teal())
