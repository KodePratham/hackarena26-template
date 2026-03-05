# Blockchain Integration Service

Interfaces with the Algorand blockchain and IPFS for decentralizing user milestones and treasury management.

## Features
- **Soul-Bound Tokens (SBTs)**: Mints a unique non-transferable asset for each user upon successful onboarding.
- **IPFS Storage**: Hashes and stores the monthly snapshot data of the user's score to an IPFS node.
- **Challenge Escrow**: Simulates the locking and releasing of stakes on challenge completion using PyTeal architecture.
- **Squad Treasuries**: Deploy multi-signature Squad Treasury wallets for group saving.

## Endpoints
- `POST /blockchain/nft/mint/:userId`: Mint SBT
- `POST /blockchain/nft/update/:userId`: Update Snapshot
- `GET /blockchain/nft/:userId`: Fetch metadata Hash
- `POST /blockchain/escrow/lock`: Lock stake
- `POST /blockchain/escrow/release/:escrowId`: Release stake
- `POST /blockchain/squad/create`: Deploy treasury
- `POST /blockchain/squad/:squadId/deposit`: Deposit to treasury
- `POST /blockchain/squad/:squadId/distribute`: Distribute 
- `GET /blockchain/token/balance/:userId`: VitalToken balance
- `POST /blockchain/token/issue/:userId`: Issue reward token

## ENV Vars
- `PORT`: 3006
- `ALGOD_TOKEN`
- `ALGOD_SERVER`
- `ALGOD_PORT`
- `IPFS_NODE_URL`
