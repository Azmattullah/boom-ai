

# Boom AI — React Development Plan

## 1. Goal

Build a lightweight personal AI web application called **Boom AI** with:

* React.js
* One-page SPA
* Gemini API
* OpenRouter API
* Text chat
* Image generation
* Streaming responses
* Local API-key storage
* Local chat history
* No registration
* No login
* No backend
* No database
* Responsive desktop/tablet/mobile UI
* Simple, modern interface

The architecture should be:

```text
                    BOOM AI
                       │
                 React SPA
                       │
          ┌────────────┴────────────┐
          │                         │
       Gemini                  OpenRouter
          │                         │
          └────────────┬────────────┘
                       │
                  AI Response
                       │
              React Chat Interface
                       │
                  LocalStorage
```

For a personal application, this is a sensible architecture.

---

# 2. Important API-key decision

Because you don't want a backend, the browser will need access to the API keys.

I recommend **not hardcoding your keys into the source code**.

Instead:

```text
Settings
   │
   ├── Gemini API Key
   │
   └── OpenRouter API Key
            │
            ▼
       localStorage
```

The user enters their own keys once.

For your personal application, that's much better than putting a permanent key in the GitHub repository.

However, remember that a browser-based key is **not truly secret**. Anyone who has access to the browser/application can potentially inspect requests or JavaScript. Google also provides current API-key restriction guidance and recommends securing Gemini keys. ([Google AI for Developers][1])

For a private personal tool, this tradeoff is reasonable.

---

# 3. React technology stack

Keep the stack small:

```text
React
Vite
JavaScript or TypeScript
CSS
@google/genai
fetch()
localStorage
```

I recommend:

```text
React + Vite + JavaScript
```

rather than introducing Tailwind, Redux, React Query, Zustand, etc. immediately.

### Dependencies

Conceptually:

```text
react
react-dom
@google/genai
```

For Markdown/code rendering, you can later add:

```text
react-markdown
```

and optionally:

```text
react-syntax-highlighter
```

Google's current documentation recommends the `@google/genai` SDK for JavaScript/TypeScript, and the current Gemini documentation uses the newer Interactions API for new applications. ([Google AI for Developers][2])

---

# 4. Project structure

I recommend this:

```text
boom-ai/
│
├── index.html
├── package.json
├── vite.config.js
│
└── src/
    │
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    │
    ├── components/
    │   ├── Header.jsx
    │   ├── Sidebar.jsx
    │   ├── ChatWindow.jsx
    │   ├── Message.jsx
    │   ├── Composer.jsx
    │   ├── WelcomeScreen.jsx
    │   ├── SettingsModal.jsx
    │   ├── ModelSelector.jsx
    │   └── ImageMessage.jsx
    │
    ├── services/
    │   ├── gemini.js
    │   ├── openrouter.js
    │   └── aiService.js
    │
    ├── hooks/
    │   ├── useChat.js
    │   └── useLocalStorage.js
    │
    └── utils/
        ├── storage.js
        ├── markdown.js
        └── helpers.js
```

It's still a **single-page website**. The components are simply there to keep the React code manageable.

---

# 5. Main UI

The application should have one primary screen:

```text
┌────────────────────────────────────────────────────┐
│ ✦ Boom AI                         Gemini     ⚙     │
├──────────────┬─────────────────────────────────────┤
│              │                                     │
│ + New Chat   │          Welcome to Boom AI         │
│              │                                     │
│ Recent       │       What can I help with?         │
│              │                                     │
│ Chat 1       │  ┌─────────┐ ┌─────────┐           │
│ Chat 2       │  │ ✍ Write │ │ 💻 Code │           │
│ Chat 3       │  └─────────┘ └─────────┘           │
│              │                                     │
│              │  ┌─────────┐ ┌─────────┐           │
│              │  │ 💡 Idea  │ │ 🖼 Image│           │
│              │  └─────────┘ └─────────┘           │
│              │                                     │
│              │                                     │
│              │ ┌───────────────────────────────┐   │
│              │ │ Ask anything...          ➤   │   │
│              │ └───────────────────────────────┘   │
└──────────────┴─────────────────────────────────────┘
```

On mobile, hide the sidebar behind a hamburger menu.

---

# 6. Header

Keep it extremely simple:

