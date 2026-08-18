// ── Model Registry ──────────────────────────────────────────
// Single source of truth for all provider/model configuration.
// Update model IDs here as providers release new models.

export const PROVIDERS = {
  GEMINI: 'gemini',
  OPENROUTER: 'openrouter',
};

export const MODELS = {
  gemini: [
    {
      id: 'gemini-2.5-flash',
      name: 'Gemini 2.5 Flash',
      type: 'text',
      description: 'Fast, versatile — great for most tasks',
    },
    {
      id: 'gemini-2.5-pro',
      name: 'Gemini 2.5 Pro',
      type: 'text',
      description: 'Powerful reasoning and long context',
    },
    {
      id: 'gemini-3.6-flash',
      name: 'Gemini 3.6 Flash',
      type: 'text',
      description: 'Latest and fastest Gemini model',
    },
    {
      id: 'gemini-2.0-flash-preview-image-generation',
      name: 'Gemini Image Gen',
      type: 'image',
      description: 'Generate images with Gemini (preview)',
    },
    {
      id: 'imagen-3.0-generate-002',
      name: 'Imagen 3.0',
      type: 'image',
      description: 'High-quality image generation with Imagen',
    },
  ],
  openrouter: [
    {
      id: 'openai/gpt-4o',
      name: 'GPT-4o',
      type: 'text',
      description: "OpenAI's most capable multimodal model",
    },
    {
      id: 'anthropic/claude-sonnet-4-5',
      name: 'Claude Sonnet 3.5',
      type: 'text',
      description: "Anthropic's balanced intelligence model",
    },
    {
      id: 'meta-llama/llama-3.3-70b-instruct',
      name: 'Llama 3.3 70B',
      type: 'text',
      description: "Meta's powerful open-source model",
    },
    {
      id: 'mistralai/mistral-large',
      name: 'Mistral Large',
      type: 'text',
      description: "Mistral's frontier reasoning model",
    },
  ],
};

/** Get all models for a provider */
export function getModels(provider) {
  return MODELS[provider] || [];
}

/** Get text-only models for a provider */
export function getTextModels(provider) {
  return getModels(provider).filter((m) => m.type === 'text');
}

/** Get image-capable models for a provider */
export function getImageModels(provider) {
  return getModels(provider).filter((m) => m.type === 'image');
}

/** Find a specific model by provider + id */
export function getModel(provider, modelId) {
  return getModels(provider).find((m) => m.id === modelId) || null;
}

/** Get the default text model for a provider */
export function getDefaultModel(provider) {
  return getTextModels(provider)[0] || null;
}
