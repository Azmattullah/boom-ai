// ── useLocalStorage Hook ─────────────────────────────────────
// Synced useState that automatically persists to localStorage.

import { useState, useEffect } from 'react';

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) return JSON.parse(raw);
    } catch {}
    return typeof initialValue === 'function' ? initialValue() : initialValue;
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('[BoomAI] localStorage write failed:', e);
    }
  }, [key, value]);

  return [value, setValue];
}