```text
✦ Boom AI

[ Gemini ▼ ] [ Model ▼ ]       [ ⚙ Settings ]
```

The provider selector could contain:

```text
Gemini
OpenRouter
```

---

# 7. Chat interface

The chat should support:

### User

```text
┌─────────────────────────────┐
│ You                         │
│                             │
│ Explain React hooks simply. │
└─────────────────────────────┘
```

### AI

```text
┌─────────────────────────────┐
│ ✦ Boom AI                   │
│                             │
│ React hooks are functions   │
│ that let components use...  │
│                             │
│ [ Copy ] [ Regenerate ]     │
└─────────────────────────────┘
```

Use different styling for user and assistant messages.

---

# 8. Composer

This should be one of the most polished parts of the application.

```text
┌───────────────────────────────────────────────┐
│ Ask Boom AI anything...                      │
│                                               │
│ 📎     🖼                         Send ➤       │
└───────────────────────────────────────────────┘
```

Requirements:

* Auto-growing textarea
* Enter → send
* Shift + Enter → newline
* Send button
* Disable while request is invalid
* Stop generation button while streaming
* Image mode
* Optional file/image attachment later

---

# 9. Text / Image mode

Add a simple selector above the composer:

```text
[ Chat ] [ Image ]
```

### Chat mode

```text
Prompt
  ↓
Gemini/OpenRouter
  ↓
Text response
```

### Image mode

```text
Prompt
  ↓
Image-capable model
  ↓
Generated image
  ↓
Image message
```

Don't assume every OpenRouter model supports image generation. Your model configuration should explicitly mark which models support text versus image generation.

Gemini's current documentation includes both text and image-generation capabilities, so the Gemini adapter can expose those capabilities where supported. ([Google AI for Developers][2])

---

# 10. Gemini service

Create:

```text
src/services/gemini.js
```

Its job should be only:

```text
Gemini API
   │
   ├── sendText()
   ├── streamText()
   └── generateImage()
```

Don't put UI logic here.

Conceptually:

```javascript
export async function sendGeminiMessage({
    apiKey,
    model,
    messages
}) {
    // Gemini request
}
```

For streaming:

```javascript
export async function streamGeminiMessage({
    apiKey,
    model,
    messages,
    onChunk
}) {
    // Stream response
    // Call onChunk() for each piece
}
```

The current Gemini JavaScript documentation shows streaming through the GenAI SDK. ([Google AI for Developers][2])

---

# 11. OpenRouter service

Create:

```text
src/services/openrouter.js
```

Functions:

```javascript
sendOpenRouterMessage()
streamOpenRouterMessage()
generateOpenRouterImage()
```

The important thing is that your UI shouldn't care whether the request is going to Gemini or OpenRouter.

---

# 12. AI service abstraction

This is one of the most important pieces.

Create:

```text
src/services/aiService.js
```

Then:

```javascript
async function sendMessage(config) {

    if (config.provider === "gemini") {
        return sendGeminiMessage(config);
    }

    if (config.provider === "openrouter") {
        return sendOpenRouterMessage(config);
    }
}
```

Your React component then simply does:

```javascript
await sendMessage({
    provider,
    model,
    messages
});
```

It doesn't need to know the API details.

---

# 13. Normalized response

Both providers should return the same internal format.

For example:

```javascript
{
    role: "assistant",
    type: "text",
    content: "Hello! How can I help?"
}
```

Image:

```javascript
{
    role: "assistant",
    type: "image",
    content: imageUrl
}
```

Error:

```javascript
{
    role: "assistant",
    type: "error",
    content: "Unable to generate response."
}
```

This makes switching providers very easy.

---

# 14. State management

You don't need Redux.

React state is enough.

Your central state can be approximately:

```javascript
const [messages, setMessages] = useState([]);

const [provider, setProvider] = useState("gemini");

const [model, setModel] = useState("");

const [mode, setMode] = useState("chat");

const [isGenerating, setIsGenerating] = useState(false);
```

Settings:

```javascript
const [settings, setSettings] = useState({
    geminiApiKey: "",
    openRouterApiKey: ""
});
```

That's enough for version 1.

---

# 15. Conversation structure

Use:

```javascript
[
    {
        id: "1",
        role: "user",
        type: "text",
        content: "What is React?"
    },
    {
        id: "2",
        role: "assistant",
        type: "text",
        content: "React is a JavaScript library..."
    }
]
```

