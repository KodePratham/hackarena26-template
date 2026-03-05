/**
 * Layer 3 — Groq LLM Contextual Classifier
 * Uses llama-3.1-70b-versatile via Groq (free tier: 6,000 RPM)
 * Only invoked for transactions that Layers 1 & 2 cannot resolve.
 * Includes circuit breaker: 500ms timeout, 5 failures → bypass for 60s.
 * Confidence threshold: ≥ 0.88
 */
import axios from 'axios';
import { ClassificationResult } from './layer1_merchant_db';

// ─── Circuit Breaker State ──────────────────────────────────
let failureCount = 0;
let circuitOpenUntil = 0;
const FAILURE_THRESHOLD = 5;
const RECOVERY_TIMEOUT_MS = 60_000;
const REQUEST_TIMEOUT_MS = 500;

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.1-70b-versatile';

const SYSTEM_PROMPT = `You are a financial transaction categoriser for Indian users.
Categories: Housing | Groceries | Food/Dining | Transport | Utilities |
             Healthcare | Education | Shopping | Entertainment |
             Investments | Self-Transfer | Income | Insurance | EMI |
             PersonalCare | Travel | Fitness | Donation | Other

Rules:
- If amount suggests a bill payment (round number, >₹500), weight towards Utilities/Housing
- Morning transactions (6-10am) at food merchants = Groceries, not Dining
- Evening transactions (7-11pm) at food merchants = Dining
- Amounts <₹100 at known food areas = Street food (Groceries)
- Large round amounts (₹1000, ₹5000, ₹10000) = likely bill/transfer
- Weekend large transactions = likely Shopping/Entertainment
- SIP/MF/FD/PPF payments = Investments (NOT spending)

Map your response to one of these exact categories:
Essential.Housing | Essential.Groceries | Essential.Utilities | Essential.Transportation |
Essential.Healthcare | Essential.Education | Essential.Insurance | Essential.EMI |
Discretionary.DiningOut | Discretionary.Shopping | Discretionary.Entertainment |
Discretionary.Travel | Discretionary.PersonalCare | Discretionary.Fitness |
Savings.Investment | Obligation.BNPL | Other.Donation | Other.Transfer | Uncategorized

Output ONLY valid JSON: {"category": "...", "confidence": 0.0-1.0, "reasoning": "..."}`;

interface TransactionContext {
    merchant: string;
    vpa?: string;
    amount: number;
    hour?: number;
    dayOfWeek?: string;
    userCityTier?: string;
    userIncomeBracket?: string;
    upiNote?: string;
}

/**
 * Layer 3: Groq LLM Contextual Classifier with circuit breaker
 */
export async function layer3Classify(
    context: TransactionContext
): Promise<ClassificationResult | null> {
    const groqApiKey = process.env.GROQ_API_KEY;

    // If no API key configured, skip this layer silently
    if (!groqApiKey) {
        return null;
    }

    // Circuit breaker: if open, skip Layer 3
    if (Date.now() < circuitOpenUntil) {
        return null;
    }

    try {
        const response = await axios.post(
            GROQ_API_URL,
            {
                model: GROQ_MODEL,
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user', content: JSON.stringify(context) }
                ],
                max_tokens: 100,
                temperature: 0.1
            },
            {
                headers: {
                    'Authorization': `Bearer ${groqApiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: REQUEST_TIMEOUT_MS
            }
        );

        // Reset failure count on success
        failureCount = 0;

        const content = response.data?.choices?.[0]?.message?.content;
        if (!content) return null;

        // Parse JSON response from LLM
        const parsed = JSON.parse(content.trim());
        if (parsed.confidence >= 0.88) {
            return {
                category: parsed.category,
                confidence: parsed.confidence,
                method: 'groq_llm',
                layer: 3
            };
        }

        // Confidence too low — pass to Layer 4
        return null;

    } catch (error: any) {
        failureCount++;
        if (failureCount >= FAILURE_THRESHOLD) {
            // Open circuit — skip Layer 3 for RECOVERY_TIMEOUT_MS
            circuitOpenUntil = Date.now() + RECOVERY_TIMEOUT_MS;
            failureCount = 0;
            console.warn(`[Layer3] Circuit breaker OPEN — bypassing Groq for ${RECOVERY_TIMEOUT_MS / 1000}s`);
        }
        return null; // Gracefully skip to Layer 4
    }
}

/**
 * Reset circuit breaker (for testing)
 */
export function resetCircuitBreaker(): void {
    failureCount = 0;
    circuitOpenUntil = 0;
}
