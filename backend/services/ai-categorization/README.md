# AI/ML Categorization Engine

Classifies raw transaction descriptions into standardized categories using a hybrid approach of Rule-Based Matching (Layer 1) and Machine Learning (Layer 2). Provides endpoints for real-time and batch categorization.

## Features
- **Layer 1: Rule-Based Classifier**: Uses predefined patterns and fuzzy string matching for high-confidence immediate classification.
- **Layer 2: ML Classifier (Mocked)**: Simulates invoking a SageMaker endpoint for transactions that fail Layer 1. Includes fallback stochastic logic.
- **Federated Learning Stub**: Provides an endpoint for syncing federated learning payload weights from edge devices.

## Endpoints
- `POST /ml/categorize`: Categorize a single transaction
- `POST /ml/categorize/batch`: Categorize an array of transactions
- `POST /ml/federated/sync/:userId`: Sync client-side weights

## Config
- `PORT`: 3007
- Standalone service, no direct DB connections currently required (logic is stateless).
