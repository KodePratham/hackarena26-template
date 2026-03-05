import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import logger from '../config/logger';

const sqsClient = new SQSClient({
    region: process.env.AWS_REGION || 'ap-south-1',
    endpoint: process.env.SQS_ENDPOINT, // e.g., for localstack http://localhost:4566
});

const QUEUE_URL = process.env.TRANSACTION_QUEUE_URL || 'http://localhost:4566/000000000000/vitalscore-transactions';

export class SQSPublisher {
    static async publishTransactionEvent(transactionData: any): Promise<void> {
        try {
            const command = new SendMessageCommand({
                QueueUrl: QUEUE_URL,
                MessageBody: JSON.stringify(transactionData),
                MessageGroupId: transactionData.userToken, // Ensure ordering per user
                MessageDeduplicationId: transactionData.txnId // Deduplication
            });

            await sqsClient.send(command);
            logger.info(`Published transaction event to SQS: ${transactionData.txnId}`);
        } catch (error) {
            logger.error(`Failed to publish transaction to SQS: ${transactionData.txnId}`, error);
            // In production, might want to fallback to a dead letter queue or local database table for retries
            throw error;
        }
    }
}
