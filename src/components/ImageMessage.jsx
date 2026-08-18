// ── ImageMessage Component ────────────────────────────────────

import { downloadDataUrl } from '../utils/helpers';

export default function ImageMessage({ content, prompt, onRegenerate }) {
  if (!content) return null;

  const handleDownload = () => {
    downloadDataUrl(content, `boom-ai-${Date.now()}.png`);
  };

  return (
    <div className="image-message">
      <img src={content} alt={prompt || 'Generated image'} />
      <div className="image-message-actions">
        <button className="image-action-btn" onClick={handleDownload} title="Download image">
          ⬇ Download
        </button>
        {onRegenerate && (
          <button className="image-action-btn" onClick={onRegenerate} title="Regenerate image">
            ↺ Regenerate
          </button>
        )}
      </div>
    </div>
  );
}
