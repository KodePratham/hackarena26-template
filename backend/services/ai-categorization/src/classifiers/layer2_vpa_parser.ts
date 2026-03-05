/**
 * Layer 2 — VPA + Note Semantic Parser
 * UPI VPA handles are semantically rich and under-exploited.
 * This layer parses VPA structure and UPI note keywords.
 * Confidence: 0.93–0.95
 */
import { ClassificationResult } from './layer1_merchant_db';

// ─── VPA Regex Patterns ─────────────────────────────────────
const VPA_PATTERNS: Array<{ regex: RegExp; category: string }> = [
    // Healthcare
    { regex: /^(dr|clinic|hospital|health|pharma|med|dental).*@/i, category: 'Essential.Healthcare' },
    { regex: /.*\.(hospital|health|clinic|pharma)@/i, category: 'Essential.Healthcare' },

    // Education
    { regex: /.*(school|college|edu|university|academy|coaching|tuition).*@/i, category: 'Essential.Education' },
    { regex: /@(school|college|university|edu)/i, category: 'Essential.Education' },

    // Transport / Fuel
    { regex: /^(petrol|fuel|hp|bpcl|iocl|indian ?oil|bharat ?petro).*@/i, category: 'Essential.Transportation' },
    { regex: /^(metro|dmrc|bmtc|best|ksrtc|msrtc).*@/i, category: 'Essential.Transportation' },

    // Housing
    { regex: /^(rent|flat|pg|hostel|apartment|society|housing).*@/i, category: 'Essential.Housing' },
    { regex: /.*maintenance.*@/i, category: 'Essential.Housing' },

    // Food / Dining
    { regex: /^(zomato|swiggy|dunzo|foodpanda).*@/i, category: 'Discretionary.DiningOut' },
    { regex: /.*(cafe|coffee|restaurant|biryani|pizza|chai).*@/i, category: 'Discretionary.DiningOut' },

    // Groceries
    { regex: /^(bigbasket|blinkit|zepto|jiomart|dmart|more|grofers|instamart).*@/i, category: 'Essential.Groceries' },
    { regex: /.*(kirana|provision|vegetable|sabzi|fruit).*@/i, category: 'Essential.Groceries' },

    // Utilities
    { regex: /.*electricity.*@|.*power.*@|.*energy.*@/i, category: 'Essential.Utilities' },
    { regex: /.*(gas|water|telecom|broadband).*@/i, category: 'Essential.Utilities' },

    // Insurance
    { regex: /.*(insurance|lic|policy).*@/i, category: 'Essential.Insurance' },

    // Investment
    { regex: /^(zerodha|groww|kuvera|coin|upstox|angelone|paytmmoney|etmoney).*@/i, category: 'Savings.Investment' },

    // Entertainment
    { regex: /^(netflix|spotify|hotstar|amazon ?prime|youtube|google ?play).*@/i, category: 'Discretionary.Entertainment' },

    // Shopping
    { regex: /^(amazon|flipkart|myntra|ajio|nykaa|meesho).*@/i, category: 'Discretionary.Shopping' },
];

// ─── UPI Note Keyword Groups ────────────────────────────────
// Supports Hindi/English mixed keywords common in Indian UPI notes
const NOTE_KEYWORDS: Array<{ keywords: string[]; category: string }> = [
    { keywords: ['rent', 'flat', 'room', 'pg', 'deposit', 'kiraya', 'makaan'], category: 'Essential.Housing' },
    { keywords: ['medicine', 'pharma', 'doctor', 'clinic', 'hospital', 'dawai', 'aushadhi', 'lab test', 'xray'], category: 'Essential.Healthcare' },
    { keywords: ['fee', 'tuition', 'school', 'coaching', 'college', 'exam', 'padhai', 'course'], category: 'Essential.Education' },
    { keywords: ['grocery', 'vegetables', 'sabzi', 'milk', 'doodh', 'ration', 'kirana', 'atta', 'dal', 'chawal', 'fruit'], category: 'Essential.Groceries' },
    { keywords: ['recharge', 'prepaid', 'mobile', 'bill', 'electricity', 'bijli', 'gas', 'water', 'pani', 'wifi'], category: 'Essential.Utilities' },
    { keywords: ['petrol', 'diesel', 'fuel', 'auto', 'cab', 'taxi', 'metro', 'bus', 'train', 'ticket'], category: 'Essential.Transportation' },
    { keywords: ['emi', 'loan', 'installment', 'kist', 'repayment'], category: 'Essential.EMI' },
    { keywords: ['insurance', 'premium', 'lic', 'policy', 'bima'], category: 'Essential.Insurance' },
    { keywords: ['investment', 'sip', 'mutual fund', 'mf', 'fd', 'ppf', 'nps', 'share', 'stock', 'equity'], category: 'Savings.Investment' },
    { keywords: ['food', 'dinner', 'lunch', 'breakfast', 'biryani', 'pizza', 'burger', 'khana', 'chai', 'coffee', 'snack'], category: 'Discretionary.DiningOut' },
    { keywords: ['shopping', 'clothes', 'kapde', 'shoes', 'bag', 'watch', 'jewellery', 'gift', 'tohfa'], category: 'Discretionary.Shopping' },
    { keywords: ['movie', 'cinema', 'netflix', 'subscribe', 'game', 'concert', 'show', 'entertainment'], category: 'Discretionary.Entertainment' },
    { keywords: ['salon', 'haircut', 'spa', 'beauty', 'parlour', 'facial'], category: 'Discretionary.PersonalCare' },
    { keywords: ['travel', 'hotel', 'flight', 'booking', 'trip', 'holiday', 'vacation', 'safar'], category: 'Discretionary.Travel' },
    { keywords: ['charity', 'donation', 'daan', 'temple', 'mandir', 'masjid', 'church', 'gurudwara'], category: 'Other.Donation' },
];

/**
 * Layer 2: VPA + Note Semantic Parser
 * Parses VPA structure and UPI note content for category signals.
 */
export function layer2Parse(
    merchantName: string,
    vpa?: string,
    upiNote?: string
): ClassificationResult | null {
    // Step 1: VPA structural pattern match
    if (vpa) {
        for (const { regex, category } of VPA_PATTERNS) {
            if (regex.test(vpa)) {
                return { category, confidence: 0.95, method: 'vpa_pattern', layer: 2 };
            }
        }
    }

    // Step 2: UPI Note keyword match
    if (upiNote && upiNote.trim().length > 0) {
        const noteLower = upiNote.toLowerCase();
        for (const { keywords, category } of NOTE_KEYWORDS) {
            if (keywords.some(k => noteLower.includes(k))) {
                return { category, confidence: 0.93, method: 'note_keywords', layer: 2 };
            }
        }
    }

    return null; // Pass to Layer 3
}
