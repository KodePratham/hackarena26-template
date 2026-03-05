"""
SquadTreasury.py — VitalScore Squad Treasury Smart Contract

This PyTeal contract manages Squad Savings Pool treasuries on Algorand.
Members contribute weekly, funds earn yield, and at season-end the yield
is distributed weighted by each member's VitalScore improvement.

Global State:
    - admin: System admin address
    - creator: Squad creator address
    - season_end: Unix timestamp for season end
    - total_contributed: Total ALGO contributed by all members
    - yield_accumulated: Total yield earned (recorded off-chain, stored on-chain)
    - member_count: Number of members in the squad
    - status: 0=ACTIVE, 1=DISTRIBUTING, 2=COMPLETED

Local State (per member, via opt-in):
    - contributed: Total amount contributed by this member
    - score_improvement: VitalScore improvement % (set by admin for distribution)

Methods:
    - create: Deploy treasury with season params
    - opt_in: Member joins the squad
    - deposit: Member contributes funds
    - record_yield: Admin records yield earned from DeFi
    - set_score_improvement: Admin sets member's score improvement for weighted distribution
    - distribute: Distribute yield weighted by score improvement
    - emergency_withdraw: Return all principal to members (admin only)
"""

from pyteal import (
    Approve,
    App,
    Assert,
    Btoi,
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
    Txn,
    TxnField,
    TxnType,
    compileTeal,
)


