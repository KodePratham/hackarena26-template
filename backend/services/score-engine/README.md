# Score Engine Service

Calculates, stores, and serves the VitalScore for all users. Manages rolling averages, inflation adjustments, streak tracking, and forecast generation based on inputs pulled from `Transaction Ingestion Service`.

## Features
- Full formula implementation for `VitalScore` calculation
- Component breakdown API
- Nightly batch recalculation worker using `node-cron`
- Real-time `micro-updates` by listening to `Transaction Events` via AWS SQS.
- Score Forecast projection implementation for trajectory mapping.

## Config
- `PORT`: 3004
- `AWS_REGION`: Must match ingestion service
- `TRANSACTION_QUEUE_URL`: Target SQS URL to consume from
- standard PostgreSQL envs
