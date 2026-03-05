import algosdk from 'algosdk';
import { algodClient } from '../config/algorand';
import logger from '../config/logger';
import pool from '../config/database';
import { create as ipfsClient } from 'ipfs-http-client';
import { v4 as uuidv4 } from 'uuid';

const ipfs = ipfsClient({ url: process.env.IPFS_NODE_URL || 'http://localhost:5001' });

export class NFTService {
    /**
     * 9.1.1 POST /nft/mint/{userId}
     * Mints a Soul-Bound Token (SBT) for a new user
     */
    static async mintSBT(userId: string, userAddress: string) {
        logger.info(`Minting Soul-Bound Token for user ${userId} at address ${userAddress}`);
        try {
            // 9.3 Implement IPFS Integration
            const initialMetadata = {
                standard: 'arc69',
                ownerAddress: userAddress,
                createdAt: new Date().toISOString(),
                monthlySnapshots: [],
                badges: [],
                aggregateSummary: {}
            };

            // Mock IPFS Add (since real node might not be running)
            // const { path } = await ipfs.add(JSON.stringify(initialMetadata));
            const mockIpfsHash = `QmMockHash${Date.now()}`;

            // 9.2.1 Mocking the Algorand logic to issue the SBT ASA
            const mockAssetId = Math.floor(Math.random() * 1000000);

            const tokenId = uuidv4();
            await pool.query(
                'INSERT INTO user_tokens ("tokenId", "userId", type, "assetId", "ipfsHash", "issuedAt") VALUES ($1, $2, $3, $4, $5, NOW())',
                [tokenId, userId, 'SBT', mockAssetId, mockIpfsHash]
            );

            return {
                success: true,
                assetId: mockAssetId,
                ipfsHash: mockIpfsHash,
                metadata: initialMetadata
            };
        } catch (error) {
            logger.error('Failed to mint SBT', error);
            throw error;
        }
    }

    /**
     * 9.1.2 POST /nft/update/{userId}
     * 9.5 Monthly NFT snapshot updates
     */
    static async updateMonthlySnapshot(userId: string, snapshotData: any) {
        logger.info(`Updating monthly snapshot for user ${userId}`);
        // 9.5.5 Cryptographic hash of scoring inputs
        const inputHash = "0xMockHashOfInputs";

        // In reality, we fetch current metadata from IPFS, append snapshot, re-pin it, and issue an asset config tx
        const newIpfsHash = `QmUpdatedMockHash${Date.now()}`;

        await pool.query(
            'UPDATE user_tokens SET "ipfsHash" = $1 WHERE "userId" = $2 AND type = \'SBT\'',
            [newIpfsHash, userId]
        );

        return { success: true, newIpfsHash, snapshotAdded: { ...snapshotData, inputHash } };
    }

    /**
     * 9.1.3 GET /nft/{userId}
     */
    static async getNFTMetadata(userId: string) {
        const res = await pool.query('SELECT "assetId", "ipfsHash" FROM user_tokens WHERE "userId" = $1 AND type = \'SBT\'', [userId]);
        if (res.rows.length === 0) throw new Error('NFT not found');

        return {
            assetId: res.rows[0].assetId,
            ipfsHash: res.rows[0].ipfsHash,
            metadataUrl: `ipfs://${res.rows[0].ipfsHash}`
        };
    }
}
