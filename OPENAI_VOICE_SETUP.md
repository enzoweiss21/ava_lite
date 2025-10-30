# 🎙️ OpenAI Voice Integration - Setup Guide

## ✅ What Was Implemented

Your voice system has been **upgraded from browser-native to OpenAI**:

### **Before (Browser-Native):**
- ⚠️ Robotic voice quality
- ⚠️ Basic transcription accuracy
- ✅ FREE but limited

### **After (OpenAI Whisper + TTS):**
- ✅ Professional, natural-sounding voice
- ✅ Industry-leading transcription accuracy
- ✅ Consistent cross-browser experience
- 💰 ~$0.02 per conversation

---

## 🔑 Setup Required

### **1. Add OpenAI API Key**

Your `.env.local` file should already have this from v1, but make sure it's there:

```bash
# In /Users/enzoweiss/Desktop/Cluely/ava-mirror/.env.local
OPENAI_API_KEY=sk-proj-your-actual-key-here
NEXT_PUBLIC_DEMO_MODE=true
```

**Don't have a key?**
1. Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Create new secret key
3. Copy and paste into `.env.local`

### **2. Restart Dev Server**

```bash
# Stop current server (Ctrl+C)
cd /Users/enzoweiss/Desktop/Cluely/ava-mirror
npm run dev
```

That's it! 🎉

---

## 🎬 How It Works Now

### **User Flow:**

```
1. User clicks "🎤 Record" button
   ↓
2. Browser records audio (mic permission required)
   ↓
3. User clicks "⏹ Recording..." to stop
   ↓
4. Audio sent to OpenAI Whisper API (/api/voice/transcribe)
   ↓
5. Whisper returns accurate transcript
   ↓
6. Transcript sent as follow-up question to Ava
   ↓
7. Ava's response generated (/api/explain)
   ↓
8. Response sent to OpenAI TTS API (/api/voice/speak)
   ↓
9. Natural-sounding audio played back to user
```

---

## 📊 New API Routes

### **POST /api/voice/transcribe**

**Purpose:** Convert speech to text using Whisper

**Input:**
```typescript
FormData with audio blob (webm, mp3, wav, etc.)
```

**Output:**
```json
{
  "text": "What would you do if reply rates dropped?",
  "success": true
}
```

**Cost:** ~$0.006 per minute of audio

---

### **POST /api/voice/speak**

**Purpose:** Convert text to speech using OpenAI TTS

**Input:**
```json
{
  "text": "I would analyze subject line engagement...",
  "voice": "nova"  // Optional: alloy, echo, fable, onyx, nova, shimmer
}
```

**Output:**
```
audio/mpeg file (MP3)
```

**Cost:** ~$0.015 per 1,000 characters

---

## 🎤 Available Voices

OpenAI provides 6 high-quality voices:

| Voice | Description | Best For |
|-------|-------------|----------|
| **nova** (default) | Female, warm, natural | ✅ **Recommended for Ava** |
| **alloy** | Neutral, balanced | General use |
| **echo** | Male, deep, clear | Professional tone |
| **fable** | Male, expressive | Storytelling |
| **onyx** | Male, authoritative | Serious topics |
| **shimmer** | Female, soft, gentle | Calm responses |

**To change voice:**
Edit `src/components/ReasoningPanel.tsx`:
```typescript
<VoiceControlsOpenAI 
  onTranscript={askFollowup}
  voice="nova"  // Change to: alloy, echo, fable, onyx, shimmer
/>
```

---

## 💰 Cost Breakdown

### **Per Conversation:**

**User speaks 15 seconds:**
- Whisper transcription: ~$0.0015

**Ava responds with 200 words (~1,000 chars):**
- TTS generation: ~$0.015

**Total: ~$0.02 per conversation** ✅

### **Monthly Estimates:**

| Usage | Cost/Month |
|-------|-----------|
| 10 conversations/day | ~$6 |
| 50 conversations/day | ~$30 |
| 100 conversations/day | ~$60 |

---

## 🧪 Test It Now

1. **Open the app:**
   ```
   http://localhost:3000
   ```

2. **Click "Why?" on any task**

3. **Look for the voice section:**
   ```
   🎙️ Voice Input (OpenAI Whisper)
   [🎤 Record] button
   ```

