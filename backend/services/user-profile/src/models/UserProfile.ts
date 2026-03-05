// User Profile Model
// Based on design.md User Profile data model

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

export enum NotificationFrequency {
  ESSENTIAL = 'ESSENTIAL',
  STANDARD = 'STANDARD',
  FULL = 'FULL',
}

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
  updatedAt: string;
  kycStatus: KYCStatus;
  kycVerifiedAt?: string;
  incomeProfile: IncomeProfile;
  locationProfile: LocationProfile;
  leagueId: string;
  algorandAddress: string;
  sbtAssetId?: number;
  householdConfig: HouseholdConfig;
  consentFlags: ConsentFlags;
  notificationPreferences: NotificationPreferences;
}

export interface CreateUserProfileDTO {
  declaredMonthlyIncome: number;
  incomeType: IncomeType;
  locationType: LocationType;
  locationState: string;
  locationCity: string;
  algorandAddress: string;
}

export interface UpdateUserProfileDTO {
  declaredMonthlyIncome?: number;
  incomeType?: IncomeType;
  locationType?: LocationType;
  locationState?: string;
  locationCity?: string;
  householdConfig?: HouseholdConfig;
  consentFlags?: Partial<ConsentFlags>;
  notificationPreferences?: Partial<NotificationPreferences>;
}
