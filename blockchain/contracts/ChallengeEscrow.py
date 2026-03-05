"""
ChallengeEscrow.py — VitalScore Challenge Escrow Smart Contract

This PyTeal contract manages challenge stake escrow on the Algorand blockchain.
Users can stake ALGO on weekly challenges. On completion, the stake is returned
plus a yield share. On failure, the stake is forfeited to the community pool.

Global State:
    - admin: System admin address (oracle/verifier)
    - user_address: The staking user's address
    - stake_amount: Amount staked (in microAlgos)
    - challenge_id: UUID of the associated challenge
    - deadline: Unix timestamp of challenge deadline
    - verified: Whether completion has been verified (0/1)
    - status: Current status (0=LOCKED, 1=RELEASED_SUCCESS, 2=RELEASED_FAILURE)
    - community_pool: Address for failed stake redistribution

Methods:
    - create: Deploy with challenge params
    - verify_completion: Oracle verifies challenge outcome
    - release_success: Return stake to user
    - release_failure: Send stake to community pool
    - extend_deadline: Add 48h extension if verification unavailable
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
    InnerTxnBuilder,
    Mode,
    OnComplete,
    Reject,
    Seq,
    TxnField,
    TxnType,
    Txn,
    compileTeal,
)


def approval_program():
    """Main approval program for ChallengeEscrow contract."""

    # ─── Global State Keys ───
    admin_key = Bytes("admin")
    user_address_key = Bytes("user_address")
    stake_amount_key = Bytes("stake_amount")
    challenge_id_key = Bytes("challenge_id")
    deadline_key = Bytes("deadline")
    verified_key = Bytes("verified")
    status_key = Bytes("status")
    community_pool_key = Bytes("community_pool")

    # Status constants
    STATUS_LOCKED = Int(0)
    STATUS_SUCCESS = Int(1)
    STATUS_FAILURE = Int(2)

    # ─── Helpers ───
    is_admin = Txn.sender() == App.globalGet(admin_key)
    is_locked = App.globalGet(status_key) == STATUS_LOCKED

    # ─── On Creation ───
    # Args: [user_address, stake_amount, challenge_id, deadline, community_pool]
    on_create = Seq(
        App.globalPut(admin_key, Txn.sender()),
        App.globalPut(user_address_key, Txn.application_args[0]),
        App.globalPut(stake_amount_key, Txn.application_args[1]),
        App.globalPut(challenge_id_key, Txn.application_args[2]),
        App.globalPut(deadline_key, Txn.application_args[3]),
        App.globalPut(community_pool_key, Txn.application_args[4]),
        App.globalPut(verified_key, Int(0)),
        App.globalPut(status_key, STATUS_LOCKED),
        Approve(),
    )

    # ─── Verify Completion (Admin/Oracle Only) ───
    # Args: ["verify_completion", success_flag (0 or 1)]
    on_verify = Seq(
        Assert(is_admin),
        Assert(is_locked),
        App.globalPut(verified_key, Int(1)),
        # If success_flag == 1 → mark as success, else failure
        If(
            Txn.application_args[1] == Bytes("1"),
            App.globalPut(status_key, STATUS_SUCCESS),
            App.globalPut(status_key, STATUS_FAILURE),
        ),
        Approve(),
    )

    # ─── Release Success (Admin Only) ───
    # Sends the escrowed funds back to the user
    # Args: ["release_success"]
    on_release_success = Seq(
        Assert(is_admin),
        Assert(App.globalGet(status_key) == STATUS_SUCCESS),
        # Inner transaction: send funds back to user
        InnerTxnBuilder.Begin(),
        InnerTxnBuilder.SetFields({
            TxnField.type_enum: TxnType.Payment,
            TxnField.receiver: App.globalGet(user_address_key),
            # Send the contract's balance minus minimum balance
            TxnField.amount: App.globalGet(stake_amount_key),
            TxnField.fee: Int(0),  # Fee from outer txn
        }),
        InnerTxnBuilder.Submit(),
        Approve(),
    )

    # ─── Release Failure (Admin Only) ───
    # Sends the escrowed funds to the community pool
    # Args: ["release_failure"]
    on_release_failure = Seq(
        Assert(is_admin),
        Assert(App.globalGet(status_key) == STATUS_FAILURE),
        # Inner transaction: send funds to community pool
        InnerTxnBuilder.Begin(),
        InnerTxnBuilder.SetFields({
            TxnField.type_enum: TxnType.Payment,
            TxnField.receiver: App.globalGet(community_pool_key),
            TxnField.amount: App.globalGet(stake_amount_key),
            TxnField.fee: Int(0),
        }),
        InnerTxnBuilder.Submit(),
        Approve(),
    )

    # ─── Extend Deadline (Admin Only) ───
    # Adds 48 hours (172800 seconds) if verification data is unavailable
    # Args: ["extend_deadline"]
    EXTENSION_SECONDS = Int(172800)  # 48 hours

    on_extend_deadline = Seq(
        Assert(is_admin),
        Assert(is_locked),
        App.globalPut(
            deadline_key,
            App.globalGet(deadline_key) + EXTENSION_SECONDS
        ),
        Approve(),
    )

    # ─── NoOp Routing ───
    on_noop = Cond(
        [Txn.application_args[0] == Bytes("verify_completion"), on_verify],
        [Txn.application_args[0] == Bytes("release_success"), on_release_success],
        [Txn.application_args[0] == Bytes("release_failure"), on_release_failure],
        [Txn.application_args[0] == Bytes("extend_deadline"), on_extend_deadline],
    )

    # ─── Delete (Admin Only, after release) ───
    on_delete = Seq(
        Assert(is_admin),
        # Can only delete after funds have been released
        Assert(App.globalGet(status_key) != STATUS_LOCKED),
        Approve(),
    )

    # ─── Main Router ───
    program = Cond(
        [Txn.application_id() == Int(0), on_create],
        [Txn.on_completion() == OnComplete.NoOp, on_noop],
        [Txn.on_completion() == OnComplete.DeleteApplication, on_delete],
        [Txn.on_completion() == OnComplete.OptIn, Reject()],
        [Txn.on_completion() == OnComplete.CloseOut, Reject()],
        [Txn.on_completion() == OnComplete.UpdateApplication, Seq(Assert(is_admin), Approve())],
    )

    return program


def clear_state_program():
    """Clear state — reject to prevent unauthorized clearing."""
    return Reject()


def get_approval_teal():
    """Compile approval program to TEAL."""
    return compileTeal(approval_program(), mode=Mode.Application, version=10)


def get_clear_teal():
    """Compile clear state program to TEAL."""
    return compileTeal(clear_state_program(), mode=Mode.Application, version=10)


# Schema definitions
GLOBAL_SCHEMA = {
    "num_uints": 4,      # stake_amount, deadline, verified, status
    "num_byte_slices": 4  # admin, user_address, challenge_id, community_pool
}

LOCAL_SCHEMA = {
    "num_uints": 0,
    "num_byte_slices": 0
}


if __name__ == "__main__":
    print("=== ChallengeEscrow Approval Program (TEAL) ===")
    print(get_approval_teal())
    print("\n=== ChallengeEscrow Clear State Program (TEAL) ===")
    print(get_clear_teal())
