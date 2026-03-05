/**
 * Score Integrity Layer — 6 Silent Corruption Scenarios
 *
 * Even with perfect categories, the VitalScore can be silently corrupted
 * by six well-defined transaction patterns common in India.
 * Each requires explicit detection and handling — deterministic rule-based
 * logic applied BEFORE the scoring formula runs.
 *
 * Per VitalScore v4 Final document.
 */

export interface Transaction {
    txnId: string;
    amount: number;
    type: 'DEBIT' | 'CREDIT';
    merchant: string;
    merchantNormalized: string;
    vpa?: string;
    recipientVpa?: string;
    recipientIfsc?: string;
    senderIfsc?: string;
    category: string;
    date: string;
    timestamp: Date;
    upiNote?: string;
    dayOfMonth?: number;
}

export interface IntegrityResult {
    isExcluded: boolean;
    adjustedCategory?: string;
    reason?: string;
    scenario?: string;
    adjustmentFactor?: number;
}

// ─── Known BNPL Providers (India) ────────────────────────────
const BNPL_PROVIDERS = [
    'ZestMoney', 'LazyPay', 'Simpl', 'Slice', 'Uni',
    'HDFC EasyEMI', 'Bajaj Finance', 'ICICI BNPL',
    'PayLater', 'FlexPay', 'Pay in 3',
];

// ─── Known Investment VPAs and Keywords ──────────────────────
const INVESTMENT_VPAS = [
    'groww@axisbank', 'zerodha@kotak', 'kuvera@yesbank',
    'paytmmoney@paytm', 'motilaloswal@', 'angelone@',
    'upstox@', 'etmoney@', 'coin@',
];

const INVESTMENT_KEYWORDS = [
    'sip', 'mutual fund', 'mf', 'nifty', 'sensex',
    'equity', 'debt fund', 'elss', 'fd', 'ppf', 'nps',
    'fixed deposit', 'recurring deposit',
];

// ─── Round amounts commonly used in transfers ────────────────
const ROUND_AMOUNTS = [500, 1000, 2000, 3000, 5000, 10000, 15000, 20000, 25000, 50000, 100000];

function isRoundAmount(amount: number): boolean {
    return ROUND_AMOUNTS.includes(amount) || amount % 1000 === 0;
}

function fuzzyMatch(a: string, b: string, threshold: number = 0.80): boolean {
    const aLower = a.toLowerCase().replace(/[^a-z0-9]/g, '');
    const bLower = b.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (aLower.includes(bLower) || bLower.includes(aLower)) return true;

    // Simple character overlap ratio
    const longer = aLower.length > bLower.length ? aLower : bLower;
    const shorter = aLower.length > bLower.length ? bLower : aLower;
    let matches = 0;
    for (const char of shorter) {
        if (longer.includes(char)) matches++;
    }
    return (matches / longer.length) >= threshold;
}

/**
 * Scenario 1: Self-Transfer Detector
 * User moves money between their own accounts — NOT spending.
 */
export function detectSelfTransfer(
    txn: Transaction,
    userVpas: string[]
): IntegrityResult {
    // Check if recipient VPA matches any of user's own accounts
    if (txn.recipientVpa && userVpas.includes(txn.recipientVpa.toLowerCase())) {
        return {
            isExcluded: true,
            adjustedCategory: 'Self-Transfer',
            reason: 'Recipient VPA matches user account',
            scenario: 'SELF_TRANSFER'
        };
    }

    // Heuristic: Round amounts sent to same-bank IFSC
    if (txn.recipientIfsc && txn.senderIfsc &&
        isRoundAmount(txn.amount) &&
        txn.recipientIfsc.substring(0, 4) === txn.senderIfsc.substring(0, 4)) {
        return {
            isExcluded: true,
            adjustedCategory: 'Self-Transfer',
            reason: 'Round amount to same bank — likely self-transfer',
            scenario: 'SELF_TRANSFER'
        };
    }

    return { isExcluded: false };
}

/**
 * Scenario 2: Refund Detector
 * Credit that matches a prior debit from the same merchant.
 */
export function detectRefund(
    txn: Transaction,
    recentTransactions: Transaction[]
): IntegrityResult {
    if (txn.type !== 'CREDIT') return { isExcluded: false };

    // Look for a matching debit within last 30 days from same merchant
    const candidates = recentTransactions.filter(t =>
        t.type === 'DEBIT' &&
        fuzzyMatch(t.merchant, txn.merchant) &&
        Math.abs(t.amount - txn.amount) < 50 &&
        (txn.timestamp.getTime() - t.timestamp.getTime()) / (1000 * 60 * 60 * 24) <= 30
    );

    if (candidates.length > 0) {
        return {
            isExcluded: true,
            adjustedCategory: 'Refund',
            reason: `Refund credit cancels original debit from ${txn.merchant}`,
            scenario: 'REFUND'
        };
    }

    return { isExcluded: false };
}

/**
 * Scenario 3: One-Time Exceptional Events
 * Wedding, medical emergency, etc. — should NOT collapse a healthy VitalScore.
 */
