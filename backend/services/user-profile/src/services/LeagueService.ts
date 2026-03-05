// League Assignment Service
// Task 3.2: Implement league assignment logic

import { IncomeBracket } from '../models/UserProfile';

export class LeagueService {
  /**
   * Task 3.2.1-3.2.4: Assign user to league based on income bracket
   * Tier 1: <₹25K/month
   * Tier 2: ₹25K–75K
   * Tier 3: ₹75K–2L
   * Tier 4: >₹2L
   */
  static determineIncomeBracket(monthlyIncome: number): IncomeBracket {
    if (monthlyIncome < 25000) {
      return IncomeBracket.TIER_1;
    } else if (monthlyIncome >= 25000 && monthlyIncome < 75000) {
      return IncomeBracket.TIER_2;
    } else if (monthlyIncome >= 75000 && monthlyIncome < 200000) {
      return IncomeBracket.TIER_3;
    } else {
      return IncomeBracket.TIER_4;
    }
  }

  /**
   * Generate league ID based on income bracket and time period
   * Format: TIER_X_QY_YYYY (e.g., TIER_2_Q1_2026)
   */
  static generateLeagueId(incomeBracket: IncomeBracket): string {
    const now = new Date();
    const year = now.getFullYear();
    const quarter = Math.floor(now.getMonth() / 3) + 1;
    
    return `${incomeBracket}_Q${quarter}_${year}`;
  }

  /**
   * Get league assignment for a user based on their income
   */
  static assignLeague(monthlyIncome: number): {
    bracket: IncomeBracket;
    leagueId: string;
  } {
    const bracket = this.determineIncomeBracket(monthlyIncome);
    const leagueId = this.generateLeagueId(bracket);
    
    return { bracket, leagueId };
  }

  /**
   * Check if user needs league reassignment (e.g., income changed significantly)
   */
  static needsReassignment(
    currentBracket: IncomeBracket,
    newMonthlyIncome: number
  ): boolean {
    const newBracket = this.determineIncomeBracket(newMonthlyIncome);
    return currentBracket !== newBracket;
  }
}

export default LeagueService;
