// ── Welcome Screen Component ─────────────────────────────────

const CARDS = [
  {
    icon: '✍',
    title: 'Write',
    desc: 'Essays, emails, stories',
    prompt: 'Help me write a professional email to ',
  },
  {
    icon: '💻',
    title: 'Code',
    desc: 'Debug, explain, build',
    prompt: 'Write a function in JavaScript that ',
  },
  {
    icon: '💡',
    title: 'Brainstorm',
    desc: 'Ideas, plans, strategy',
    prompt: 'Give me 5 creative ideas for ',
  },
  {
    icon: '🖼',
    title: 'Image',
    desc: 'Generate AI art',
    prompt: null, // will switch to image mode
    imageMode: true,
  },
];

export default function WelcomeScreen({ onPromptSelect, onImageMode }) {
  const handleCard = (card) => {
    if (card.imageMode) {
      onImageMode?.();
    } else if (card.prompt) {
      onPromptSelect?.(card.prompt);
    }
  };

  return (
    <div className="welcome-screen">
      <div>
        <h1 className="welcome-title">What can I help with?</h1>
        {/* <p className="welcome-subtitle">Powered by Gemini & OpenRouter</p> */}
      </div>

      <div className="welcome-cards">
        {CARDS.map((card) => (
          <button
            key={card.title}
            className="welcome-card"
            onClick={() => handleCard(card)}
          >
            <span className="welcome-card-icon">{card.icon}</span>
            <span className="welcome-card-title">{card.title}</span>
            <span className="welcome-card-desc">{card.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