4. **Click "Record" and say:**
   ```
   "What alternatives did you consider?"
   ```

5. **Click "⏹ Recording..." to stop**

6. **Watch:**
   - "Transcribing..." appears
   - Transcript shows: "What alternatives did you consider?"
   - Ava responds with text
   - Audio plays automatically (natural voice!)

---

## 🔧 File Changes

### **New Files Created (3):**
```
✓ src/app/api/voice/transcribe/route.ts  - Whisper STT endpoint
✓ src/app/api/voice/speak/route.ts       - OpenAI TTS endpoint
✓ src/components/VoiceControlsOpenAI.tsx - New voice UI component
```

### **Modified Files (1):**
```
✓ src/components/ReasoningPanel.tsx      - Uses new voice system
```

### **Old Files (Kept for Reference):**
```
○ src/components/VoiceControls.tsx       - Browser-native version
○ src/lib/voice.ts                       - Browser TTS helper
```

---

## ⚠️ Troubleshooting

### **"OpenAI API key not configured"**

**Solution:** Add key to `.env.local` and restart server
```bash
OPENAI_API_KEY=sk-proj-...
npm run dev
```

---

### **"Microphone access denied"**

**Solution:** Grant browser microphone permissions
- Chrome: Click 🔒 in address bar → Microphone → Allow
- Refresh page

---

### **"Failed to transcribe audio"**

**Possible causes:**
1. API key invalid → Check [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. No credits → Add payment method to OpenAI account
3. Audio too short → Speak for at least 1 second

---

### **No audio plays back**

**Possible causes:**
1. Browser audio blocked → Click speaker icon in address bar
2. API key issue → Check console for errors
3. TTS failed → Try typing question instead

---

### **Latency is slow**

**Expected:**
- Transcription: ~1-2 seconds
- TTS generation: ~1-2 seconds
- Total roundtrip: ~2-4 seconds

**If slower:**
- Check internet connection
- OpenAI API might be experiencing high load
- Consider using `tts-1` instead of `tts-1-hd` for faster (but slightly lower quality) responses

---

## 🎯 Voice Quality Settings

### **Current Settings (Optimized):**

**Whisper:**
```typescript
model: 'whisper-1'
language: 'en'
response_format: 'json'
```

**TTS:**
```typescript
model: 'tts-1'        // Fast, good quality
voice: 'nova'         // Natural female voice
speed: 1.0            // Normal speed
response_format: 'mp3'
```

### **Want Higher Quality?**

Edit `src/app/api/voice/speak/route.ts`:
```typescript
model: 'tts-1-hd'  // Higher quality, 2x cost, slightly slower
```

---

## 📈 Monitoring Usage

Check your OpenAI usage at:
[platform.openai.com/usage](https://platform.openai.com/usage)

You'll see:
- Whisper API calls (audio transcription)
- TTS API calls (speech generation)
- GPT-4o-mini calls (text explanations)

---

## 🔄 Fallback Behavior

**If OpenAI key is missing:**
- Voice controls show error message
- Text input still works perfectly
- All other features unaffected

**Graceful degradation:** App never breaks, just falls back to text-only mode.

---

## ✨ Benefits Over Browser-Native

| Feature | Browser | OpenAI |
|---------|---------|--------|
| Voice Quality | ⭐⭐ Robotic | ⭐⭐⭐⭐⭐ Human-like |
| Accuracy | ⭐⭐⭐ Basic | ⭐⭐⭐⭐⭐ Excellent |
| Consistency | ⚠️ Varies by browser | ✅ Same everywhere |
| Background Noise | ⚠️ Struggles | ✅ Handles well |
| Accents | ⚠️ Limited | ✅ Excellent |
| Cost | FREE | ~$0.02/conversation |

**Worth it?** ✅ YES for professional demos and production

---

## 🚀 You're All Set!

OpenAI voice is now live and ready to impress!

**Next steps:**
1. ✅ Make sure `.env.local` has your OpenAI API key
2. ✅ Restart dev server: `npm run dev`
3. ✅ Test voice: Click "Why?" → "Record" → speak
4. ✅ Hear Ava's natural voice response!

**Cost:** ~$0.02 per conversation (totally worth it) 💰✅

---

Built with 🎤 for professional AI interactions.

