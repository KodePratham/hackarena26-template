import axios from 'axios';
import logger from '../config/logger';

export class SetuIntegrationService {

    /**
     * Task 5.2.1: Initiate RBI-compliant consent flow via Setu
     */
    static async createConsentRequest(userId: string, phone: string): Promise<any> {
        try {
            // Mocking integration for hackathon setup
            logger.info(`Creating Setu consent request for user: ${userId}`);
            return {
                consentId: 'mock-consent-id-123',
                status: 'PENDING',
                url: 'https://sandbox.setu.co/consent/mock'
            };
        } catch (error) {
            logger.error('Setu link failed', error);
            throw error;
        }
    }

    /**
     * Task 5.2.2: Implement 90-day historical data pull
     */
    static async fetchHistoricalTransactions(connectionId: string): Promise<any[]> {
        logger.info(`Fetching 90-day transaction history for connection: ${connectionId}`);

        // Return mock 90-day data
        return [
            {
                id: 'external-txn-1',
                amount: 850.00,
                type: 'DEBIT',
                description: 'Zomato Ltd 18001234567',
                timestamp: new Date().toISOString()
            },
            {
                id: 'external-txn-2',
                amount: 45000.00,
                type: 'CREDIT',
                description: 'SALARY NEFT',
                timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'external-txn-3',
                amount: 3000.00,
                type: 'DEBIT',
                description: 'MAHANAGAR GAS LTD',
                timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
            }
        ];
    }
}
