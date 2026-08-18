// ── Gemini Service ───────────────────────────────────────────
// Handles all Gemini API interactions via @google/genai SDK v1.52+
// Does NOT contain any UI logic.

import { GoogleGenAI } from '@google/genai';

/** Convert internal message format to Gemini SDK contents array */
function toGeminiContents(messages) {
  const contents = [];
  for (const m of messages) {
    // Only include non-empty text messages
    if (m.type !== 'text' || !m.content?.trim()) continue;
    const role = m.role === 'user' ? 'user' : 'model';
    // Avoid consecutive same-role messages (Gemini API requirement)
    if (contents.length > 0 && contents[contents.length - 1].role === role) {
      // Merge into the last entry
      contents[contents.length - 1].parts[0].text += '\n' + m.content;
    } else {
      contents.push({ role, parts: [{ text: m.content }] });
    }
  }
  return contents;
}

/**
 * Stream a text response from Gemini.
 * Calls onChunk(text) for each streamed token.
 * @google/genai v1.52: generateContentStream returns an AsyncGenerator.
 */
export async function streamGeminiMessage({ apiKey, model, messages, onChunk, signal }) {
  const ai = new GoogleGenAI({ apiKey });

  const contents = toGeminiContents(messages);
  if (contents.length === 0) throw new Error('No valid messages to send.');

  // generateContentStream returns an async iterable of GenerateContentResponse
  const stream = await ai.models.generateContentStream({ model, contents });

  for await (const chunk of stream) {
    if (signal?.aborted) break;
    // chunk.text is a convenience getter that joins all text parts
    const text = chunk.text;
    if (text) onChunk(text);
  }
}

/**
 * Generate an image using Gemini image-generation models.
 * Returns a data URL string (base64 PNG/JPEG).
 */
export async function generateGeminiImage({ apiKey, model, prompt }) {
  const ai = new GoogleGenAI({ apiKey });

  // Imagen 3.0 uses generateImages
  if (model.startsWith('imagen')) {
    const response = await ai.models.generateImages({
      model,
      prompt,
      config: { numberOfImages: 1 },
    });
    const img = response.generatedImages?.[0]?.image;
    if (!img?.imageBytes) throw new Error('No image data returned from Imagen.');
    return `data:image/png;base64,${img.imageBytes}`;
  }

  // Gemini flash multimodal image generation
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseModalities: ['image', 'text'],
    },
  });

  const parts = response.candidates?.[0]?.content?.parts || [];
  for (const part of parts) {
    if (part.inlineData?.data) {
      const { mimeType, data } = part.inlineData;
      return `data:${mimeType || 'image/png'};base64,${data}`;
    }
  }

  throw new Error('No image data was returned. Try a different model or prompt.');
}
