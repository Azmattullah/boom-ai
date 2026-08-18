// ── Sidebar Component ─────────────────────────────────────────

import { groupChatsByDate } from '../utils/helpers';

export default function Sidebar({
  chats,
  activeChatId,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  isOpen,
  onClose,
}) {
  const groups = groupChatsByDate(chats);
  const groupLabels = Object.keys(groups);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="sidebar-overlay" onClick={onClose} />
      )}

      <aside className={`sidebar${isOpen ? ' open' : ''}`}>
        <div className="sidebar-header">
          <button className="new-chat-btn" onClick={onNewChat}>
            <span style={{ fontSize: '1rem', lineHeight: 1 }}>+</span>
            New Chat
          </button>
        </div>

        <div className="sidebar-content">
          {chats.length === 0 ? (
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', padding: '12px 8px', textAlign: 'center' }}>
              No conversations yet.
              <br />Start a new chat above!
            </p>
          ) : (
            groupLabels.map((label) => (
              <div key={label}>
                <div className="chat-group-label">{label}</div>
                {groups[label].map((chat) => (
                  <ChatItem
                    key={chat.id}
                    chat={chat}
                    isActive={chat.id === activeChatId}
                    onSelect={() => { onSelectChat(chat.id); onClose?.(); }}
                    onDelete={() => onDeleteChat(chat.id)}
                  />
                ))}
              </div>
            ))
          )}
        </div>
      </aside>
    </>
  );
}

function ChatItem({ chat, isActive, onSelect, onDelete }) {
  return (
    <button
      className={`chat-item${isActive ? ' active' : ''}`}
      onClick={onSelect}
      title={chat.title}
    >
      <span className="chat-item-title">{chat.title}</span>
      <span
        className="chat-item-delete"
        role="button"
        title="Delete chat"
        onClick={(e) => {
          e.stopPropagation();
          if (window.confirm(`Delete "${chat.title}"?`)) onDelete();
        }}
      >
        ✕
      </span>
    </button>
  );
}