For images:

```javascript
{
    id: "3",
    role: "assistant",
    type: "image",
    content: "data/image/url"
}
```

---

# 16. LocalStorage

Since this is personal use, LocalStorage is ideal.

Store:

```text
boom_ai_settings
boom_ai_chats
boom_ai_preferences
```

For example:

```javascript
localStorage.setItem(
    "boom_ai_settings",
    JSON.stringify(settings)
);
```

Then the user can close the browser and return later without logging in.

No database is required.

---

# 17. API-key settings

Your settings modal should look like:

```text
┌────────────────────────────────────┐
│ Settings                       ×   │
├────────────────────────────────────┤
│                                    │
│ Gemini API Key                     │
│ ┌────────────────────────────────┐ │
│ │ ****************************** │ │
│ └────────────────────────────────┘ │
│                                    │
│ OpenRouter API Key                 │
│ ┌────────────────────────────────┐ │
│ │ ****************************** │ │
│ └────────────────────────────────┘ │
│                                    │
│ Default Provider                   │
│ [ Gemini ▼ ]                       │
│                                    │
│ Default Model                      │
│ [ Select model ▼ ]                 │
│                                    │
│ Theme                              │
│ [ Dark ▼ ]                         │
│                                    │
│        [ Save Settings ]            │
└────────────────────────────────────┘
```

Add:

```text
[ Clear API Keys ]
```

for convenience.

---

# 18. API-key behavior

On startup:

```text
App starts
   ↓
Read localStorage
   ↓
API key exists?
   │
   ├── Yes → Start normally
   │
   └── No → Show small setup prompt
```

Example:

```text
Welcome to Boom AI

Add your Gemini or OpenRouter API key
to start chatting.

[ Configure API Key ]
```

No registration.

No login.

No account system.

---

# 19. Streaming

This should be included in the first serious version.

Without streaming:

```text
Prompt
 ↓
[ waiting... ]
 ↓
Entire answer
```

With streaming:

```text
Prompt
 ↓
Boom AI
 ↓
React is...
 ↓
React is a JavaScript...
 ↓
React is a JavaScript library...
```

It makes the application feel substantially faster.

Gemini's current JavaScript API supports streaming through the SDK. ([Google AI for Developers][2])

---

# 20. Markdown support

AI responses should render:

* Headings
* Bold
* Italic
* Lists
* Links
* Code
* Code blocks
* Tables
* Quotes

Example:

````text
### React

React is a UI library.

```javascript
const App = () => {
    return <h1>Hello</h1>
}
````

````

Use `react-markdown` rather than manually writing a Markdown parser.

---

# 21. Code-block features

For programming responses:

```text
┌────────────────────────────────────┐
│ javascript                  Copy   │
├────────────────────────────────────┤
│ const hello = "Boom AI";           │
│ console.log(hello);                │
└────────────────────────────────────┘
````

Add:

```text
Copy
```

button.

This is a small feature that makes the application feel much more complete.

---

# 22. Image generation

For image generation, create:

```text
Image mode
```

with:

```text
┌──────────────────────────────────────┐
│ Describe your image                  │
│                                      │
│ A futuristic city at sunset...      │
│                                      │
│ Aspect Ratio                          │
│ [ 1:1 ▼ ]                            │
│                                      │
│             Generate                 │
└──────────────────────────────────────┘
```

After generation:

```text
┌───────────────────────────┐
│                           │
│                           │
│      Generated Image      │
│                           │
│                           │
└───────────────────────────┘

[ Download ] [ Regenerate ]
```

---

# 23. Image handling

Don't automatically put large image data into LocalStorage.

For version 1:

```text
Generate
   ↓
Display image
   ↓
Download if wanted
```

You can avoid permanently storing generated images.

That keeps your application lightweight.

---

# 24. Chat history

Your sidebar:

```text
┌──────────────────┐
│ + New Chat       │
├──────────────────┤
│ Today            │
│                  │
│ React question   │
│ Website ideas    │
│ Image prompts    │
│                  │
│ Yesterday        │
│                  │
│ Python help      │
└──────────────────┘
```

Each chat:

```javascript
{
    id: "chat-123",
    title: "React question",
    createdAt: "...",
    messages: []
}
```

