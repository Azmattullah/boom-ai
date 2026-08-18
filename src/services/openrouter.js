// ── OpenRouter Service ───────────────────────────────────────
// Handles all OpenRouter API interactions via fetch + SSE streaming.
// Does NOT contain any UI logic.

const OR_BASE = 'https://openrouter.ai/api/v1';
const APP_NAME = 'Boom AI';
const APP_URL = 'https://github.com/boom-ai';

/** Convert internal message format to OpenAI-compatible format */
function toOpenRouterMessages(messages) {
  return messages
    .filter((m) => m.type === 'text' && m.content)
    .map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    }));
}

/**
 * Stream a text response from OpenRouter via SSE.
 * Calls onChunk(text) for each streamed delta.
 */
export async function streamOpenRouterMessage({ apiKey, model, messages, onChunk, signal }) {
  const response = await fetch(`${OR_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': APP_URL,
      'X-Title': APP_NAME,
    },
    body: JSON.stringify({
      model,
      messages: toOpenRouterMessages(messages),
      stream: true,
    }),
    signal,
  });

  if (!response.ok) {
    let errMsg = `HTTP ${response.status}`;
    try {
      const data = await response.json();
      errMsg = data?.error?.message || errMsg;
    } catch {}
    throw new Error(errMsg);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (signal?.aborted) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop(); // keep incomplete line

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed === 'data: [DONE]') continue;
      if (!trimmed.startsWith('data: ')) continue;

      try {
        const json = JSON.parse(trimmed.slice(6));
        const delta = json?.choices?.[0]?.delta?.content;
        if (delta) onChunk(delta);
      } catch {
        // Ignore malformed SSE lines
      }
    }
  }
}
