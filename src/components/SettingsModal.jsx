// ── Settings Modal Component ──────────────────────────────────

import { useState } from 'react';
import { PROVIDERS } from '../services/aiService';
import { getTextModels } from '../utils/models';
import { clearAll } from '../utils/storage';

export default function SettingsModal({ settings, onSave, onClose }) {
  const [form, setForm] = useState({
    geminiApiKey: settings.geminiApiKey || '',
    openRouterApiKey: settings.openRouterApiKey || '',
  });
  const [showGemini, setShowGemini] = useState(false);
  const [showOpenRouter, setShowOpenRouter] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave(form);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  const handleClearAll = () => {
    if (window.confirm('This will delete all chats and settings. Are you sure?')) {
      clearAll();
      window.location.reload();
    }
  };

  const handleChange = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="Settings">
        <div className="modal-header">
          <h2 className="modal-title">⚙ Settings</h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close settings">
            ✕
          </button>
        </div>

        <div className="modal-body">
          {/* Security Notice */}
          <div className="security-notice">
            <span>⚠</span>
            <span>
              API keys are stored in your browser's localStorage. They are never
              sent to any server other than Gemini / OpenRouter directly from your browser.
            </span>
          </div>

          {/* Gemini API Key */}
          <div className="form-group">
            <label className="form-label" htmlFor="gemini-key">Gemini API Key</label>
            <div className="input-wrapper">
              <input
                id="gemini-key"
                className="form-input"
                type={showGemini ? 'text' : 'password'}
                placeholder="AIza..."
                value={form.geminiApiKey}
                onChange={handleChange('geminiApiKey')}
                autoComplete="off"
                spellCheck={false}
              />
              <button
                className="input-eye-btn"
                onClick={() => setShowGemini((v) => !v)}
                type="button"
                tabIndex={-1}
                aria-label={showGemini ? 'Hide Gemini key' : 'Show Gemini key'}
              >
                {showGemini ? '🙈' : '👁'}
              </button>
            </div>
            <p className="form-hint">
              Get your key at{' '}
              <a href="https://aistudio.google.com" target="_blank" rel="noopener noreferrer">
                aistudio.google.com
              </a>
            </p>
          </div>

          {/* OpenRouter API Key */}
          <div className="form-group">
            <label className="form-label" htmlFor="openrouter-key">OpenRouter API Key</label>
            <div className="input-wrapper">
              <input
                id="openrouter-key"
                className="form-input"
                type={showOpenRouter ? 'text' : 'password'}
                placeholder="sk-or-..."
                value={form.openRouterApiKey}
                onChange={handleChange('openRouterApiKey')}
                autoComplete="off"
                spellCheck={false}
              />
              <button
                className="input-eye-btn"
                onClick={() => setShowOpenRouter((v) => !v)}
                type="button"
                tabIndex={-1}
                aria-label={showOpenRouter ? 'Hide OpenRouter key' : 'Show OpenRouter key'}
              >
                {showOpenRouter ? '🙈' : '👁'}
              </button>
            </div>
            <p className="form-hint">
              Get your key at{' '}
              <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer">
                openrouter.ai/keys
              </a>
            </p>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-primary" onClick={handleSave} id="save-settings-btn">
            {saved ? '✓ Saved!' : '💾 Save Settings'}
          </button>
          <div className="modal-divider" />
          <button className="btn btn-ghost" onClick={handleClearAll} id="clear-all-btn">
            🗑 Clear All Data
          </button>
        </div>
      </div>
    </div>
  );
}
