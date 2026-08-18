// ── Composer Component ────────────────────────────────────────
// The polished text/image input bar at the bottom of the chat.

import { useState, useRef, useEffect, useCallback } from 'react';
import { getImageModels } from '../utils/models';

const ASPECT_RATIOS = ['1:1', '16:9', '9:16', '4:3', '3:4'];

export default function Composer({
  provider,
  isGenerating,
  hasApiKey,
  onSend,
  onGenerateImage,
  onStop,
  onSettingsOpen,
  initialText,
  initialMode,
}) {
  const [text, setText] = useState('');
  const [mode, setMode] = useState('chat'); // 'chat' | 'image'
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [imageModel, setImageModel] = useState('');
  const textareaRef = useRef(null);

  const imageModels = getImageModels('gemini');

  // Set default image model
  useEffect(() => {
    if (imageModels.length > 0 && !imageModel) {
      setImageModel(imageModels[0].id);
    }
  }, [imageModels, imageModel]);

  // Handle initialText from welcome cards
  useEffect(() => {
    if (initialText) {
      setText(initialText);
      textareaRef.current?.focus();
    }
  }, [initialText]);

  // Handle initialMode from welcome cards (image card)
  useEffect(() => {
    if (initialMode) setMode(initialMode);
  }, [initialMode]);

  // Auto-resize textarea
  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 200) + 'px';
  }, []);

  useEffect(() => {
    autoResize();
  }, [text, autoResize]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed || isGenerating) return;

    if (mode === 'image') {
      onGenerateImage?.(trimmed, imageModel, aspectRatio);
    } else {
      onSend?.(trimmed);
    }
    setText('');

    // Reset height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const canSend = text.trim().length > 0 && !isGenerating && hasApiKey;

  const placeholder =
    mode === 'image'
      ? 'Describe the image you want to generate…'
      : 'Ask Boom AI anything…';

  return (
    <div className="composer-wrapper">
      {/* Mode Selector */}
      <div className="mode-selector">
        <button
          className={`mode-btn${mode === 'chat' ? ' active' : ''}`}
          onClick={() => setMode('chat')}
        >
          💬 Chat
        </button>
        <button
          className={`mode-btn${mode === 'image' ? ' active' : ''}`}
          onClick={() => setMode('image')}
        >
          🖼 Image
        </button>
      </div>

      <div className="composer-box">
        <textarea
          ref={textareaRef}
          className="composer-textarea"
          placeholder={placeholder}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isGenerating && mode === 'image'}
          rows={1}
          aria-label="Message input"
        />

        <div className="composer-footer">
          <div className="composer-footer-left">
            {mode === 'image' && imageModels.length > 0 && (
              <div className="image-mode-controls">
                <span className="image-mode-label">Model:</span>
                <select
                  className="aspect-select"
                  value={imageModel}
                  onChange={(e) => setImageModel(e.target.value)}
                >
                  {imageModels.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
                <span className="image-mode-label">Ratio:</span>
                <select
                  className="aspect-select"
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value)}
                >
                  {ASPECT_RATIOS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Send / Stop */}
          {isGenerating ? (
            <button
              className="send-btn stop-btn"
              onClick={onStop}
              title="Stop generation"
            >
              ⬛
            </button>
          ) : (
            <button
              className="send-btn"
              onClick={handleSubmit}
              disabled={!canSend}
              title={mode === 'image' ? 'Generate image' : 'Send message'}
            >
              ➤
            </button>
          )}
        </div>
      </div>

      {/* No API key hint */}
      {!hasApiKey && (
        <p className="no-key-hint">
          No API key configured.{' '}
          <button onClick={onSettingsOpen}>Open Settings</button> to add your key.
        </p>
      )}
    </div>
  );
}
