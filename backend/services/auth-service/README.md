# Auth Service

The Authentication Service for VitalScore Finance. Handles user login (via Web3Auth), JWT token generation, refresh tokens, and session management.

## Endpoints

- `POST /auth/login`: Authenticate and receive tokens
- `POST /auth/refresh`: Refresh an expired access token
- `POST /auth/logout`: Invalidate a session

## Core Technologies
- Express.js
- Web3Auth Node SDK
- JSON Web Tokens (JWT)
- PostgreSQL (for identifying/creating basic profile shells)

## Environment Variables
- `PORT`: Service port (default 3002)
- `JWT_SECRET`: Secret key for access tokens
- `REFRESH_SECRET`: Secret key for refresh tokens
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`: Database connection config