Generate the title automatically from the first prompt:

```text
"Explain React hooks"

↓

"React hooks"
```

No AI call required.

---

# 25. Mobile design

Desktop:

```text
Sidebar | Chat
```

Mobile:

```text
Header
────────────
Chat
────────────
Composer
```

Sidebar becomes:

```text
☰
```

drawer.

The composer should remain fixed at the bottom.

Important mobile requirements:

* `100dvh`
* Avoid keyboard layout problems
* Auto-resize textarea
* Large touch targets
* No horizontal scrolling
* Responsive images
* Responsive code blocks

---

# 26. Visual design

I'd make Boom AI:

### Dark-first

```text
Background    #0A0A0A
Surface       #141414
Border        #262626
Text          #FAFAFA
Muted         #A1A1AA
Accent        #7C3AED
```

Or use a blue accent if you want a more Google-like feeling.

Keep it minimal.

Avoid:

* Huge gradients
* Complex dashboard
* 20 buttons
* Excessive animations
* Login pages
* Marketing sections

The application is basically:

> **Open → type → get AI response.**

---

# 27. Suggested React component tree

```text
App
│
├── Header
│   ├── Logo
│   ├── ProviderSelector
│   ├── ModelSelector
│   └── SettingsButton
│
├── Sidebar
│   ├── NewChatButton
│   └── ChatHistory
│
└── MainChat
    │
    ├── WelcomeScreen
    │
    ├── ChatWindow
    │   └── Message
    │       ├── TextMessage
    │       └── ImageMessage
    │
    └── Composer
        ├── ModeSelector
        ├── Textarea
        ├── AttachmentButton
        └── SendButton

SettingsModal
```

---

# 28. User flow

The entire application flow should be:

```text
Open Boom AI
       ↓
API key configured?
       │
   ┌───┴────┐
   │        │
  Yes       No
   │        │
   │     Settings
   │        │
   │     Add key
   │        │
   └───┬────┘
       ↓
   Welcome Screen
       ↓
Select Gemini/OpenRouter
       ↓
Select model
       ↓
Enter prompt
       ↓
Send
       ↓
Streaming response
       ↓
Render Markdown
       ↓
Save conversation locally
```

---

# 29. Image flow

```text
Click Image
     ↓
Image mode
     ↓
Enter prompt
     ↓
Select image-capable model
     ↓
Generate
     ↓
Loading
     ↓
Image
     ↓
Download
```

---

# 30. Error handling

Make errors human-readable.

### No API key

```text
Gemini API key is not configured.

Open Settings to add your key.
```

### Invalid key

```text
Your API key appears to be invalid.

Please check your settings.
```

### Rate limit

```text
API rate limit reached.

Please wait and try again.
```

### Network

```text
Unable to connect to the AI provider.
```

### Unsupported model

```text
This model doesn't support image generation.
```

Don't expose raw provider errors in the UI unless you're debugging.

---

# 31. Model configuration

Don't hardcode model logic throughout React.

Create:

```javascript
const models = {
    gemini: [
        {
            id: "...",
            name: "...",
            type: "text"
        },
        {
            id: "...",
            name: "...",
            type: "image"
        }
    ],

    openrouter: [
        {
            id: "...",
            name: "...",
            type: "text"
        }
    ]
};
```

Keep the model IDs in one place so you can update them easily as providers change their available models.

---

# 32. Personal-use optimization

Because this isn't a public SaaS application, you can intentionally remove a lot of complexity.

### Don't build:

```text
❌ Registration
❌ Login
❌ User profiles
❌ Email verification
❌ Password reset
❌ Database
❌ Admin dashboard
❌ Payments
❌ Subscription system
❌ Backend
❌ Analytics
❌ User management
```

### Build:

```text
✅ React
✅ Gemini
✅ OpenRouter
✅ LocalStorage
✅ Chat
✅ Image generation
✅ Streaming
✅ Responsive UI
```

That's the right level of complexity.

---

# 33. Recommended development phases

## Phase 1 — React foundation

Build:

```text
Vite
+
React
+
CSS
```

Create:

```text
App
Header
Sidebar
Chat
Composer
```

No API yet.

---

## Phase 2 — Fake AI

Before integrating APIs, make the interface work using fake responses.

Example:

```text
User:
Hello

AI:
Hello! Welcome to Boom AI.
```

