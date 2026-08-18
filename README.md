# ✦ Boom AI — Personal AI Assistant

A lightweight, privacy-first AI chat application built with React. Supports text conversations and image generation powered by **Google Gemini** and **OpenRouter** — no backend, no login, no account required.

---

## ✨ Features

- 💬 **Text Chat** — Conversational AI with streaming responses
- 🖼️ **Image Generation** — Generate images from natural language prompts
- ⚡ **Streaming Responses** — Real-time token-by-token output for a fast feel
- 📝 **Markdown Rendering** — Full markdown support including tables, code blocks, and lists
- 🗂️ **Chat History** — Multiple conversations stored locally in the browser
- 🔑 **No Backend Required** — API keys are stored securely in `localStorage`
- 🚫 **No Registration / No Login** — Start chatting immediately after adding your API key
- 🌐 **Dual Provider Support** — Switch between Gemini and OpenRouter models on the fly
- 📋 **Copy Code Blocks** — One-click copy button on all code snippets
- 📱 **Fully Responsive** — Works on desktop, tablet, and mobile

---

## 🛠️ Tools & Technologies

### Core Framework

| Tool | Version | Purpose |
|------|---------|---------|
| [React](https://react.dev/) | ^18.3.1 | UI framework (SPA) |
| [Vite](https://vitejs.dev/) | ^5.4.2 | Build tool & dev server |
| JavaScript (ESModules) | — | Primary language |
| Vanilla CSS | — | Styling & responsive layout |

### AI Providers

| Tool | Purpose |
|------|---------|
| [Google Gemini API](https://ai.google.dev/) via `@google/genai` ^1.10.0 | Text chat & image generation |
| [OpenRouter API](https://openrouter.ai/) via `fetch()` | Access to 100+ open-source & proprietary models |

### Markdown & Rendering

| Package | Version | Purpose |
|---------|---------|---------|
| [react-markdown](https://github.com/remarkjs/react-markdown) | ^9.0.1 | Render AI markdown responses |
| [react-syntax-highlighter](https://github.com/react-syntax-highlighter/react-syntax-highlighter) | ^15.6.1 | Syntax-highlighted code blocks |
| [remark-gfm](https://github.com/remarkjs/react-gfm) | ^4.0.0 | GitHub Flavored Markdown (tables, strikethrough, etc.) |

### Dev Dependencies

| Tool | Purpose |
|---------|---------|
| `@vitejs/plugin-react` | Vite + React fast refresh |
| `@types/react`, `@types/react-dom` | TypeScript type support |

### Storage

- **`localStorage`** — Persists API keys, chat history, and user preferences with no server needed

### Fonts

- **Inter** — Primary UI font (weights 300–700)
- **JetBrains Mono** — Monospace font for code blocks

---

## 📁 Project Structure

```
boom-ai/
│
├── index.html              # App entry point & meta tags
├── package.json
├── vite.config.js
│
└── src/
    ├── main.jsx            # React DOM root
    ├── App.jsx             # Root component & global state
    ├── index.css           # Global styles & design system
    │
    ├── components/
    │   ├── Header.jsx          # App bar: provider/model selector, settings button
    │   ├── Sidebar.jsx         # Chat history list & new chat button
    │   ├── ChatWindow.jsx      # Scrollable message container
    │   ├── Message.jsx         # Individual chat message (user & assistant)
    │   ├── Composer.jsx        # Message input, send/stop, image mode toggle
    │   ├── WelcomeScreen.jsx   # Shown on a fresh chat with prompt suggestions
    │   ├── SettingsModal.jsx   # API key configuration & preferences
    │   └── ImageMessage.jsx    # Displays generated images with download button
    │
    ├── services/
    │   ├── gemini.js           # Google Gemini API adapter (text + image)
    │   ├── openrouter.js       # OpenRouter API adapter (text + image)
    │   └── aiService.js        # Unified provider abstraction layer
    │
    ├── hooks/
    │   ├── useChat.js          # Core chat logic: send, stream, history management
    │   └── useLocalStorage.js  # Persistent state synced to localStorage
    │
    └── utils/
        ├── storage.js          # Read/write helpers for localStorage keys
        ├── models.js           # Model registry with provider & capability flags
        └── helpers.js          # General-purpose utility functions
```

---

## ⚙️ Setup & Installation

### Prerequisites

Make sure you have the following installed:

- **Node.js** v18 or later — [Download here](https://nodejs.org/)
- **npm** v9 or later (comes with Node.js)

You'll also need **at least one API key** from:

- [Google AI Studio](https://aistudio.google.com/apikey) — for Gemini models (free tier available)
- [OpenRouter](https://openrouter.ai/keys) — for OpenRouter models (optional)

---

### Step 1 — Clone the Repository

```bash
git clone https://github.com/Azmattullah/boom-ai.git
cd boom-ai
```

---

### Step 2 — Install Dependencies

```bash
npm install
```

This installs all packages listed in `package.json` into `node_modules/`.

---

### Step 3 — Start the Development Server

```bash
npm run dev
```

Vite will start a local dev server. Open the URL shown in your terminal (typically **http://localhost:5173**) in your browser.

---

### Step 4 — Configure Your API Keys

No `.env` file is required. API keys are entered directly inside the app:

1. Click the **⚙ Settings** button in the top-right corner of the app
2. Paste your **Gemini API Key** (get one at [aistudio.google.com](https://aistudio.google.com/apikey))
3. Optionally paste your **OpenRouter API Key** (get one at [openrouter.ai/keys](https://openrouter.ai/keys))
4. Click **Save Settings**

Keys are saved to your browser's `localStorage` and persist across sessions. They never leave your browser.

---

### Step 5 — Start Chatting!

- Select a **Provider** (Gemini or OpenRouter) from the header dropdown
- Select a **Model** for that provider
- Type your message and press **Enter** (or click Send)
- Switch to **Image mode** in the composer to generate images

---

## 🏗️ Building for Production

To generate an optimized production build in the `dist/` folder:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

You can deploy the `dist/` folder to any static hosting service such as:

- [Vercel](https://vercel.com/)
- [Netlify](https://netlify.com/)
- [GitHub Pages](https://pages.github.com/)
- [Cloudflare Pages](https://cloud.google.com/)

---

## 🔒 Security Note

> **Important:** This app runs entirely in the browser. API keys stored in `localStorage` are accessible via browser DevTools. This is acceptable for a **personal, private tool**, but do **not** share your browser session or deploy this app publicly with your keys pre-filled.
>
> For public deployments, consider adding a backend proxy to keep keys server-side.

---

## 📜 License

This project is for personal use. Feel free to fork and customize it for your own needs.
