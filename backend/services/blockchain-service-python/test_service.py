"""
test_service.py — Unit tests for the Blockchain Integration Flask Service.

Tests verify that all Flask endpoints return correct response shapes,
handle errors properly, and validate input.

Usage:
    cd backend/services/blockchain-service-python
    pip install -r requirements.txt
    python -m pytest test_service.py -v
"""

import pytest
import json
from app import create_app


@pytest.fixture
def client():
    """Create Flask test client."""
    app = create_app()
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


class TestHealthEndpoint:
    """Test the health check endpoint."""

    def test_health_returns_200(self, client):
        """Health endpoint should return 200 OK."""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.get_json()
        assert data["status"] == "OK"
        assert data["service"] == "blockchain-service-python"

    def test_health_includes_algorand_status(self, client):
        """Health endpoint should include Algorand connection status."""
        response = client.get("/health")
        data = response.get_json()
        assert "algorand" in data


class TestNFTEndpoints:
    """Test NFT/SBT endpoints."""

    def test_mint_sbt_requires_body(self, client):
        """POST /nft/mint should reject requests without body."""
        response = client.post("/blockchain/nft/mint/test-user-id")
        assert response.status_code in [400, 500]

    def test_mint_sbt_requires_user_address(self, client):
        """POST /nft/mint should require userAddress field."""
        response = client.post(
            "/blockchain/nft/mint/test-user-id",
            data=json.dumps({"wrongField": "value"}),
            content_type="application/json",
        )
        assert response.status_code == 400
        data = response.get_json()
        assert data["success"] is False
        assert "userAddress" in data["error"]["message"]

    def test_update_snapshot_requires_body(self, client):
        """POST /nft/update should reject empty requests."""
        response = client.post("/blockchain/nft/update/test-user-id")
        assert response.status_code in [400, 500]

    def test_get_nft_metadata_returns_json(self, client):
        """GET /nft/:userId should return JSON response."""
        response = client.get("/blockchain/nft/test-user-id")
        assert response.status_code == 200
        data = response.get_json()
        assert data["success"] is True


class TestEscrowEndpoints:
    """Test Escrow endpoints."""

    def test_lock_stake_requires_all_fields(self, client):
        """POST /escrow/lock should validate required fields."""
        response = client.post(
            "/blockchain/escrow/lock",
            data=json.dumps({"userId": "test"}),
            content_type="application/json",
        )
        assert response.status_code == 400
        data = response.get_json()
        assert data["success"] is False
        assert "VALIDATION_ERROR" in data["error"]["code"]

    def test_lock_stake_validation_fields(self, client):
        """POST /escrow/lock should list missing fields."""
        response = client.post(
            "/blockchain/escrow/lock",
            data=json.dumps({"userId": "u1", "amount": 1000}),
            content_type="application/json",
        )
        assert response.status_code == 400
        data = response.get_json()
        # Should mention missing fields
        assert "Missing" in data["error"]["message"]

    def test_release_stake_requires_success_flag(self, client):
        """POST /escrow/release should require success flag."""
        response = client.post(
            "/blockchain/escrow/release/123",
            data=json.dumps({}),
            content_type="application/json",
        )
        assert response.status_code == 400


class TestSquadTreasuryEndpoints:
    """Test Squad Treasury endpoints."""

    def test_create_treasury_requires_fields(self, client):
        """POST /squad/create should validate required fields."""
        response = client.post(
            "/blockchain/squad/create",
            data=json.dumps({"squadId": "test"}),
            content_type="application/json",
        )
        assert response.status_code == 400
        data = response.get_json()
        assert data["success"] is False

    def test_deposit_requires_fields(self, client):
        """POST /squad/:id/deposit should validate required fields."""
        response = client.post(
            "/blockchain/squad/test-squad/deposit",
            data=json.dumps({"amount": 1000}),
            content_type="application/json",
        )
        assert response.status_code == 400

    def test_distribute_requires_fields(self, client):
        """POST /squad/:id/distribute should validate required fields."""
        response = client.post(
            "/blockchain/squad/test-squad/distribute",
            data=json.dumps({}),
            content_type="application/json",
        )
        assert response.status_code == 400


class TestTokenEndpoints:
    """Test Token endpoints."""

    def test_get_balance_requires_address(self, client):
        """GET /token/balance/:userId should require address param."""
        response = client.get("/blockchain/token/balance/test-user")
        assert response.status_code == 400
        data = response.get_json()
        assert "address" in data["error"]["message"]

    def test_issue_tokens_requires_fields(self, client):
        """POST /token/issue/:userId should validate required fields."""
        response = client.post(
            "/blockchain/token/issue/test-user",
            data=json.dumps({"amount": 100}),
            content_type="application/json",
        )
        assert response.status_code == 400
        data = response.get_json()
        assert data["success"] is False


class TestErrorHandling:
    """Test error handling."""

    def test_404_returns_json(self, client):
        """Unknown routes should return JSON 404."""
        response = client.get("/nonexistent/route")
        assert response.status_code == 404
        data = response.get_json()
        assert data["success"] is False
        assert data["error"]["code"] == "NOT_FOUND"

    def test_queue_status_endpoint(self, client):
        """GET /queue/status should return queue stats."""
        response = client.get("/blockchain/queue/status")
        assert response.status_code == 200
        data = response.get_json()
        assert data["success"] is True
        assert "pending" in data["data"]


class TestResponseFormat:
    """Test standard response format consistency."""

    def test_success_response_shape(self, client):
        """Successful responses should have standard shape."""
        response = client.get("/blockchain/nft/test-user")
        data = response.get_json()
        assert "success" in data
        assert "data" in data
        assert "error" in data

    def test_error_response_shape(self, client):
        """Error responses should have standard shape."""
        response = client.get("/nonexistent/route")
        data = response.get_json()
        assert "success" in data
        assert data["success"] is False
        assert "error" in data
        assert "code" in data["error"]
        assert "message" in data["error"]
