// ── AI Service Abstraction ───────────────────────────────────
// The UI only interacts with this module — never with gemini.js
// or openrouter.js directly. Normalizes all responses.

import { streamGeminiMessage, generateGeminiImage } from './gemini';
import { streamOpenRouterMessage } from './openrouter';

export const PROVIDERS = {
  GEMINI: 'gemini',
  OPENROUTER: 'openrouter',
};

/**
 * Send a streaming text message.
 *
 * @param {object} config
 * @param {'gemini'|'openrouter'} config.provider
 * @param {string} config.apiKey
 * @param {string} config.model
 * @param {Array}  config.messages  - normalized message array
 * @param {Function} config.onChunk - called with each text delta
 * @param {AbortSignal} [config.signal]
 */
export async function sendMessage({ provider, apiKey, model, messages, onChunk, signal }) {
  if (!apiKey) {
    throw new Error(`No API key configured for ${provider}.`);
  }

  if (provider === PROVIDERS.GEMINI) {
    return streamGeminiMessage({ apiKey, model, messages, onChunk, signal });
  }

  if (provider === PROVIDERS.OPENROUTER) {
    return streamOpenRouterMessage({ apiKey, model, messages, onChunk, signal });
  }

  throw new Error(`Unknown provider: ${provider}`);
}

/**
 * Generate an image.
 *
 * @param {object} config
 * @param {'gemini'} config.provider
 * @param {string} config.apiKey
 * @param {string} config.model
 * @param {string} config.prompt
 * @returns {Promise<string>} data URL
 */
export async function generateImage({ provider, apiKey, model, prompt }) {
  if (!apiKey) {
    throw new Error(`No API key configured for ${provider}.`);
  }

  if (provider === PROVIDERS.GEMINI) {
    return generateGeminiImage({ apiKey, model, prompt });
  }

  throw new Error('Image generation is only supported with Gemini in this version.');
}
