import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database';
import logger from '../config/logger';
import { EscrowService } from './EscrowService';

export class SquadService {
    /**
     * 8.1.4 POST /squads
     */
    static async createSquad(creatorId: string, name: string, description: string, goalAmount: number, weeklyContribution: number, seasonDurationDays: number) {
        const squadId = uuidv4();
        await pool.query(
            'INSERT INTO squads ("squadId", name, description, "goalAmount", "weeklyContribution", "seasonDurationDays", "currentPoolSize") VALUES ($1, $2, $3, $4, $5, $6, 0)',
            [squadId, name, description, goalAmount, weeklyContribution, seasonDurationDays]
        );

        // Auto join creator as ADMIN
        await pool.query(
            'INSERT INTO squad_members ("squadId", "userId", role, "joinedAt") VALUES ($1, $2, $3, NOW())',
            [squadId, creatorId, 'ADMIN']
        );

        return { squadId, name, status: 'CREATED', admin: creatorId };
    }

    /**
     * 8.1.5 POST /squads/{squadId}/join
     */
    static async joinSquad(squadId: string, userId: string) {
        // Check max members (max 8)
        const membersRes = await pool.query('SELECT COUNT(*) as count FROM squad_members WHERE "squadId" = $1', [squadId]);
        if (parseInt(membersRes.rows[0].count) >= 8) {
            throw new Error('Squad is already full (max 8 members)');
        }

        await pool.query(
            'INSERT INTO squad_members ("squadId", "userId", role, "joinedAt") VALUES ($1, $2, $3, NOW())',
            [squadId, userId, 'MEMBER']
        );
        return { status: 'JOINED', squadId, userId };
    }

    /**
     * 8.1.6 GET /squads/{squadId}
     */
    static async getSquadDetails(squadId: string) {
        const squadRes = await pool.query('SELECT * FROM squads WHERE "squadId" = $1', [squadId]);
        const membersRes = await pool.query('SELECT * FROM squad_members WHERE "squadId" = $1', [squadId]);

        if (squadRes.rows.length === 0) throw new Error('Squad not found');

        const squad = squadRes.rows[0];

        // Simulate real DeFi yield 
        const defiConfig = EscrowService.getDeFiStats();
        const estimatedTotalYield = (squad.currentPoolSize || 0) * (defiConfig.currentAPY / 100) * (squad.seasonDurationDays / 365);

        return {
            ...squad,
            members: membersRes.rows,
            defiYieldStatus: {
                ...defiConfig,
                estimatedTotalYield
            }
        };
    }
}
