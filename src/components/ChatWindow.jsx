// ── ChatWindow Component ──────────────────────────────────────
// Scrollable message list with auto-scroll to bottom.

import { useEffect, useRef } from 'react';
import Message from './Message';

export default function ChatWindow({ messages, isGenerating, theme, onRegenerate }) {
  const bottomRef = useRef(null);
  const containerRef = useRef(null);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  const lastAssistantIdx = (() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'assistant') return i;
    }
    return -1;
  })();

  return (
    <div className="chat-window" ref={containerRef}>
      {messages.map((msg, idx) => (
        <Message
          key={msg.id}
          message={msg}
          theme={theme}
          isStreaming={
            isGenerating && idx === lastAssistantIdx && msg.type === 'text'
          }
          onRegenerate={
            idx === lastAssistantIdx && msg.role === 'assistant' && !isGenerating
              ? onRegenerate
              : undefined
          }
        />
      ))}
      <div ref={bottomRef} style={{ height: 1 }} />
    </div>
  );
}
