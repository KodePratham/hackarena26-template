# Gamification Service

Handles challenges, squads, staking, and overall gamification features for the VitalScore platform.

## Features
- **Personalized Challenges**: Dynamically generated challenges based on user spending drops.
- **Squad Mode**: Group tracking, pooling of funds, simulated DeFi yield generation.
- **Commitment Escrow**: Simulated staking on challenges.
- **Stubs**: Points, League assignments, Badges, and Streaks mechanisms are prototyped.

## Endpoints
- `GET /gamification/challenges/:userId`: Retrieve challenges
- `POST /gamification/challenges/:userId/:challengeId/stake`: Stake on a challenge
- `GET /gamification/challenges/:userId/history`: Past challenges
- `POST /gamification/squads`: Create a squad
- `POST /gamification/squads/:squadId/join`: Join squad
- `GET /gamification/squads/:squadId`: View squad details, members, yields

## Config
- `PORT`: 3005
- Standard PG database ENV variables
