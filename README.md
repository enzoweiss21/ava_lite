# Ava Mirror

> **"Meet your AI teammate — she can tell you what she's thinking."**

An explainable AI employee interface that makes autonomous decisions transparent. Ava shows what she's doing, why she made each decision, and answers follow-up questions in natural language.

![Ava Mirror Demo](https://img.shields.io/badge/Demo-Live-success)

## Features

- 🤖 **Live Task Feed** - See what Ava is working on in real-time
- 💭 **Explainable Decisions** - Click "Why?" to understand her reasoning
- 🎯 **Confidence Scoring** - See how confident Ava is in each decision
- 🔍 **Signal Transparency** - View the evidence used for each decision
- 💬 **Interactive Q&A** - Ask follow-up questions about any decision
- 🎨 **Beautiful UI** - Modern, responsive design with smooth animations

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

## Environment Setup

Create a `.env.local` file (optional):

```bash
# Optional: Enable real LLM responses with OpenAI
OPENAI_API_KEY=sk-...

# Demo mode (uses mock data)
NEXT_PUBLIC_DEMO_MODE=true
```

**Note:** The app works perfectly without an OpenAI API key! It will use intelligent mock responses for the demo.

## Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Data Fetching:** SWR
- **LLM:** OpenAI GPT-4 (optional)

## Demo Scenario

Ava is an AI BDR (Business Development Representative) who:
1. Scores leads based on funding, tech stack, and hiring signals
2. Drafts personalized emails using prospect research
3. Manages outreach sequences and domain health
4. Makes autonomous decisions with full transparency

## Project Structure

```
ava-mirror/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── tasks/route.ts      # Task feed API
│   │   │   └── explain/route.ts    # Explanation API
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── AvaAvatar.tsx           # Animated avatar
│   │   ├── TaskFeed.tsx            # Live task stream
│   │   ├── ReasoningPanel.tsx      # Explanation modal
│   │   └── ThoughtBubble.tsx       # Speech bubble
│   └── lib/
│       ├── types.ts                # TypeScript definitions
│       ├── demoData.ts             # Mock task scenarios
│       ├── prompts.ts              # LLM prompt templates
│       └── voice.ts                # Text-to-speech utility
```

## Key Components

### Task Feed
Shows Ava's current and recent tasks with timestamps. Each task displays:
- Task title and type
- Action taken
- "Why?" button to explain the decision

### Reasoning Panel
Opens when you click "Why?" and shows:
- What Ava did
- Signals used (with weights)
- Confidence level (0-100%)
- Alternative actions considered
- What she'll do next
- Interactive follow-up chat

### Demo Data
Rotates through 3 realistic scenarios:
1. **Pause Sequence** - Domain health protection
2. **Score Lead** - Lead qualification
3. **Draft Email** - Personalized outreach

## Development

```bash
# Run dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/ava-mirror)

1. Push to GitHub
2. Import in Vercel
3. Add `OPENAI_API_KEY` env var (optional)
4. Deploy!

## Customization

### Add New Task Types

Edit `src/lib/demoData.ts` to add new scenarios:

```typescript
{
  task: {
    id: 't4',
    kind: 'BOOK_MEETING',
    title: 'Book demo with Acme Corp',
    ts: Date.now(),
    metadata: { ... }
  },
  decision: {
    action: 'SEND_CALENDAR_LINK',
    reason_summary: '...',
    confidence: 0.85,
    signals: [...]
  }
}
```

### Connect Real Data

Replace `getSnapshot()` in `src/app/api/tasks/route.ts` with your actual task queue:

```typescript
export async function GET() {
  const snapshot = await fetchFromYourAPI();
  return NextResponse.json(snapshot);
}
```

### Enable Voice

Uncomment voice integration in `ReasoningPanel.tsx`:

```typescript
import { speak } from '@/lib/voice';

// After receiving explanation:
speak(json.text);
```

## Demo Script (60-90 seconds)

1. Open the app - Ava greets you
2. Watch the task feed update every 3 seconds
3. Click **"Why?"** on "Pause Sequence A"
4. See the full reasoning with signals and confidence
5. Ask: "What would you do if reply volume drops?"
6. Ava answers intelligently with context
7. Check another task (Lead Scoring) - ask "Why 0.72?"

## What's Next?

Ready to take this further? Here's the roadmap:

- [ ] Wire to real deliverability metrics
- [ ] Add approval workflow ("explain first, act after approval")
- [ ] Build decision history and precedent matching
- [ ] Create explainability coverage dashboard
- [ ] Add override tracking and learning
- [ ] Integrate with CRM and email systems

## Architecture Notes

- **Edge-ready:** API routes use Next.js Edge Runtime compatible patterns
- **Graceful fallback:** Works without OpenAI API key using mock responses
- **Type-safe:** Full TypeScript coverage
- **Responsive:** Mobile-first design
- **Accessible:** Semantic HTML and keyboard navigation

## License

MIT

## Contact

Built with ❤️ for transparent AI systems.

---

**Ready to make AI teammates transparent and trustworthy?** Give Ava a voice and let her explain herself.
