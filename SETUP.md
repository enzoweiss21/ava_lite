# Ava Mirror - Setup Guide

## Prerequisites

**Important:** Next.js 16 requires Node.js version >= 20.9.0

Your current version: `18.20.5`

### Upgrade Node.js

Choose one of these methods:

#### Option 1: Using nvm (Recommended)
```bash
# Install nvm if you haven't already
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install and use Node.js 20
nvm install 20
nvm use 20
```

#### Option 2: Direct Download
Download from [nodejs.org](https://nodejs.org/) (LTS version 20.x or higher)

#### Option 3: Using Homebrew (macOS)
```bash
brew install node@20
brew link node@20
```

## Installation

Once you have Node.js 20+:

```bash
cd ava-mirror

# Install dependencies
npm install

# Create environment file (optional)
cp .env.example .env.local

# Edit .env.local and add your OpenAI API key if you have one
# (The app works great without it using mock responses!)

# Run development server
npm run dev
```

## Open the App

Navigate to [http://localhost:3000](http://localhost:3000)

## Troubleshooting

### Port Already in Use

If port 3000 is already in use:

```bash
npm run dev -- -p 3001
```

### Module Not Found Errors

Clear the cache and reinstall:

```bash
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors

Generate type definitions:

```bash
npm run build
```

## Environment Variables

Create `.env.local` in the root directory:

```bash
# Optional: Enable real LLM responses
# OPENAI_API_KEY=sk-proj-...

# Demo mode (works without API key)
NEXT_PUBLIC_DEMO_MODE=true
```

**Note:** Without an OpenAI API key, Ava will use pre-written mock explanations that still demonstrate the full capability of the interface.

## Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your repository
5. Add environment variables (if using OpenAI)
6. Deploy!

Vercel will automatically handle the build and deployment.

## Development Tips

### Watch for Changes
The dev server auto-reloads on file changes.

### Check Console
Open browser DevTools to see any client-side errors.

### Test API Routes
- Tasks API: `http://localhost:3000/api/tasks`
- Explain API: `POST http://localhost:3000/api/explain`

### Add New Scenarios
Edit `src/lib/demoData.ts` to add more task examples.

## Need Help?

- Check the main [README.md](./README.md) for full documentation
- Review the code comments for implementation details
- All components are well-documented with JSDoc comments

---

**Ready to go!** Once Node.js is upgraded, run `npm run dev` and start exploring Ava Mirror.

