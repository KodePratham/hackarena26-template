"""
compile_contracts.py — Compile all PyTeal contracts to TEAL output files.

Usage:
    python compile_contracts.py

This generates TEAL files in the build/ directory for each contract:
    - SoulBoundNFT_approval.teal / SoulBoundNFT_clear.teal
    - ChallengeEscrow_approval.teal / ChallengeEscrow_clear.teal
    - SquadTreasury_approval.teal / SquadTreasury_clear.teal
"""

import os
import json
from SoulBoundNFT import (
    get_approval_teal as sbt_approval,
    get_clear_teal as sbt_clear,
    GLOBAL_SCHEMA as SBT_GLOBAL,
    LOCAL_SCHEMA as SBT_LOCAL,
)
from ChallengeEscrow import (
    get_approval_teal as escrow_approval,
    get_clear_teal as escrow_clear,
    GLOBAL_SCHEMA as ESCROW_GLOBAL,
    LOCAL_SCHEMA as ESCROW_LOCAL,
)
from SquadTreasury import (
    get_approval_teal as treasury_approval,
    get_clear_teal as treasury_clear,
    GLOBAL_SCHEMA as TREASURY_GLOBAL,
    LOCAL_SCHEMA as TREASURY_LOCAL,
)


BUILD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "build")


CONTRACTS = [
    {
        "name": "SoulBoundNFT",
        "approval": sbt_approval,
        "clear": sbt_clear,
        "global_schema": SBT_GLOBAL,
        "local_schema": SBT_LOCAL,
    },
    {
        "name": "ChallengeEscrow",
        "approval": escrow_approval,
        "clear": escrow_clear,
        "global_schema": ESCROW_GLOBAL,
        "local_schema": ESCROW_LOCAL,
    },
    {
        "name": "SquadTreasury",
        "approval": treasury_approval,
        "clear": treasury_clear,
        "global_schema": TREASURY_GLOBAL,
        "local_schema": TREASURY_LOCAL,
    },
]


def compile_all():
    """Compile all PyTeal contracts and write TEAL files to build/."""
    os.makedirs(BUILD_DIR, exist_ok=True)

    results = []

    for contract in CONTRACTS:
        name = contract["name"]
        print(f"Compiling {name}...")

        # Generate TEAL
        approval_teal = contract["approval"]()
        clear_teal = contract["clear"]()

        # Write approval program
        approval_path = os.path.join(BUILD_DIR, f"{name}_approval.teal")
        with open(approval_path, "w") as f:
            f.write(approval_teal)

        # Write clear state program
        clear_path = os.path.join(BUILD_DIR, f"{name}_clear.teal")
        with open(clear_path, "w") as f:
            f.write(clear_teal)

        result = {
            "contract": name,
            "approval_file": approval_path,
            "clear_file": clear_path,
            "approval_lines": len(approval_teal.splitlines()),
            "clear_lines": len(clear_teal.splitlines()),
            "global_schema": contract["global_schema"],
            "local_schema": contract["local_schema"],
        }
        results.append(result)

        print(f"  ✓ {name}_approval.teal ({result['approval_lines']} lines)")
        print(f"  ✓ {name}_clear.teal ({result['clear_lines']} lines)")

    # Write manifest
    manifest_path = os.path.join(BUILD_DIR, "manifest.json")
    with open(manifest_path, "w") as f:
        json.dump(results, f, indent=2)

    print(f"\n✅ All {len(CONTRACTS)} contracts compiled successfully!")
    print(f"📁 Output directory: {BUILD_DIR}")
    print(f"📋 Manifest: {manifest_path}")

    return results


if __name__ == "__main__":
    compile_all()
