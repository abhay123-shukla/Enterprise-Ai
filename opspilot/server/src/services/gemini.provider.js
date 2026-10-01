import { GoogleGenerativeAI } from '@google/generative-ai';
import { ENV } from '../config/env.js';
import { sanitizeInput, withRetryAndTimeout } from '../utils/aiSecurity.js';

class GeminiProvider {
  constructor() {
    this.apiKey = ENV.GEMINI_API_KEY || '';
    this.modelName = ENV.GEMINI_MODEL || 'gemini-1.5-flash';
    this.client = null;

    if (this.isConfigured()) {
      try {
        this.client = new GoogleGenerativeAI(this.apiKey);
      } catch (err) {
        console.warn('⚠️ Gemini Client initialization failed:', err.message);
      }
    }
  }

  isConfigured() {
    return Boolean(
      this.apiKey &&
      this.apiKey.trim().length > 10 &&
      !this.apiKey.includes('your_gemini_api_key')
    );
  }

  /**
   * Generates structured JSON adhering to the provided Zod schema using Gemini JSON Mode.
   * Temperature <= 0.3, Timeout 10s, Retry max 2.
   */
  async generateJson({ systemInstruction = '', userPrompt = '', schema, operationName = 'Gemini JSON' }) {
    if (!this.isConfigured() || !this.client) {
      throw new Error('GEMINI_NOT_CONFIGURED: Gemini API key is missing or invalid in server .env');
    }

    const sanitizedPrompt = sanitizeInput(userPrompt);
    const sanitizedSystem = sanitizeInput(systemInstruction);

    const startTime = Date.now();

    const generateCall = async (signal) => {
      const model = this.client.getGenerativeModel({
        model: this.modelName,
        systemInstruction: sanitizedSystem ? { parts: [{ text: sanitizedSystem }] } : undefined,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2
        }
      });

      // Call Gemini
      const response = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: sanitizedPrompt }] }]
      });

      const responseText = response.response.text();
      return responseText;
    };

    const rawJsonText = await withRetryAndTimeout(generateCall, {
      maxRetries: 2,
      timeoutMs: 10000,
      operationName
    });

    const duration = Date.now() - startTime;

    // Parse JSON
    let parsed;
    try {
      // Clean possible markdown code fences if model returned them
      const cleaned = rawJsonText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      throw new Error(`JSON_PARSE_ERROR: Failed to parse Gemini response: ${parseErr.message}\nRaw: ${rawJsonText.slice(0, 200)}`);
    }

    // Validate with Zod schema if provided
    let validated = parsed;
    if (schema) {
      const validationResult = schema.safeParse(parsed);
      if (!validationResult.success) {
        throw new Error(
          `ZOD_VALIDATION_ERROR: Schema validation failed: ${JSON.stringify(validationResult.error.format())}`
        );
      }
      validated = validationResult.data;
    }

    const estimatedTokens = Math.ceil((sanitizedPrompt.length + rawJsonText.length) / 4);

    return {
      success: true,
      data: validated,
      tokensUsed: estimatedTokens,
      responseTimeMs: duration,
      model: this.modelName
    };
  }
}

export const geminiProvider = new GeminiProvider();
