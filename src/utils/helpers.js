// ── General Helper Utilities ─────────────────────────────────

/** Generate a short unique ID */
export function generateId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Auto-title a chat from its first message text */
export function generateChatTitle(text) {
  if (!text) return 'New Chat';
  const cleaned = text.replace(/\s+/g, ' ').trim();
  return cleaned.length > 36 ? cleaned.slice(0, 33) + '…' : cleaned;
}

/** Get a human-readable relative date label */
export function getDateLabel(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now - date) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return `${diff} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** Group an array of chats by date bucket */
export function groupChatsByDate(chats) {
  const groups = {};
  const sorted = [...chats].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  for (const chat of sorted) {
    const label = getDateLabel(chat.createdAt);
    if (!groups[label]) groups[label] = [];
    groups[label].push(chat);
  }
  return groups;
}

/** Map friendly error messages from API errors.
 *  @google/genai v1.x wraps the full HTTP response JSON as e.message,
 *  so we must parse it to extract the actual human-readable message.
 */
export function friendlyError(err) {
  // Log the full error for debugging
  console.error('[BoomAI] API Error:', err);

  const rawMsg = err?.message || String(err);
  const status  = err?.status;  // HTTP status code on ApiError

  // ── Try to extract the real message from the nested JSON ──
  let extracted = rawMsg;
  try {
    // Outer layer: { error: { message: "<inner json string>" } }
    const outer = JSON.parse(rawMsg);
    const innerStr = outer?.error?.message;
    if (innerStr) {
      try {
        // Inner layer: { error: { message: "...", status: "...", ... } }
        const inner = JSON.parse(innerStr);
        extracted = inner?.error?.message || innerStr;
      } catch {
        extracted = innerStr;
      }
    }
  } catch {
    // Not JSON — use raw message
    extracted = rawMsg;
  }

  const msg = extracted || rawMsg;

  // ── Map to friendly messages ──
  if (
    msg.includes('API_KEY_INVALID') ||
    msg.includes('API key not valid') ||
    msg.includes('api key') ||
    status === 400 && msg.toLowerCase().includes('key')
  ) return 'Your API key is invalid. Open Settings to check your key.';

  if (status === 401 || msg.includes('401') || msg.includes('Unauthorized'))
    return 'Unauthorized. Your API key may be incorrect — check Settings.';

  if (status === 403 || msg.includes('PERMISSION_DENIED') || msg.includes('403'))
    return 'Permission denied. Make sure your API key has access to this model.';

  if (status === 429 || msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('rate limit'))
    return 'API rate limit reached. Please wait a moment and try again.';

  if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('network'))
    return 'Unable to connect to the AI provider. Check your internet connection.';

  if (msg.includes('not support') && msg.includes('image'))
    return 'This model does not support image generation.';

  // Return the extracted message (up to 250 chars), never the raw JSON blob
  return msg.length > 250 ? msg.slice(0, 247) + '…' : msg;
}

/** Download a data URL as a file */
export function downloadDataUrl(dataUrl, filename = 'boom-ai-image.png') {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  a.click();
}
