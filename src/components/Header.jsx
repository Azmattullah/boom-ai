// ── Header Component ─────────────────────────────────────────

import { MODELS, getTextModels } from '../utils/models';
import { PROVIDERS } from '../services/aiService';

export default function Header({
  provider,
  onProviderChange,
  model,
  onModelChange,
  theme,
  onThemeToggle,
  onSettingsOpen,
  onMenuToggle,
}) {
  const textModels = getTextModels(provider);

  const handleProviderChange = (e) => {
    const newProvider = e.target.value;
    onProviderChange(newProvider);
    // Reset model to first text model of new provider
    const models = getTextModels(newProvider);
    if (models.length > 0) onModelChange(models[0].id);
  };

  return (
    <header className="header">
      <button className="hamburger-btn icon-btn" onClick={onMenuToggle} title="Toggle sidebar">
        ☰
      </button>

      <a className="header-logo" href="#" onClick={(e) => e.preventDefault()}>
        <span className="header-logo-icon">✦</span>
        <span>Boom AI</span>
      </a>

      <div className="header-controls">
        {/* Provider Selector */}
        <div className="select-wrapper">
          <select
            className="styled-select"
            value={provider}
            onChange={handleProviderChange}
            title="Select AI provider"
          >
            <option value={PROVIDERS.GEMINI}>Gemini</option>
            <option value={PROVIDERS.OPENROUTER}>OpenRouter</option>
          </select>
          <span className="select-arrow">▾</span>
        </div>

        {/* Model Selector */}
        <div className="select-wrapper">
          <select
            className="styled-select"
            value={model}
            onChange={(e) => onModelChange(e.target.value)}
            title="Select model"
          >
            {textModels.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
          <span className="select-arrow">▾</span>
        </div>

        {/* Theme Toggle */}
        <button
          className="icon-btn"
          onClick={onThemeToggle}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? '☀' : '🌙'}
        </button>

        {/* Settings */}
        <button
          className="icon-btn"
          onClick={onSettingsOpen}
          title="Settings"
        >
          ⚙
        </button>
      </div>
    </header>
  );
}
