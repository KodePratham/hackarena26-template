import { Router } from 'express';
import { BlockchainController } from '../controllers/BlockchainController';

const router = Router();

// NFTs
router.post('/nft/mint/:userId', BlockchainController.mintNFT);
router.post('/nft/update/:userId', BlockchainController.updateNFT);
router.get('/nft/:userId', BlockchainController.getNFT);

// Escrow
router.post('/escrow/lock', BlockchainController.lockEscrow);
router.post('/escrow/release/:escrowId', BlockchainController.releaseEscrow);

// Squads
router.post('/squad/create', BlockchainController.createSquadTreasury);
router.post('/squad/:squadId/deposit', BlockchainController.squadDeposit);
router.post('/squad/:squadId/distribute', BlockchainController.squadDistribute);

// Tokens
router.get('/token/balance/:userId', BlockchainController.getTokenBalance);
router.post('/token/issue/:userId', BlockchainController.issueTokens);

export default router;