This lets you finish the UI before debugging API problems.

---

## Phase 3 — Gemini

Add:

```text
Gemini API key
Gemini service
Text generation
Streaming
Conversation history
```

The current Gemini documentation recommends the newer Google GenAI SDK (`@google/genai`) for JavaScript. ([Google AI for Developers][2])

---

## Phase 4 — OpenRouter

Add:

```text
OpenRouter API key
Provider selector
Model selector
OpenRouter adapter
Streaming
```

Now:

```text
[ Gemini ▼ ]
```

can become:

```text
[ OpenRouter ▼ ]
```

without changing the chat UI.

---

## Phase 5 — Local persistence

Add:

```text
API settings
Chat history
Theme
Selected provider
Selected model
```

to LocalStorage.

---

## Phase 6 — Image generation

Add:

```text
[ Chat ] [ Image ]
```

Then:

```text
Image prompt
Image model
Generate
Preview
Download
```

---

## Phase 7 — Polish

Add:

```text
Markdown
Code highlighting
Copy
Regenerate
Stop
Auto-scroll
Mobile drawer
Dark/light theme
Keyboard shortcuts
```

---

# 34. Final folder architecture

I would ultimately target:

```text
boom-ai/
│
├── public/
│   └── favicon.svg
│
├── src/
│   │
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx
│   │   ├── ChatWindow.jsx
│   │   ├── Message.jsx
│   │   ├── Composer.jsx
│   │   ├── WelcomeScreen.jsx
│   │   ├── SettingsModal.jsx
│   │   └── ImageMessage.jsx
│   │
│   ├── services/
│   │   ├── aiService.js
│   │   ├── gemini.js
│   │   └── openrouter.js
│   │
│   ├── hooks/
│   │   ├── useChat.js
│   │   └── useLocalStorage.js
│   │
│   ├── utils/
│   │   ├── storage.js
│   │   └── helpers.js
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── index.html
├── package.json
└── vite.config.js
```

---

# 35. The simplest possible architecture

If your priority is **extreme lightweight**, you can simplify even further:

```text
src/
├── App.jsx
├── main.jsx
├── index.css
│
└── services/
    ├── gemini.js
    └── openrouter.js
```

Put most UI components directly inside `App.jsx`.

I'd actually recommend starting this way and splitting components only when `App.jsx` becomes difficult to maintain.

---

# 36. Important Gemini instruction for the coding agent

When you use Gemini to actually build this application, give it a **strict development specification**, rather than simply saying:

> "Build me an AI chatbot."

Tell Gemini exactly what it should and shouldn't build.

For example, your implementation instruction should establish:

```text
Build a personal-use AI web application called Boom AI.

Technology:
- React
- Vite
- JavaScript
- CSS
- @google/genai

Architecture:
- Client-side only
- No backend
- No database
- No authentication
- No registration
- No login
- Use localStorage for settings and chat history

AI providers:
- Gemini
- OpenRouter

Features:
- Text chat
- Streaming responses
- Image generation
- Provider selector
- Model selector
- API-key settings
- Markdown rendering
- Code blocks
- Copy response
- Regenerate response
- Stop generation
- New chat
- Local chat history
- Dark/light theme
- Responsive mobile/desktop design

Security:
- Never hardcode API keys
- Allow personal API keys to be entered through Settings
- Store keys locally
- Clearly warn that client-side API keys are not secret

UX:
- Minimal
- Fast
- Modern
- No unnecessary animations
- Mobile-first responsive composer
- Fixed bottom input
- Sidebar on desktop
- Drawer sidebar on mobile

Do not add:
- Backend
- Database
- Authentication
- Registration
- Payments
- Admin dashboard
- Analytics
- Redux
- Next.js
- Firebase
```

That gives Gemini a **much clearer implementation boundary**.

---

# 37. Recommended MVP

I would actually stop the first version here:

```text
                 BOOM AI
                    │
       ┌────────────┴────────────┐
       │                         │
    Gemini                  OpenRouter
       │                         │
       └────────────┬────────────┘
                    │
               Text Chat
                    │
          ┌─────────┴─────────┐
          │                   │
       Markdown             Images
          │                   │
       Copy Code           Download
          │
       Streaming
          │
     Local History
          │
      LocalStorage
```
