import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';
import logger from '../config/logger';
import { ScoreCalculationService } from '../services/ScoreCalculationService';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database';

const sqsClient = new SQSClient({
    region: process.env.AWS_REGION || 'ap-south-1',
    endpoint: process.env.SQS_ENDPOINT, // e.g., for localstack http://localhost:4566
});

const QUEUE_URL = process.env.TRANSACTION_QUEUE_URL || 'http://localhost:4566/000000000000/vitalscore-transactions';

export class TransactionEventWorker {
    private isRunning: boolean = false;

    async start() {
        this.isRunning = true;
        logger.info('Transaction Event Worker started');
        while (this.isRunning) {
            await this.pollQueue();
        }
    }

    stop() {
        this.isRunning = false;
        logger.info('Transaction Event Worker stopping...');
    }

    private async pollQueue() {
        try {
            const command = new ReceiveMessageCommand({
                QueueUrl: QUEUE_URL,
                MaxNumberOfMessages: 10,
                WaitTimeSeconds: 20, // Long polling
            });

            const response = await sqsClient.send(command);

            if (response.Messages && response.Messages.length > 0) {
                for (const message of response.Messages) {
                    await this.processMessage(message);
                }
            }
        } catch (error) {
            logger.error('Error polling SQS queue', error);
            // Backoff before retrying
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }

    private async processMessage(message: any) {
        try {
            if (!message.Body) return;

            const transactionData = JSON.parse(message.Body);
            logger.info(`Processing transaction event for txnId: ${transactionData.txnId}`);

            // Map back from token to userId for score calculation
            const userRes = await pool.query('SELECT "userId" FROM user_tokens WHERE "userToken" = $1 LIMIT 1', [transactionData.userToken]);
            const userId = userRes.rows[0]?.userId;

            if (!userId) {
                logger.warn(`Could not find user for userToken: ${transactionData.userToken}`);
            } else {
                // Trigger micro-update calculation
                const result = await ScoreCalculationService.calculateVitalScore(userId, 'realtime');

                if (result.status !== 'NO_DATA') {
                    // Persist micro-update
                    const snapshotId = uuidv4();
                    await pool.query(
                        `INSERT INTO score_snapshots ("snapshotId", "userId", timestamp, "periodType", score, band, components)
             VALUES ($1, $2, NOW(), $3, $4, $5, $6)`,
                        [snapshotId, userId, 'REALTIME', result.score, result.band, JSON.stringify(result.components)]
                    );
                    logger.info(`Real-time score update for ${userId}: ${result.score}`);
                }
            }

            // Delete message from queue
            const deleteCommand = new DeleteMessageCommand({
                QueueUrl: QUEUE_URL,
                ReceiptHandle: message.ReceiptHandle,
            });
            await sqsClient.send(deleteCommand);

        } catch (error) {
            logger.error('Error processing SQS message', error);
        }
    }
}
