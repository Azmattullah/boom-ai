import { useCallback, useRef, useState } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { sendMessage as aiSend, generateImage as aiGenerateImage } from '../services/aiService';
import { loadChats, saveChats } from '../utils/storage';
import { generateId, generateChatTitle, friendlyError } from '../utils/helpers';

const INITIAL_CHATS = () => loadChats();

export function useChat({ settings, provider, model }) {
  const [chats, setChats] = useLocalStorage('boom_ai_chats', INITIAL_CHATS);
  const [activeChatId, setActiveChatId] = useLocalStorage('boom_ai_active_chat', null);
  // isGenerating is ephemeral — don't persist to localStorage
  const [isGenerating, setIsGenerating] = useState(false);
  const abortRef = useRef(null);
  // Always-current ref so callbacks read fresh state without stale closures
  const chatsRef = useRef(chats);
  chatsRef.current = chats;


  // ── Computed ──────────────────────────────────────────────
  const activeChat = chats.find((c) => c.id === activeChatId) || null;

  // ── Internal helpers ──────────────────────────────────────

  const persistChats = useCallback((updated) => {
    setChats(updated);
    saveChats(updated);
  }, [setChats]);

  const updateChat = useCallback((chatId, updater) => {
    setChats((prev) => {
      const updated = prev.map((c) => (c.id === chatId ? updater(c) : c));
      saveChats(updated);
      return updated;
    });
  }, [setChats]);

  // ── Actions ───────────────────────────────────────────────

  const newChat = useCallback(() => {
    const chat = {
      id: generateId(),
      title: 'New Chat',
      createdAt: new Date().toISOString(),
      messages: [],
    };
    setChats((prev) => {
      const updated = [chat, ...prev];
      saveChats(updated);
      return updated;
    });
    setActiveChatId(chat.id);
    return chat.id;
  }, [setChats, setActiveChatId]);

  const selectChat = useCallback((chatId) => {
    setActiveChatId(chatId);
  }, [setActiveChatId]);

  const deleteChat = useCallback((chatId) => {
    setChats((prev) => {
      const updated = prev.filter((c) => c.id !== chatId);
      saveChats(updated);
      return updated;
    });
    setActiveChatId((prev) => {
      if (prev === chatId) return null;
      return prev;
    });
  }, [setChats, setActiveChatId]);

  // ── Send Text Message ─────────────────────────────────────

  const sendMessage = useCallback(async (text) => {
    // Resolve or create active chat
    let chatId = activeChatId;
    let isNew = false;

    if (!chatId || !chats.find((c) => c.id === chatId)) {
      chatId = generateId();
      isNew = true;
    }

    const userMessage = {
      id: generateId(),
      role: 'user',
      type: 'text',
      content: text,
      timestamp: new Date().toISOString(),
    };

    const assistantMessage = {
      id: generateId(),
      role: 'assistant',
      type: 'text',
      content: '',
      timestamp: new Date().toISOString(),
    };

    const title = generateChatTitle(text);

    // Add user + empty assistant message
    setChats((prev) => {
      let updated;
      if (isNew) {
        const newChatObj = {
          id: chatId,
          title,
          createdAt: new Date().toISOString(),
          messages: [userMessage, assistantMessage],
        };
        updated = [newChatObj, ...prev];
      } else {
        updated = prev.map((c) => {
          if (c.id !== chatId) return c;
          return {
            ...c,
            title: c.messages.length === 0 ? title : c.title,
            messages: [...c.messages, userMessage, assistantMessage],
          };
        });
      }
      saveChats(updated);
      return updated;
    });

    if (isNew) setActiveChatId(chatId);

    // Get API key for current provider
    const apiKey =
      provider === 'gemini' ? settings.geminiApiKey : settings.openRouterApiKey;

    setIsGenerating(true);
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      // Build message history for the API call using chatsRef (always current).
      // We read the chat AFTER setChats has been called — but since setChats is
      // async, we use chatsRef which is updated synchronously on every render.
      // For a new chat: history = [userMessage] (correct)
      // For existing chat: history = previousMessages + [userMessage] (correct)
      const currentMessages = (() => {
        const fresh = chatsRef.current.find((c) => c.id === chatId);
        if (!fresh) return [userMessage];
        // The chat now includes [userMessage, assistantMessage] at the end.
        // We want everything EXCEPT the empty assistant placeholder.
        return fresh.messages.filter((m) => m.id !== assistantMessage.id);
      })();

      await aiSend({
        provider,
        apiKey,
        model,
        messages: currentMessages,
        signal: controller.signal,
        onChunk: (delta) => {
          setChats((prev) => {
            const updated = prev.map((c) => {
              if (c.id !== chatId) return c;
              return {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === assistantMessage.id
                    ? { ...m, content: m.content + delta }
                    : m
                ),
              };
            });
            // Persist every few chunks (debounce via direct call)
            return updated;
          });
        },
      });
    } catch (err) {
      if (err?.name === 'AbortError') {
        // Stopped by user — leave content as-is
      } else {
        const errText = friendlyError(err);
        setChats((prev) => {
          const updated = prev.map((c) => {
            if (c.id !== chatId) return c;
            return {
              ...c,
              messages: c.messages.map((m) =>
                m.id === assistantMessage.id
                  ? { ...m, type: 'error', content: errText }
                  : m
              ),
            };
          });
          saveChats(updated);
          return updated;
        });
      }
    } finally {
      setIsGenerating(false);
      abortRef.current = null;
      // Final persist
      setChats((prev) => { saveChats(prev); return prev; });
    }
  }, [activeChatId, chats, provider, model, settings, setChats, setActiveChatId, setIsGenerating]);

  // ── Generate Image ────────────────────────────────────────

  const generateImage = useCallback(async (prompt, imageModel) => {
    let chatId = activeChatId;
    let isNew = false;

    if (!chatId || !chats.find((c) => c.id === chatId)) {
      chatId = generateId();
      isNew = true;
    }

    const userMessage = {
      id: generateId(),
      role: 'user',
      type: 'text',
      content: `🖼 ${prompt}`,
      timestamp: new Date().toISOString(),
    };

    const loadingMessage = {
      id: generateId(),
      role: 'assistant',
      type: 'loading',
      content: '',
      timestamp: new Date().toISOString(),
    };

    const title = generateChatTitle(prompt);

    setChats((prev) => {
      let updated;
      if (isNew) {
        const newChatObj = {
          id: chatId,
          title,
          createdAt: new Date().toISOString(),
          messages: [userMessage, loadingMessage],
        };
        updated = [newChatObj, ...prev];
      } else {
        updated = prev.map((c) => {
          if (c.id !== chatId) return c;
          return {
            ...c,
            title: c.messages.length === 0 ? title : c.title,
            messages: [...c.messages, userMessage, loadingMessage],
          };
        });
      }
      saveChats(updated);
      return updated;
    });

    if (isNew) setActiveChatId(chatId);

    const apiKey = settings.geminiApiKey;

    setIsGenerating(true);

    try {
      const dataUrl = await aiGenerateImage({
        provider,
        apiKey,
        model: imageModel,
        prompt,
      });

      setChats((prev) => {
        const updated = prev.map((c) => {
          if (c.id !== chatId) return c;
          return {
            ...c,
            messages: c.messages.map((m) =>
              m.id === loadingMessage.id
                ? { ...m, type: 'image', content: dataUrl }
                : m
            ),
          };
        });
        saveChats(updated);
        return updated;
      });
    } catch (err) {
      const errText = friendlyError(err);
      setChats((prev) => {
        const updated = prev.map((c) => {
          if (c.id !== chatId) return c;
          return {
            ...c,
            messages: c.messages.map((m) =>
              m.id === loadingMessage.id
                ? { ...m, type: 'error', content: errText }
                : m
            ),
          };
        });
        saveChats(updated);
        return updated;
      });
    } finally {
      setIsGenerating(false);
    }
  }, [activeChatId, chats, provider, settings, setChats, setActiveChatId, setIsGenerating]);

  // ── Stop Generation ───────────────────────────────────────

  const stopGeneration = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setIsGenerating(false);
  }, [setIsGenerating]);

  // ── Regenerate last assistant message ─────────────────────

  const regenerate = useCallback(async () => {
    if (!activeChat) return;
    const msgs = activeChat.messages;
    // Remove the last assistant message and resend the last user message
    const lastUserIdx = [...msgs].reverse().findIndex((m) => m.role === 'user');
    if (lastUserIdx === -1) return;
    const lastUser = msgs[msgs.length - 1 - lastUserIdx];

    // Trim messages to just before the last user message
    updateChat(activeChat.id, (c) => ({
      ...c,
      messages: c.messages.slice(0, c.messages.length - 1 - lastUserIdx),
    }));

    // Small delay to let state settle
    await new Promise((r) => setTimeout(r, 50));
    await sendMessage(lastUser.content);
  }, [activeChat, sendMessage, updateChat]);

  return {
    chats,
    activeChat,
    activeChatId,
    isGenerating,
    newChat,
    selectChat,
    deleteChat,
    sendMessage,
    generateImage,
    stopGeneration,
    regenerate,
  };
}
