# Ava Mirror - Quick Start (5 Minutes)

## 🚨 Important: Node.js Version

This project requires **Node.js 20.9.0 or higher**.

Check your version:
```bash
node --version
```

If you're on Node.js 18.x (like the current system), see [SETUP.md](./SETUP.md) for upgrade instructions.

---

## Option 1: Quick Test (With Node 20+)

```bash
# Navigate to the project
cd ava-mirror

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**That's it!** The app works out of the box with mock data.

---

## Option 2: With OpenAI Integration

1. Get an OpenAI API key from [platform.openai.com](https://platform.openai.com)

2. Create `.env.local`:
```bash
OPENAI_API_KEY=sk-proj-your-key-here
NEXT_PUBLIC_DEMO_MODE=true
```

3. Run the dev server:
```bash
npm run dev
```

Now Ava will use real AI for explanations instead of mock responses!

---

## What You'll See

1. **Ava's Avatar** - Animated gradient circle (can pulse when speaking)
2. **Greeting Message** - "Hi! I'll explain the decisions I'm making as I work."
3. **Live Task Feed** - Updates every 3 seconds with new tasks
4. **"Why?" Button** - Click to see full decision reasoning
5. **Explanation Panel** - Shows signals, confidence, alternatives
6. **Follow-up Chat** - Ask Ava questions about her decisions

---

## Demo Flow

1. Wait for a task to appear (3 seconds)
2. Click **"Why?"** on "Pause Sequence A"
3. Read the explanation
4. Type a follow-up: "What would you do if reply volume drops?"
5. Click **"Ask"**
6. See Ava's contextual response
7. Close the panel and watch for the next task

---

## Troubleshooting

### "Module not found" errors
```bash
rm -rf node_modules package-lock.json
npm install
```

### Port 3000 already in use
```bash
npm run dev -- -p 3001
```

### Can't upgrade Node.js right now?
You can still explore the code! All TypeScript files are well-commented.

Check out:
- `src/components/` - React components
- `src/lib/demoData.ts` - Mock task scenarios
- `src/app/api/` - API route handlers

---

## Next Steps

- Read [README.md](./README.md) for full documentation
- Check [DEMO_SCRIPT.md](./DEMO_SCRIPT.md) for presentation tips
- Review [OUTREACH.md](./OUTREACH.md) for message templates
- See [SETUP.md](./SETUP.md) for detailed setup instructions

---

## Deploy to Vercel (2 Minutes)

1. Push to GitHub:
```bash
git add .
git commit -m "Initial Ava Mirror implementation"
git push origin main
```

2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your repository
5. Click "Deploy"

Done! Vercel will give you a live URL.

---

## File Structure at a Glance

```
ava-mirror/
├── src/
│   ├── app/
│   │   ├── api/tasks/route.ts       # Task feed endpoint
│   │   ├── api/explain/route.ts     # Explanation endpoint
│   │   ├── page.tsx                 # Main page
│   │   ├── layout.tsx               # App layout
│   │   └── globals.css              # Global styles
│   ├── components/
│   │   ├── AvaAvatar.tsx            # Animated avatar
│   │   ├── TaskFeed.tsx             # Task stream
│   │   ├── ReasoningPanel.tsx       # Explanation modal
│   │   └── ThoughtBubble.tsx        # Speech bubble
│   └── lib/
│       ├── types.ts                 # TypeScript types
│       ├── demoData.ts              # Mock scenarios
│       ├── prompts.ts               # LLM prompts
│       └── voice.ts                 # Text-to-speech
├── README.md                        # Full documentation
├── SETUP.md                         # Detailed setup guide
├── DEMO_SCRIPT.md                   # Presentation script
└── OUTREACH.md                      # Message templates
```

---

**You're ready to go!** 🚀

Run `npm run dev` and open `localhost:3000` to see Ava Mirror in action.

