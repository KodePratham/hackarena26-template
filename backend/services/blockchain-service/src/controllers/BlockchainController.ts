import { Request, Response } from 'express';
import logger from '../config/logger';
import { NFTService } from '../services/NFTService';
import { EscrowService } from '../services/EscrowService';
import { SquadTreasuryService } from '../services/SquadTreasuryService';
import { TokenService } from '../services/TokenService';

export class BlockchainController {

    // -- NFTs --
    static async mintNFT(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;
            const { userAddress } = req.body;
            const result = await NFTService.mintSBT(userId, userAddress);
            res.status(201).json({ success: true, data: result });
        } catch (error: any) {
            res.status(500).json({ success: false, error: { message: error.message } });
        }
    }

    static async updateNFT(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;
            const { snapshotData } = req.body;
            const result = await NFTService.updateMonthlySnapshot(userId, snapshotData);
            res.status(200).json({ success: true, data: result });
        } catch (error: any) {
            res.status(500).json({ success: false, error: { message: error.message } });
        }
    }

    static async getNFT(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;
            const result = await NFTService.getNFTMetadata(userId);
            res.status(200).json({ success: true, data: result });
        } catch (error: any) {
            res.status(404).json({ success: false, error: { message: error.message } });
        }
    }

    // -- Escrow --
    static async lockEscrow(req: Request, res: Response): Promise<void> {
        try {
            const { userId, challengeId, amount } = req.body;
            const result = await EscrowService.lockStake(userId, challengeId, amount);
            res.status(200).json({ success: true, data: result });
        } catch (error: any) {
            res.status(500).json({ success: false, error: { message: error.message } });
        }
    }

    static async releaseEscrow(req: Request, res: Response): Promise<void> {
        try {
            const { escrowId } = req.params;
            const { success, oracleSignature } = req.body;
            const result = await EscrowService.releaseStake(escrowId, success, oracleSignature);
            res.status(200).json({ success: true, data: result });
        } catch (error: any) {
            res.status(500).json({ success: false, error: { message: error.message } });
        }
    }

    // -- Squads --
    static async createSquadTreasury(req: Request, res: Response): Promise<void> {
        try {
            const { squadId, initialMembers } = req.body;
            const result = await SquadTreasuryService.deployTreasury(squadId, initialMembers);
            res.status(201).json({ success: true, data: result });
        } catch (error: any) {
            res.status(500).json({ success: false, error: { message: error.message } });
        }
    }

    static async squadDeposit(req: Request, res: Response): Promise<void> {
        try {
            const { squadId } = req.params;
            const { userId, amount } = req.body;
            const result = await SquadTreasuryService.deposit(squadId, userId, amount);
            res.status(200).json({ success: true, data: result });
        } catch (error: any) {
            res.status(500).json({ success: false, error: { message: error.message } });
        }
    }

    static async squadDistribute(req: Request, res: Response): Promise<void> {
        try {
            const { squadId } = req.params;
            const result = await SquadTreasuryService.executeDistribution(squadId);
            res.status(200).json({ success: true, data: result });
        } catch (error: any) {
            res.status(500).json({ success: false, error: { message: error.message } });
        }
    }

    // -- Tokens --
    static async getTokenBalance(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;
            const result = await TokenService.getBalance(userId);
            res.status(200).json({ success: true, data: result });
        } catch (error: any) {
            res.status(500).json({ success: false, error: { message: error.message } });
        }
    }

    static async issueTokens(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;
            const { amount, reason } = req.body;
            const result = await TokenService.issueTokens(userId, amount, reason);
            res.status(200).json({ success: true, data: result });
        } catch (error: any) {
            res.status(500).json({ success: false, error: { message: error.message } });
        }
    }
}
