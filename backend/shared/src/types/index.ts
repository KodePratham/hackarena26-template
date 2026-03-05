// Shared TypeScript types for VitalScore Finance
// Based on design.md data models

// ============================================
// ENUMS
// ============================================

export enum IncomeBracket {
  TIER_1 = 'TIER_1', // <₹25K/month
  TIER_2 = 'TIER_2', // ₹25K–75K
  TIER_3 = 'TIER_3', // ₹75K–2L
  TIER_4 = 'TIER_4', // >₹2L
}

export enum IncomeType {
  SALARIED = 'SALARIED',
  FREELANCE = 'FREELANCE',
  BUSINESS = 'BUSINESS',
  STUDENT = 'STUDENT',
}

export enum LocationType {
  URBAN = 'URBAN',
  RURAL = 'RURAL',
}

export enum KYCStatus {
  VERIFIED = 'VERIFIED',
  PENDING = 'PENDING',
  FAILED = 'FAILED',
}

export enum CategoryPrimary {
  ESSENTIAL = 'Essential',
  DISCRETIONARY = 'Discretionary',
}

export enum CategorySource {
  ML_MODEL = 'ML_MODEL',
  RULE_BASED = 'RULE_BASED',
  USER_OVERRIDE = 'USER_OVERRIDE',
}

export enum PeriodType {
  REALTIME = 'REALTIME',
  NIGHTLY = 'NIGHTLY',
  MONTHLY = 'MONTHLY',
}

export enum ScoreBand {
  VITAL_ELITE = 'VITAL_ELITE', // 800-1000
  VITAL_STRONG = 'VITAL_STRONG', // 600-799
  VITAL_WARNING = 'VITAL_WARNING', // 400-599
  VITAL_CRITICAL = 'VITAL_CRITICAL', // 200-399
  VITAL_EMERGENCY = 'VITAL_EMERGENCY', // 0-199
}

export enum Trajectory {
  IMPROVING = 'IMPROVING',
  STABLE = 'STABLE',
  DECLINING = 'DECLINING',
}

export enum ChallengeType {
  REDUCE_CATEGORY = 'REDUCE_CATEGORY',
  SAVINGS_VELOCITY = 'SAVINGS_VELOCITY',
  CANCEL_SUBSCRIPTION = 'CANCEL_SUBSCRIPTION',
  BUILD_EMERGENCY_FUND = 'BUILD_EMERGENCY_FUND',
  INVESTMENT_ACTION = 'INVESTMENT_ACTION',
}

export enum ChallengeDifficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
}

export enum ChallengeStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  STAKED = 'STAKED',
}

export enum SquadStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  DISBANDED = 'DISBANDED',
}

export enum NotificationFrequency {
  ESSENTIAL = 'ESSENTIAL',
  STANDARD = 'STANDARD',
  FULL = 'FULL',
}

// ============================================
// USER PROFILE TYPES
// ============================================

export interface IncomeProfile {
  bracket: IncomeBracket;
  declaredMonthlyIncome: number;
  incomeType: IncomeType;
}

export interface LocationProfile {
  type: LocationType;
  state: string;
  city: string;
}

export interface SharedExpense {
  merchantPattern: string;
  userShare: number; // 0.0 to 1.0
}

export interface HouseholdConfig {
  sharedExpenses: SharedExpense[];
}

export interface ConsentFlags {
  escrowEnabled: boolean;
  squadEnabled: boolean;
  anonymizedDataSharing: boolean;
  b2bParticipant: boolean;
}

export interface NotificationPreferences {
  frequency: NotificationFrequency;
  streakAlerts: boolean;
  challengeAlerts: boolean;
  forecastAlerts: boolean;
}

export interface UserProfile {
  userId: string;
  createdAt: string;
  kycStatus: KYCStatus;
  incomeProfile: IncomeProfile;
  locationProfile: LocationProfile;
  leagueId: string;
  algorandAddress: string;
  sbtAssetId?: number;
  householdConfig: HouseholdConfig;
  consentFlags: ConsentFlags;
  notificationPreferences: NotificationPreferences;
}

// ============================================
// TRANSACTION TYPES
// ============================================

export interface TransactionCategory {
  primary: CategoryPrimary;
  secondary: string;
  confidence: number; // 0.0 to 1.0
  source: CategorySource;
}

export interface TransactionRecord {
  txnId: string;
  userToken: string;
  externalRef?: string;
  amount: number;
  currency: string;
  date: string;
  merchantNormalized: string;
  merchantRaw: string;
  category: TransactionCategory;
  isRecurring: boolean;
  isShared: boolean;
  sharedUserShare: number;
  isManualEntry: boolean;
  userOverride?: TransactionCategory;
  flaggedForReview: boolean;
}

// ============================================
// SCORE TYPES
// ============================================

export interface ScoreComponents {
  necessityRatio: number;
  savingsRatio: number;
  debtPenalty: number;
  streakBonus: number;
  challengeBonus: number;
  inflationAdjustment: number;
}

export interface ScoreInputSummary {
  essentialSpendAvg3M: number;
  discretionarySpendAvg3M: number;
  incomeAvg3M: number;
  activeChallenges: number;
  streakDays: number;
}

export interface VitalScoreSnapshot {
  snapshotId: string;
  userId: string;
  timestamp: string;
  periodType: PeriodType;
  score: number;
  band: ScoreBand;
  trajectory?: Trajectory;
  components: ScoreComponents;
  inputSummary: ScoreInputSummary;
}

// ============================================
// CHALLENGE TYPES
// ============================================

export interface ChallengeTarget {
  category?: string;
  currentBaseline: number;
  targetValue: number;
  unit: string;
}

export interface ChallengeStake {
  enabled: boolean;
  amount: number;
  currency: string;
  escrowContractId?: string;
  escrowTxnId?: string;
  lockedAt?: string;
}

export interface ChallengeVerificationData {
  method?: 'BANK_DATA' | 'MANUAL';
  verifiedAt?: string;
  actualValue?: number;
}

export interface ChallengeRewards {
  vitalPoints: number;
  scoreBonusApplied: number;
  yieldShareEarned: number;
}

export interface Challenge {
  challengeId: string;
  userId: string;
  weekStartDate: string;
  type: ChallengeType;
  description: string;
  target: ChallengeTarget;
  difficulty: ChallengeDifficulty;
  status: ChallengeStatus;
  stake: ChallengeStake;
  completedAt?: string;
  verificationData: ChallengeVerificationData;
  rewards: ChallengeRewards;
}

// ============================================
// SQUAD TYPES
// ============================================

export interface SquadConfiguration {
  contributionAmount: number;
  contributionFrequency: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
  seasonDuration: number;
  seasonStartDate: string;
  seasonEndDate: string;
}

export interface SquadTreasury {
  algorandContractId?: string;
  currentBalance: number;
  totalContributed: number;
  currentDefiProtocol?: string;
  currentAPY: number;
  totalYieldAccumulated: number;
}

export interface SquadMemberContribution {
  userId: string;
  contributionStreak: number;
  missedContributions: number;
  vitalScoreImprovement: number;
}

export interface Squad {
  squadId: string;
  name: string;
  creatorUserId: string;
  memberUserIds: string[];
  configuration: SquadConfiguration;
  treasury: SquadTreasury;
  status: SquadStatus;
  leaderboardRank?: number;
  memberContributions: SquadMemberContribution[];
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface APIResponse<T> {
  success: boolean;
  data: T | null;
  meta: {
    requestId: string;
    timestamp: string;
    version: string;
  };
  error: APIError | null;
}

export interface APIError {
  code: string;
  message: string;
  details?: Record<string, any>;
}
