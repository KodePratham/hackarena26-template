# VitalScore Finance

AI-Driven Gamified Financial Wellness on Blockchain

## Overview

VitalScore Finance is an AI-powered, blockchain-backed mobile and web application that transforms personal financial management into a gamified, socially accountable experience. The system assigns each user a real-time Financial Vitality Score (0–1000) based on spending behavior, savings velocity, and financial habits.

## Architecture

- **Microservices**: User Profile, Transaction Ingestion, Score Engine, Gamification, Blockchain Integration
- **Databases**: PostgreSQL (profiles), InfluxDB (time-series), Redis (cache)
- **Blockchain**: Algorand (Soul-Bound NFTs, Escrow, Squad Treasury)
- **ML/AI**: TensorFlow on AWS SageMaker
- **Infrastructure**: AWS (Mumbai region primary)

## Project Structure

```
vitalscore-finance/
├── backend/
│   ├── services/
│   │   ├── user-profile/
│   │   ├── transaction-ingestion/
│   │   ├── score-engine/
│   │   ├── gamification/
│   │   └── blockchain-integration/
│   ├── shared/
│   └── api-gateway/
├── frontend/
│   ├── mobile/
│   └── web/
├── blockchain/
│   └── contracts/
├── ml/
│   └── categorization/
├── infrastructure/
│   ├── terraform/
│   └── docker/
└── docs/
```

## Getting Started

See individual service README files for setup instructions.

## Documentation

- [Requirements](./Requirements.md)
- [Design Document](./design.md)
- [Implementation Tasks](./tasks.md)
