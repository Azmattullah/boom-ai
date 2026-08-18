// ── Message Component ─────────────────────────────────────────
// Renders a single message with markdown, code blocks, images, and actions.

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ImageMessage from './ImageMessage';

// ── Code block with copy ──────────────────────────────────────
function CodeBlock({ children, className, theme }) {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const lang = match ? match[1] : '';
  const code = String(children).replace(/\n$/, '');

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!lang) {
    // Inline code - let markdown-content CSS handle it
    return <code className={className}>{children}</code>;
  }

  return (
    <div className="code-block-wrapper">
      <div className="code-block-header">
        <span className="code-block-lang">{lang}</span>
        <button
          className={`code-copy-btn${copied ? ' copied' : ''}`}
          onClick={handleCopy}
        >
          {copied ? '✓ Copied' : '⎘ Copy'}
        </button>
      </div>
      <SyntaxHighlighter
        language={lang}
        style={theme === 'dark' ? oneDark : oneLight}
        customStyle={{ margin: 0, borderRadius: 0 }}
        PreTag="div"
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

// ── Markdown renderer ─────────────────────────────────────────
function MarkdownContent({ content, isStreaming, theme }) {
  return (
    <div className={`markdown-content${isStreaming ? ' streaming-cursor' : ''}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }) {
            return (
              <CodeBlock className={className} theme={theme} {...props}>
                {children}
              </CodeBlock>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

// ── Typing indicator ──────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="typing-indicator">
      <div className="typing-dot" />
      <div className="typing-dot" />
      <div className="typing-dot" />
    </div>
  );
}

// ── Main Message Component ────────────────────────────────────
export default function Message({ message, isStreaming, theme, onCopy, onRegenerate }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';
  const isError = message.type === 'error';
  const isLoading = message.type === 'loading';
  const isImage = message.type === 'image';

  const handleCopy = () => {
    if (message.content) {
      navigator.clipboard.writeText(message.content).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  return (
    <div className={`message ${isUser ? 'user' : isError ? 'error' : 'assistant'}`}>
      {/* Avatar (assistant only) */}
      {!isUser && (
        <div className="message-avatar" aria-hidden="true">✦</div>
      )}

      <div className="message-body">
        <div className="message-label">
          {isUser ? 'You' : 'Boom AI'}
        </div>

        <div className="message-bubble">
          {/* Loading indicator */}
          {isLoading && <TypingIndicator />}

          {/* Image */}
          {isImage && (
            <ImageMessage
              content={message.content}
              prompt={message.prompt}
              onRegenerate={onRegenerate}
            />
          )}

          {/* Text / Markdown */}
          {!isLoading && !isImage && message.content && (
            isUser ? (
              <span style={{ whiteSpace: 'pre-wrap' }}>{message.content}</span>
            ) : (
              <MarkdownContent
                content={message.content}
                isStreaming={isStreaming}
                theme={theme}
              />
            )
          )}

          {/* Empty streaming placeholder */}
          {isStreaming && !message.content && !isLoading && (
            <TypingIndicator />
          )}
        </div>

        {/* Actions (assistant text messages only) */}
        {isAssistant && !isLoading && !isImage && message.content && (
          <div className="message-actions">
            <button
              className={`msg-action-btn${copied ? ' copied' : ''}`}
              onClick={handleCopy}
              title="Copy message"
            >
              {copied ? '✓ Copied' : '⎘ Copy'}
            </button>
            {onRegenerate && (
              <button
                className="msg-action-btn"
                onClick={onRegenerate}
                title="Regenerate response"
              >
                ↺ Regenerate
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
