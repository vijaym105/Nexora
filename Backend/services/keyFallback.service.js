// Runs an AI call against a list of API-key "slots" and moves on to the next
// slot when one is out of quota, rejected, or temporarily unavailable.

export class AllKeysBusyError extends Error {
    constructor(message = "All AI keys are busy or out of quota") {
        super(message);
        this.name = "AllKeysBusyError";
        this.retryAfterMs = 60_000;
    }
}

const statusOf = (err) => err?.status ?? err?.statusCode ?? err?.response?.status ?? err?.cause?.status;

/**
 * Decides what a failed call means:
 *  - "quota"     rate limit / quota used up      -> try the next key, rest this one
 *  - "auth"      key invalid / not allowed       -> try the next key, rest this one longer
 *  - "transient" Google overloaded / network     -> try the next key, rest briefly
 *  - "other"     anything else (bad request...)  -> a different key would not help, rethrow
 */
export function classifyError(err) {
    const status = statusOf(err);
    const text = `${err?.name ?? ""} ${err?.message ?? ""} ${err?.code ?? ""}`.toLowerCase();

    if (status === 429 || /resource_exhausted|quota|rate.?limit|too many requests|\[429/.test(text)) return "quota";
    if (status === 401 || status === 403 || /api key not valid|api_key_invalid|permission_denied|\[40[13]/.test(text)) return "auth";
    if (
        status === 500 || status === 502 || status === 503 || status === 504 ||
        /unavailable|overloaded|deadline|econnreset|etimedout|enotfound|fetch failed|\[50[0234]/.test(text)
    ) return "transient";
    return "other";
}

const DEFAULT_COOLDOWNS = { quota: 60_000, auth: 10 * 60_000, transient: 10_000 };

/**
 * @param {Array<{name: string, [key: string]: any}>} slots  in priority order (first = primary)
 * @param {{now?: () => number, log?: (msg: string) => void, cooldowns?: object}} [options]
 * @returns {{ run: (fn: (slot) => Promise<any>) => Promise<any>, status: () => object[] }}
 */
export function createFallbackRunner(slots, { now = () => Date.now(), log = console.warn, cooldowns = {} } = {}) {
    if (!slots?.length) throw new Error("createFallbackRunner needs at least one slot");

    const rest = { ...DEFAULT_COOLDOWNS, ...cooldowns };
    const restingUntil = new Map(); // slot -> timestamp

    async function run(fn) {
        let tried = 0;

        for (const slot of slots) {
            if ((restingUntil.get(slot) ?? 0) > now()) continue;

            tried++;
            try {
                return await fn(slot);
            } catch (err) {
                const kind = classifyError(err);
                if (kind === "other") throw err;

                restingUntil.set(slot, now() + rest[kind]);
                log(`[ai] key "${slot.name}" failed (${kind}); trying the next key if there is one`);
            }
        }

        // every key was either resting already or just failed
        throw new AllKeysBusyError(tried ? undefined : "All AI keys are resting after errors");
    }

    const status = () =>
        slots.map((slot) => ({
            name: slot.name,
            resting: (restingUntil.get(slot) ?? 0) > now(),
            restingMs: Math.max(0, (restingUntil.get(slot) ?? 0) - now()),
        }));

    return { run, status };
}
