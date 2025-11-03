// src/components/ReasoningPanel.tsx
'use client';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Task, Decision, FeedbackKind } from '@/lib/types';
import VoiceControlsOpenAI, { speakTextOpenAI, isAvaMuted } from './VoiceControlsOpenAI';

export default function ReasoningPanel({ task, decision, onClose }:{ task:Task, decision:Decision, onClose:()=>void }){
  const [text, setText] = useState<string>('Generating explanation…');
  const [history, setHistory] = useState<string>('');
  const [feedbackGiven, setFeedbackGiven] = useState<FeedbackKind | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [shouldSpeak, setShouldSpeak] = useState(false);
  const hasExplainedRef = useRef(false);
  const hasSpokenInitialRef = useRef(false);

  async function explain() {
    const res = await fetch('/api/explain', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task, decision })
    });
    const json = await res.json();
    setText(json.text);
    setHistory(prev => prev + `\nAva: ${json.text}`);
  }

  async function askFollowup(q: string, fromVoice: boolean = false) {
    if (!q.trim()) return;
    const res = await fetch('/api/explain', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ followup: q, history })
    });
    const json = await res.json();
    setText(json.text);
    setHistory(prev => prev + `\nUser: ${q}\nAva: ${json.text}`);
    
    // Only speak if question was asked via voice recording
    if (fromVoice) {
      setShouldSpeak(true);
    }
  }

  async function giveFeedback(kind: FeedbackKind) {
    setFeedbackGiven(kind);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);

    await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId: task.id, kind }),
    });
  }

  // Auto-explain when panel opens (guard against React StrictMode double-invoke)
  useEffect(() => {
    if (hasExplainedRef.current) return;
    hasExplainedRef.current = true;
    explain();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Speak the initial generated explanation once (when opening via "Let's Chat")
  useEffect(() => {
    if (!text || text === 'Generating explanation…') return;
    if (hasSpokenInitialRef.current) return;
    hasSpokenInitialRef.current = true;
    if (isAvaMuted()) return;
    (async () => {
      try {
        await speakTextOpenAI(text, 'alloy', 1.0);
      } catch {}
    })();
  }, [text]);

  // Speak response if triggered by voice input (follow-ups via mic)
  useEffect(() => {
    if (shouldSpeak && text && text !== 'Generating explanation…') {
      if (!isAvaMuted()) {
        speakTextOpenAI(text, 'alloy', 1.0);
      }
      setShouldSpeak(false);
    }
  }, [shouldSpeak, text]);

  const confidence = Math.round(decision.confidence * 100);
  const topSignals = decision.signals.slice(0, 3);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center p-4 z-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full sm:max-w-3xl rounded-2xl bg-white p-6 space-y-4 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="font-semibold text-lg">Ava's Reasoning</div>
          <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700 transition-colors">✕ Close</button>
        </div>

        {/* Task info */}
        <div className="text-sm text-gray-600">
          <span className="font-medium">{task.title}</span>
          <span className="text-gray-400 mx-2">•</span>
          <span className="text-xs">{decision.action}</span>
        </div>

        {/* Confidence bar */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-600">Confidence</span>
            <span className="font-semibold text-gray-900">{confidence}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className={`h-full ${
                confidence >= 80 ? 'bg-green-500' : 
                confidence >= 60 ? 'bg-yellow-500' : 
                'bg-orange-500'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${confidence}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Top signals */}
        {topSignals.length > 0 && (
          <div>
            <div className="text-xs font-medium text-gray-600 mb-2">Top Signals</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {topSignals.map((signal, idx) => (
                <div key={idx} className="p-2 rounded-lg bg-gray-50 border border-gray-200">
                  <div className="text-xs font-medium text-gray-700 truncate">{signal.key}</div>
                  <div className="text-sm font-semibold text-gray-900 truncate">{signal.value}</div>
                  {signal.weight && (
                    <div className="text-xs text-gray-500">Weight: {Math.round(signal.weight * 100)}%</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Explanation text */}
        <div className="prose prose-sm max-w-none whitespace-pre-wrap bg-gray-50 rounded-lg p-4 border border-gray-200">
          {text}
        </div>

        {/* Feedback buttons */}
        <div>
          <div className="text-xs font-medium text-gray-600 mb-2">How was this decision?</div>
          <div className="flex gap-2">
            <button
              onClick={() => giveFeedback(FeedbackKind.AWESOME)}
              disabled={feedbackGiven !== null}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                feedbackGiven === FeedbackKind.AWESOME
                  ? 'bg-green-100 text-green-700 border-2 border-green-500'
                  : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
              } disabled:opacity-50`}
            >
              👍 Awesome Decision
            </button>
            <button
              onClick={() => giveFeedback(FeedbackKind.NOT_IDEAL)}
              disabled={feedbackGiven !== null}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                feedbackGiven === FeedbackKind.NOT_IDEAL
                  ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-500'
                  : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200'
              } disabled:opacity-50`}
            >
              🤔 Not Ideal
            </button>
            <button
              onClick={() => giveFeedback(FeedbackKind.NEVER_DO_THIS)}
              disabled={feedbackGiven !== null}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                feedbackGiven === FeedbackKind.NEVER_DO_THIS
                  ? 'bg-red-100 text-red-700 border-2 border-red-500'
                  : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
              } disabled:opacity-50`}
            >
              🚫 Never Do This
            </button>
          </div>
        </div>

        {/* Voice controls */}
        <div className="border-t pt-3">
          <div className="text-xs font-medium text-gray-600 mb-2">🎙️ Voice Input (OpenAI Whisper)</div>
          <VoiceControlsOpenAI 
            onTranscript={(q) => askFollowup(q, true)}
            voice="nova"
          />
        </div>

        {/* Text input fallback */}
        <div className="flex gap-2">
          <input 
            id="q" 
            placeholder="Or type a follow-up question…" 
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const input = e.target as HTMLInputElement;
                if (input.value) {
                  askFollowup(input.value);
                  input.value = '';
                }
              }
            }}
          />
          <button 
            onClick={() => {
              const i = document.getElementById('q') as HTMLInputElement;
              if (i?.value) { 
                askFollowup(i.value); 
                i.value=''; 
              }
            }} 
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors font-medium"
          >
            Ask
          </button>
        </div>

        {/* Toast notification */}
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg"
          >
            ✓ Feedback received! Ava is learning from this.
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

