// ── localStorage Utilities ───────────────────────────────────

const KEYS = {
  SETTINGS: 'boom_ai_settings',
  CHATS: 'boom_ai_chats',
  PREFERENCES: 'boom_ai_preferences',
};

function safeGet(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('[BoomAI] Failed to write to localStorage:', e);
  }
}

// ── Settings (API keys) ──────────────────────────────────────

const DEFAULT_SETTINGS = {
  geminiApiKey: '',
  openRouterApiKey: '',
};

export function loadSettings() {
  return { ...DEFAULT_SETTINGS, ...safeGet(KEYS.SETTINGS, {}) };
}

export function saveSettings(settings) {
  safeSet(KEYS.SETTINGS, settings);
}

// ── Chat History ─────────────────────────────────────────────

export function loadChats() {
  return safeGet(KEYS.CHATS, []);
}

export function saveChats(chats) {
  // Don't store raw base64 image data permanently — replace with placeholder
  const sanitized = chats.map((chat) => ({
    ...chat,
    messages: chat.messages.map((msg) =>
      msg.type === 'image' && msg.content?.startsWith('data:')
        ? { ...msg, content: null, placeholder: true }
        : msg
    ),
  }));
  safeSet(KEYS.CHATS, sanitized);
}

// ── Preferences ──────────────────────────────────────────────

const DEFAULT_PREFERENCES = {
  theme: 'dark',
  provider: 'gemini',
  model: 'gemini-2.5-flash',
  mode: 'chat',
};

export function loadPreferences() {
  return { ...DEFAULT_PREFERENCES, ...safeGet(KEYS.PREFERENCES, {}) };
}

export function savePreferences(prefs) {
  safeSet(KEYS.PREFERENCES, prefs);
}

// ── Clear All ────────────────────────────────────────────────

export function clearAll() {
  try {
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  } catch (e) {
    console.warn('[BoomAI] Failed to clear localStorage:', e);
  }
}
