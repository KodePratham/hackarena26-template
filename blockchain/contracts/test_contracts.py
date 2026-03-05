"""
test_contracts.py — Unit tests for VitalScore PyTeal smart contracts.

Tests verify that all contracts compile to valid TEAL and have correct schemas.

Usage:
    cd blockchain/contracts
    pip install -r requirements.txt
    python -m pytest test_contracts.py -v
"""

import pytest


class TestSoulBoundNFT:
    """Tests for the SoulBoundNFT contract."""

    def test_approval_compiles(self):
        """Verify approval program compiles to valid TEAL."""
        from SoulBoundNFT import get_approval_teal
        teal = get_approval_teal()
        assert teal is not None
        assert len(teal) > 0
        assert "#pragma version 10" in teal

    def test_clear_compiles(self):
        """Verify clear state program compiles to valid TEAL."""
        from SoulBoundNFT import get_clear_teal
        teal = get_clear_teal()
        assert teal is not None
        assert len(teal) > 0
        assert "#pragma version 10" in teal

    def test_clear_program_rejects(self):
        """Verify clear state program always rejects (SBT cannot be cleared)."""
        from SoulBoundNFT import get_clear_teal
        teal = get_clear_teal()
        # Should contain int 0 (reject) — TEAL v10 may add 'return' after
        assert "int 0" in teal

    def test_schema_definitions(self):
        """Verify schema counts are correct."""
        from SoulBoundNFT import GLOBAL_SCHEMA, LOCAL_SCHEMA
        assert GLOBAL_SCHEMA["num_uints"] >= 2
        assert GLOBAL_SCHEMA["num_byte_slices"] >= 3
        assert LOCAL_SCHEMA["num_uints"] == 0
        assert LOCAL_SCHEMA["num_byte_slices"] == 0

    def test_approval_contains_key_operations(self):
        """Verify approval TEAL contains expected operations."""
        from SoulBoundNFT import get_approval_teal
        teal = get_approval_teal()
        # Should contain global state operations
        assert "app_global_put" in teal
        assert "app_global_get" in teal


class TestChallengeEscrow:
    """Tests for the ChallengeEscrow contract."""

    def test_approval_compiles(self):
        """Verify approval program compiles to valid TEAL."""
        from ChallengeEscrow import get_approval_teal
        teal = get_approval_teal()
        assert teal is not None
        assert len(teal) > 0
        assert "#pragma version 10" in teal

    def test_clear_compiles(self):
        """Verify clear state program compiles."""
        from ChallengeEscrow import get_clear_teal
        teal = get_clear_teal()
        assert teal is not None
        assert "#pragma version 10" in teal

    def test_schema_definitions(self):
        """Verify schema counts are correct."""
        from ChallengeEscrow import GLOBAL_SCHEMA, LOCAL_SCHEMA
        assert GLOBAL_SCHEMA["num_uints"] >= 3
        assert GLOBAL_SCHEMA["num_byte_slices"] >= 3
        assert LOCAL_SCHEMA["num_uints"] == 0

    def test_inner_transactions_present(self):
        """Verify TEAL includes inner transaction opcodes for fund releases."""
        from ChallengeEscrow import get_approval_teal
        teal = get_approval_teal()
        assert "itxn_begin" in teal
        assert "itxn_submit" in teal
        assert "itxn_field" in teal.lower() or "itxn_field" in teal

    def test_contains_escrow_methods(self):
        """Verify TEAL contains all escrow method strings."""
        from ChallengeEscrow import get_approval_teal
        teal = get_approval_teal()
        for method in ["verify_completion", "release_success", "release_failure", "extend_deadline"]:
            assert method in teal, f"Missing method: {method}"


class TestSquadTreasury:
    """Tests for the SquadTreasury contract."""

    def test_approval_compiles(self):
        """Verify approval program compiles to valid TEAL."""
        from SquadTreasury import get_approval_teal
        teal = get_approval_teal()
        assert teal is not None
        assert len(teal) > 0
        assert "#pragma version 10" in teal

    def test_clear_compiles(self):
        """Verify clear state program compiles."""
        from SquadTreasury import get_clear_teal
        teal = get_clear_teal()
        assert teal is not None

    def test_clear_program_approves(self):
        """Verify clear state allows members to leave (unlike SBT)."""
        from SquadTreasury import get_clear_teal
        teal = get_clear_teal()
        # Should contain int 1 (approve) — TEAL v10 may add 'return' after
        assert "int 1" in teal

    def test_schema_definitions(self):
        """Verify schema includes local state for member tracking."""
        from SquadTreasury import GLOBAL_SCHEMA, LOCAL_SCHEMA
        assert GLOBAL_SCHEMA["num_uints"] >= 4
        assert LOCAL_SCHEMA["num_uints"] >= 2  # contributed, score_improvement

    def test_contains_treasury_methods(self):
        """Verify TEAL contains all treasury method strings."""
        from SquadTreasury import get_approval_teal
        teal = get_approval_teal()
        for method in ["deposit", "record_yield", "distribute", "emergency_withdraw"]:
            assert method in teal, f"Missing method: {method}"

    def test_inner_transactions_present(self):
        """Verify TEAL includes inner transaction opcodes for distributions."""
        from SquadTreasury import get_approval_teal
        teal = get_approval_teal()
        assert "itxn_begin" in teal
        assert "itxn_submit" in teal


class TestCompileAll:
    """Test the compile_contracts script."""

    def test_compile_all_succeeds(self):
        """Verify all contracts compile successfully via compile_contracts."""
        from compile_contracts import compile_all
        results = compile_all()
        assert len(results) == 3
        for result in results:
            assert result["approval_lines"] > 0
            assert result["clear_lines"] > 0

    def test_build_files_created(self):
        """Verify TEAL files are created in build directory."""
        import os
        from compile_contracts import compile_all, BUILD_DIR
        compile_all()

        expected_files = [
            "SoulBoundNFT_approval.teal",
            "SoulBoundNFT_clear.teal",
            "ChallengeEscrow_approval.teal",
            "ChallengeEscrow_clear.teal",
            "SquadTreasury_approval.teal",
            "SquadTreasury_clear.teal",
            "manifest.json",
        ]

        for fname in expected_files:
            fpath = os.path.join(BUILD_DIR, fname)
            assert os.path.exists(fpath), f"Missing build file: {fname}"


class TestVitalToken:
    """Tests for VitalToken ASA helper module."""

    def test_config_exists(self):
        """Verify token configuration is defined."""
        from VitalToken import VITAL_TOKEN_CONFIG
        assert VITAL_TOKEN_CONFIG["asset_name"] == "VitalToken"
        assert VITAL_TOKEN_CONFIG["unit_name"] == "VITAL"
        assert VITAL_TOKEN_CONFIG["total"] == 1_000_000_000
        assert VITAL_TOKEN_CONFIG["decimals"] == 6

    def test_functions_importable(self):
        """Verify all public functions are importable."""
        from VitalToken import (
            create_vital_token_asa,
            opt_in_to_token,
            issue_tokens,
            get_balance,
            burn_tokens,
            create_algod_client,
        )
        # Functions exist and are callable
        assert callable(create_vital_token_asa)
        assert callable(opt_in_to_token)
        assert callable(issue_tokens)
        assert callable(get_balance)
        assert callable(burn_tokens)
        assert callable(create_algod_client)