def approval_program():
    """Main approval program for SquadTreasury contract."""

    # ─── Global State Keys ───
    admin_key = Bytes("admin")
    creator_key = Bytes("creator")
    season_end_key = Bytes("season_end")
    total_contributed_key = Bytes("total_contributed")
    yield_accumulated_key = Bytes("yield_accumulated")
    member_count_key = Bytes("member_count")
    status_key = Bytes("status")
    max_members_key = Bytes("max_members")

    # ─── Local State Keys ───
    contributed_key = Bytes("contributed")
    score_improvement_key = Bytes("score_improvement")

    # Status constants
    STATUS_ACTIVE = Int(0)
    STATUS_DISTRIBUTING = Int(1)
    STATUS_COMPLETED = Int(2)

    # ─── Helpers ───
    is_admin = Txn.sender() == App.globalGet(admin_key)
    is_active = App.globalGet(status_key) == STATUS_ACTIVE

    # ─── On Creation ───
    # Args: [creator_address, season_end_timestamp, max_members]
    on_create = Seq(
        App.globalPut(admin_key, Txn.sender()),
        App.globalPut(creator_key, Txn.application_args[0]),
        App.globalPut(season_end_key, Btoi(Txn.application_args[1])),
        App.globalPut(max_members_key, Btoi(Txn.application_args[2])),
        App.globalPut(total_contributed_key, Int(0)),
        App.globalPut(yield_accumulated_key, Int(0)),
        App.globalPut(member_count_key, Int(0)),
        App.globalPut(status_key, STATUS_ACTIVE),
        Approve(),
    )

    # ─── Opt-In (Member Joins Squad) ───
    on_optin = Seq(
        Assert(is_active),
        # Enforce max member limit
        Assert(App.globalGet(member_count_key) < App.globalGet(max_members_key)),
        # Initialize local state for new member
        App.localPut(Txn.sender(), contributed_key, Int(0)),
        App.localPut(Txn.sender(), score_improvement_key, Int(0)),
        # Increment member count
        App.globalPut(
            member_count_key,
            App.globalGet(member_count_key) + Int(1)
        ),
        Approve(),
    )

    # ─── Deposit (Member Contributes) ───
    # This is called in a group txn where the preceding txn is a payment to the contract
    # Args: ["deposit", amount]
    on_deposit = Seq(
        Assert(is_active),
        # Update member's contributed amount
        App.localPut(
            Txn.sender(),
            contributed_key,
            App.localGet(Txn.sender(), contributed_key) + Btoi(Txn.application_args[1])
        ),
        # Update global total
        App.globalPut(
            total_contributed_key,
            App.globalGet(total_contributed_key) + Btoi(Txn.application_args[1])
        ),
        Approve(),
    )

    # ─── Record Yield (Admin Only) ───
    # Args: ["record_yield", yield_amount]
    on_record_yield = Seq(
        Assert(is_admin),
        App.globalPut(
            yield_accumulated_key,
            App.globalGet(yield_accumulated_key) + Btoi(Txn.application_args[1])
        ),
        Approve(),
    )

    # ─── Set Score Improvement (Admin Only) ───
    # Args: ["set_score", member_address, improvement_value]
    on_set_score = Seq(
        Assert(is_admin),
        App.localPut(
            Txn.application_args[1],  # member address
            score_improvement_key,
            Btoi(Txn.application_args[2])   # improvement value
        ),
        Approve(),
    )

    # ─── Begin Distribution (Admin Only) ───
    # Args: ["begin_distribution"]
    on_begin_distribution = Seq(
        Assert(is_admin),
        Assert(is_active),
        App.globalPut(status_key, STATUS_DISTRIBUTING),
        Approve(),
    )

    # ─── Distribute to Member (Admin Only) ───
    # Sends principal + weighted yield to a specific member
    # Args: ["distribute", member_address, total_amount]
    on_distribute = Seq(
        Assert(is_admin),
        Assert(App.globalGet(status_key) == STATUS_DISTRIBUTING),
        # Inner transaction: pay member their share
        InnerTxnBuilder.Begin(),
        InnerTxnBuilder.SetFields({
            TxnField.type_enum: TxnType.Payment,
            TxnField.receiver: Txn.application_args[1],  # member address
            TxnField.amount: Btoi(Txn.application_args[2]),     # total payout
            TxnField.fee: Int(0),
        }),
        InnerTxnBuilder.Submit(),
        Approve(),
    )

    # ─── Complete Season (Admin Only) ───
    # Args: ["complete"]
    on_complete = Seq(
        Assert(is_admin),
        App.globalPut(status_key, STATUS_COMPLETED),
        Approve(),
    )

    # ─── Emergency Withdraw (Admin Only) ───
    # Returns all funds to a specified address — used for emergency situations
    # Args: ["emergency_withdraw", recipient_address]
    on_emergency = Seq(
        Assert(is_admin),
        # Send entire contract balance to recipient
        InnerTxnBuilder.Begin(),
        InnerTxnBuilder.SetFields({
            TxnField.type_enum: TxnType.Payment,
            TxnField.receiver: Txn.application_args[1],
            TxnField.close_remainder_to: Txn.application_args[1],
            TxnField.fee: Int(0),
        }),
        InnerTxnBuilder.Submit(),
        App.globalPut(status_key, STATUS_COMPLETED),
        Approve(),
    )

    # ─── NoOp Routing ───
    on_noop = Cond(
        [Txn.application_args[0] == Bytes("deposit"), on_deposit],
        [Txn.application_args[0] == Bytes("record_yield"), on_record_yield],
        [Txn.application_args[0] == Bytes("set_score"), on_set_score],
        [Txn.application_args[0] == Bytes("begin_distribution"), on_begin_distribution],
        [Txn.application_args[0] == Bytes("distribute"), on_distribute],
        [Txn.application_args[0] == Bytes("complete"), on_complete],
        [Txn.application_args[0] == Bytes("emergency_withdraw"), on_emergency],
    )

    # ─── Close Out ───
    on_closeout = Approve()

    # ─── Delete (Admin Only, after completed) ───
    on_delete = Seq(
        Assert(is_admin),
        Assert(App.globalGet(status_key) == STATUS_COMPLETED),
        Approve(),
    )

    # ─── Main Router ───
    program = Cond(
        [Txn.application_id() == Int(0), on_create],
        [Txn.on_completion() == OnComplete.NoOp, on_noop],
        [Txn.on_completion() == OnComplete.OptIn, on_optin],
        [Txn.on_completion() == OnComplete.CloseOut, on_closeout],
        [Txn.on_completion() == OnComplete.DeleteApplication, on_delete],
        [Txn.on_completion() == OnComplete.UpdateApplication, Seq(Assert(is_admin), Approve())],
    )

    return program


def clear_state_program():
    """Clear state — allow members to clear their local state."""
    return Approve()


def get_approval_teal():
    """Compile approval program to TEAL."""
    return compileTeal(approval_program(), mode=Mode.Application, version=10)


def get_clear_teal():
    """Compile clear state program to TEAL."""
    return compileTeal(clear_state_program(), mode=Mode.Application, version=10)


# Schema definitions
GLOBAL_SCHEMA = {
    "num_uints": 6,      # season_end, total_contributed, yield_accumulated, member_count, status, max_members
    "num_byte_slices": 2  # admin, creator
}

LOCAL_SCHEMA = {
    "num_uints": 2,       # contributed, score_improvement
    "num_byte_slices": 0
}


if __name__ == "__main__":
    print("=== SquadTreasury Approval Program (TEAL) ===")
    print(get_approval_teal())
    print("\n=== SquadTreasury Clear State Program (TEAL) ===")
    print(get_clear_teal())