export function detectExceptionalEvent(
    txn: Transaction,
    monthlyCategoryAverage: Record<string, number>,
    rollingCategorySpend14d: Record<string, number>
): IntegrityResult {
    const EXCEPTIONAL_THRESHOLD_MULTIPLIER = 4.0;

    const categoryAvg = monthlyCategoryAverage[txn.category] || 0;
    if (categoryAvg === 0) return { isExcluded: false };

    const rollingSpend = rollingCategorySpend14d[txn.category] || 0;

    if (rollingSpend > categoryAvg * EXCEPTIONAL_THRESHOLD_MULTIPLIER) {
        return {
            isExcluded: false,
            adjustmentFactor: 0.40, // Event impacts score by at most 40%
            reason: `Spending in ${txn.category} is ${(rollingSpend / categoryAvg).toFixed(1)}x normal — exceptional event protection applied`,
            scenario: 'EXCEPTIONAL_EVENT'
        };
    }

    return { isExcluded: false };
}

/**
 * Scenario 4: Salary Advance / Mid-Month Income Spike
 * Use 3-month rolling median income when current month > 140% of median.
 */
export function resolveIncome(
    currentMonthCredits: number,
    historicalMonthlyIncomes: number[]
): { adjustedIncome: number; isAnomaly: boolean; reason?: string } {
    if (historicalMonthlyIncomes.length === 0) {
        return { adjustedIncome: currentMonthCredits, isAnomaly: false };
    }

    const sorted = [...historicalMonthlyIncomes].sort((a, b) => a - b);
    const medianIncome = sorted[Math.floor(sorted.length / 2)];

    if (currentMonthCredits > medianIncome * 1.40) {
        return {
            adjustedIncome: medianIncome,
            isAnomaly: true,
            reason: `Current income ₹${currentMonthCredits.toLocaleString()} is ${((currentMonthCredits / medianIncome) * 100).toFixed(0)}% of median. Using median ₹${medianIncome.toLocaleString()} to protect score.`
        };
    }

    return { adjustedIncome: currentMonthCredits, isAnomaly: false };
}

/**
 * Scenario 5: BNPL / Credit Card Repayments Double-Counting
 * EMI repayments should go to Obligation pillar only, not re-score as Shopping.
 */
export function detectBnplRepayment(txn: Transaction): IntegrityResult {
    // Check if merchant matches known BNPL/EMI provider
    const merchantLower = txn.merchant.toLowerCase();
    if (BNPL_PROVIDERS.some(p => merchantLower.includes(p.toLowerCase()))) {
        return {
            isExcluded: false,
            adjustedCategory: 'Obligation.BNPL',
            reason: `BNPL repayment to ${txn.merchant} — routed to Obligation pillar`,
            scenario: 'BNPL_REPAYMENT'
        };
    }

    // Pattern: consistent same amount, monthly interval = EMI
    // This would need historical data in production; simplified here
    if (txn.upiNote && /emi|installment|kist|repayment/i.test(txn.upiNote)) {
        return {
            isExcluded: false,
            adjustedCategory: 'Obligation.BNPL',
            reason: 'UPI note suggests EMI/installment payment',
            scenario: 'BNPL_REPAYMENT'
        };
    }

    return { isExcluded: false };
}

/**
 * Scenario 6: Investment Outflows Misclassified as Spending
 * ₹10,000 to Groww is investing, NOT spending.
 */
export function detectInvestmentOutflow(txn: Transaction): IntegrityResult {
    // Check VPA against known investment platforms
    if (txn.vpa) {
        const vpaLower = txn.vpa.toLowerCase();
        if (INVESTMENT_VPAS.some(v => vpaLower.includes(v))) {
            return {
                isExcluded: false,
                adjustedCategory: 'Savings.Investment',
                reason: `Investment outflow to ${txn.merchant} — counts as savings`,
                scenario: 'INVESTMENT_OUTFLOW'
            };
        }
    }

    // Check merchant/note for investment keywords
    const textToCheck = `${txn.merchant} ${txn.upiNote || ''}`.toLowerCase();
    if (INVESTMENT_KEYWORDS.some(k => textToCheck.includes(k))) {
        return {
            isExcluded: false,
            adjustedCategory: 'Savings.Investment',
            reason: `Investment keywords detected — counts as savings`,
            scenario: 'INVESTMENT_OUTFLOW'
        };
    }

    return { isExcluded: false };
}

/**
 * Run all 6 integrity checks on a transaction.
 * Returns the first match or a clean result.
 */
export function runIntegrityChecks(
    txn: Transaction,
    context: {
        userVpas?: string[];
        recentTransactions?: Transaction[];
        monthlyCategoryAverage?: Record<string, number>;
        rollingCategorySpend14d?: Record<string, number>;
    }
): IntegrityResult {
    // Check in priority order
    const checks = [
        () => detectSelfTransfer(txn, context.userVpas || []),
        () => detectRefund(txn, context.recentTransactions || []),
        () => detectBnplRepayment(txn),
        () => detectInvestmentOutflow(txn),
        () => detectExceptionalEvent(
            txn,
            context.monthlyCategoryAverage || {},
            context.rollingCategorySpend14d || {}
        ),
    ];

    for (const check of checks) {
        const result = check();
        if (result.isExcluded || result.adjustedCategory || result.adjustmentFactor) {
            return result;
        }
    }

    return { isExcluded: false };
}
