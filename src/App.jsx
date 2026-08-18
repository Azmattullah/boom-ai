// ── App.jsx — Root Composition ────────────────────────────────

import { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import WelcomeScreen from './components/WelcomeScreen';
import Composer from './components/Composer';
import SettingsModal from './components/SettingsModal';
import { useChat } from './hooks/useChat';
import { useLocalStorage } from './hooks/useLocalStorage';
import { loadSettings, saveSettings } from './utils/storage';
import { getDefaultModel } from './utils/models';

export default function App() {
  // ── Persistent preferences ────────────────────────────────
  const [theme, setTheme] = useLocalStorage('boom_ai_theme', 'dark');
  const [provider, setProvider] = useLocalStorage('boom_ai_provider', 'gemini');
  const [model, setModel] = useLocalStorage('boom_ai_model', 'gemini-2.5-flash');

  // ── Settings (API keys) ───────────────────────────────────
  const [settings, setSettings] = useState(() => loadSettings());

  // ── UI State ──────────────────────────────────────────────
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ── Composer state (lifted for welcome card pre-fill) ─────
  const [composerText, setComposerText] = useState('');
  const [composerMode, setComposerMode] = useState(undefined);

  // ── Chat state ────────────────────────────────────────────
  const {
    chats,
    activeChat,
    isGenerating,
    newChat,
    selectChat,
    deleteChat,
    sendMessage,
    generateImage,
    stopGeneration,
    regenerate,
  } = useChat({ settings, provider, model });

  // ── Apply theme to DOM ────────────────────────────────────
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // ── Open settings if no API key on startup ────────────────
  useEffect(() => {
    if (!settings.geminiApiKey && !settings.openRouterApiKey) {
      setSettingsOpen(true);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Computed ──────────────────────────────────────────────
  const hasApiKey =
    (provider === 'gemini' && Boolean(settings.geminiApiKey)) ||
    (provider === 'openrouter' && Boolean(settings.openRouterApiKey));

  // ── Handlers ──────────────────────────────────────────────

  const handleSettingsSave = useCallback((newSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  }, []);

  const handleThemeToggle = useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }, [setTheme]);

  const handleWelcomePrompt = useCallback((text) => {
    setComposerText(text);
    setComposerMode('chat');
    // Reset after handing off to composer
    setTimeout(() => { setComposerText(''); setComposerMode(undefined); }, 100);
  }, []);

  const handleWelcomeImageMode = useCallback(() => {
    setComposerMode('image');
    setTimeout(() => setComposerMode(undefined), 100);
  }, []);

  const handleNewChat = useCallback(() => {
    newChat();
    setSidebarOpen(false);
  }, [newChat]);

  const handleSendMessage = useCallback(async (text) => {
    await sendMessage(text);
  }, [sendMessage]);

  const handleGenerateImage = useCallback(async (prompt, imageModel) => {
    await generateImage(prompt, imageModel);
  }, [generateImage]);

  // ── Render ────────────────────────────────────────────────

  const messages = activeChat?.messages || [];
  const hasMessages = messages.length > 0;

  return (
    <div className="app" data-theme={theme}>
      {/* Header */}
      <Header
        provider={provider}
        onProviderChange={setProvider}
        model={model}
        onModelChange={setModel}
        theme={theme}
        onThemeToggle={handleThemeToggle}
        onSettingsOpen={() => setSettingsOpen(true)}
        onMenuToggle={() => setSidebarOpen((v) => !v)}
      />

      <div className="app-body">
        {/* Sidebar */}
        <Sidebar
          chats={chats}
          activeChatId={activeChat?.id || null}
          onNewChat={handleNewChat}
          onSelectChat={selectChat}
          onDeleteChat={deleteChat}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main chat area */}
        <main className="main-chat">
          {hasMessages ? (
            <ChatWindow
              messages={messages}
              isGenerating={isGenerating}
              theme={theme}
              onRegenerate={regenerate}
            />
          ) : (
            <WelcomeScreen
              onPromptSelect={handleWelcomePrompt}
              onImageMode={handleWelcomeImageMode}
            />
          )}

          <Composer
            provider={provider}
            isGenerating={isGenerating}
            hasApiKey={hasApiKey}
            onSend={handleSendMessage}
            onGenerateImage={handleGenerateImage}
            onStop={stopGeneration}
            onSettingsOpen={() => setSettingsOpen(true)}
            initialText={composerText}
            initialMode={composerMode}
          />
        </main>
      </div>

      {/* Settings Modal */}
      {settingsOpen && (
        <SettingsModal
          settings={settings}
          onSave={handleSettingsSave}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </div>
  );
}
