"""
app.py — VitalScore Blockchain Integration Service (Python Flask)

Main entry point for the blockchain service. Replaces the TypeScript mock
implementation with real Algorand blockchain interactions using PyTeal
smart contracts and the py-algorand-sdk.

Features:
    - Soul-Bound Token (SBT) minting and updates
    - Challenge Escrow lock/release
    - Squad Treasury deploy/deposit/distribute
    - VitalToken ASA management
    - IPFS metadata pinning
    - Redis-backed transaction queue

Usage:
    Development:  python app.py
    Production:   gunicorn -w 4 -b 0.0.0.0:3006 app:app
"""

import os
from flask import Flask, jsonify
from flask_cors import CORS

from config import PORT, DEBUG, logger, check_algorand_status
from routes import blockchain_bp


def create_app():
    """Create and configure the Flask application."""
    app = Flask(__name__)

    # ─── Middleware ───
    CORS(app, origins=os.getenv("CORS_ORIGIN", "*"))

    # ─── Register Blueprints ───
    app.register_blueprint(blockchain_bp)

    # ─── Health Check ───
    @app.route("/health", methods=["GET"])
    def health():
        algo_status = check_algorand_status()
        return jsonify({
            "status": "OK",
            "service": "blockchain-service-python",
            "algorand": algo_status,
        }), 200

    # ─── Error Handlers ───
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({
            "success": False,
            "data": None,
            "error": {"code": "NOT_FOUND", "message": "Endpoint not found"},
        }), 404

    @app.errorhandler(500)
    def internal_error(e):
        logger.error(f"Internal server error: {e}")
        return jsonify({
            "success": False,
            "data": None,
            "error": {"code": "INTERNAL_SERVER_ERROR", "message": "An internal error occurred"},
        }), 500

    @app.errorhandler(429)
    def rate_limit_exceeded(e):
        return jsonify({
            "success": False,
            "data": None,
            "error": {"code": "RATE_LIMITED", "message": "Too many requests. Please try again later."},
        }), 429

    return app


# Create the Flask app
app = create_app()


if __name__ == "__main__":
    logger.info(f"Starting Blockchain Service on port {PORT}")
    logger.info("Checking Algorand node connection...")
    check_algorand_status()
    app.run(host="0.0.0.0", port=PORT, debug=DEBUG)
