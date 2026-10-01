/**
 * OpsPilot AI Security & Guardrails
 * Meets Specification 3.8:
 * - Backend .env only
 * - Input sanitization & Prompt Injection Protection
 * - Timeout with Max 2 retries
 */

// Common prompt injection attack signatures
const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+instructions/i,
  /disregard\s+(all\s+)?(previous|prior|above)/i,
  /system\s+prompt\s+override/i,
  /you\s+are\s+now\s+in\s+developer\s+mode/i,
  /jailbreak/i,
  /reveal\s+(your\s+)?(system\s+prompt|instructions|api\s+key)/i,
  /pretend\s+you\s+are\s+(an\s+unfiltered|god\s+mode)/i,
  /---BEGIN\s+SYSTEM/i,
  /<<<SYSTEM/i
];

/**
 * Detect potential prompt injection attempts in user-supplied text
 */
export const detectPromptInjection = (text = '') => {
  if (typeof text !== 'string') return { isSuspicious: false, reason: null };

  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(text)) {
      return {
        isSuspicious: true,
        reason: `Matched prompt injection guardrail signature: ${pattern.toString()}`
      };
    }
  }

  return { isSuspicious: false, reason: null };
};

/**
 * Sanitize and guard user text before incorporating into LLM prompt
 */
export const sanitizeInput = (text = '', maxLength = 2500) => {
  if (typeof text !== 'string') return '';

  let sanitized = text.trim();

  // 1. Enforce length boundary (DoS / token-flooding prevention)
  if (sanitized.length > maxLength) {
    sanitized = sanitized.slice(0, maxLength);
  }

  // 2. Strip control characters (except common whitespace)
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // 3. Neutralize delimiter injection attempts
  sanitized = sanitized.replace(/<{3,}/g, '<<<');
  sanitized = sanitized.replace(/>{3,}/g, '>>>');
  sanitized = sanitized.replace(/`{4,}/g, '```');

  // 4. Defuse active injection phrases by prefixing with safe indicator
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(sanitized)) {
      sanitized = sanitized.replace(pattern, '[FLAGGED_SUSPICIOUS_DIRECTIVE]');
    }
  }

  return sanitized;
};

/**
 * Execute an async operation with specified timeout (default 10s) and max retries (default 2)
 */
export const withRetryAndTimeout = async (
  fn,
  { maxRetries = 2, timeoutMs = 10000, operationName = 'AI Operation' } = {}
) => {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeoutMs);

    try {
      if (attempt > 0) {
        // Exponential backoff with jitter: 500ms, 1200ms
        const delay = Math.min(500 * Math.pow(2, attempt - 1), 2000) + Math.floor(Math.random() * 200);
        await new Promise((res) => setTimeout(res, delay));
      }

      const result = await fn(controller.signal);
      clearTimeout(timeoutId);
      return result;
    } catch (err) {
      clearTimeout(timeoutId);
      lastError = err;
      const isAbort = err.name === 'AbortError' || controller.signal.aborted;
      const isRateLimit = err.status === 429 || (err.message && err.message.includes('429'));

      console.warn(
        `⚠️ [${operationName}] Attempt ${attempt + 1}/${maxRetries + 1} failed: ${
          isAbort ? 'Timeout after ' + timeoutMs + 'ms' : err.message
        }`
      );

      // Do not retry on client authentication error (invalid key)
      if (err.status === 401 || err.status === 403) {
        break;
      }

      // If last attempt, throw
      if (attempt === maxRetries) {
        break;
      }
    }
  }

  throw lastError;
};
