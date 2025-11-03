// src/app/page.tsx
'use client';
import { useState, useEffect } from 'react';
import useSWR from 'swr';
import AvaAvatar from '@/components/AvaAvatar';
import ThoughtBubble from '@/components/ThoughtBubble';
import TaskFeed from '@/components/TaskFeed';
import ReasoningPanel from '@/components/ReasoningPanel';
import CompletedList from '@/components/CompletedList';
import InProgressList from '@/components/InProgressList';
import { Task, Decision, InProgressTask } from '@/lib/types';
import { speakText } from '@/components/VoiceControls';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function Home() {
  const [speaking] = useState(false);
  const [introPlayed, setIntroPlayed] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [muted, setMuted] = useState(false);
  const [panel, setPanel] = useState<{task:Task, decision:Decision}|null>(null);
  
  // Introduce Ava aloud on page load
  useEffect(() => {
    if (typeof window === 'undefined') return;
    setSpeechSupported(!!window.speechSynthesis);
    const hasSpeech = typeof window !== 'undefined' && 'speechSynthesis' in window;
    if (!hasSpeech) return;
    const line = "Hi, I’m Ava — your AI BDR. Click ‘Barge in’ to see what I’m currently working on, or click ‘Let’s chat’ to talk about what I’ve done in the past.";

    const trySpeak = async () => {
      if (introPlayed) return;
      if (muted) { setIntroPlayed(true); return; }
      try { await speakText(line); } catch {}
      setIntroPlayed(true);
    };

    // Ensure voices are loaded before speaking (Chrome quirk)
    const synth = window.speechSynthesis;
    const startTimer = () => setTimeout(trySpeak, 600);

    if (synth.getVoices().length > 0) {
      const timerId = startTimer();
      return () => clearTimeout(timerId as unknown as number);
    }

    const onVoices = () => {
      const timerId = startTimer();
      // cleanup both listener and timer
      return () => clearTimeout(timerId as unknown as number);
    };
    synth.addEventListener('voiceschanged', onVoices, { once: true } as any);

    return () => {
      try { synth.removeEventListener('voiceschanged', onVoices as any); } catch {}
    };
  }, []);

  // Fallback: if autoplay is blocked, speak on first user interaction
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (introPlayed) return;
    const line = "Hi, I’m Ava — your AI BDR. Click ‘Barge in’ to see what I’m currently working on, or click ‘Let’s chat’ to talk about what I’ve done in the past.";

    const onFirstInteract = async () => {
      if (introPlayed) return;
      if (muted) { setIntroPlayed(true); cleanup(); return; }
      try { await speakText(line); } catch {}
      setIntroPlayed(true);
      cleanup();
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        onFirstInteract();
      }
    };

    function cleanup(){
      window.removeEventListener('pointerdown', onFirstInteract);
      window.removeEventListener('keydown', onKey);
    }
    window.addEventListener('pointerdown', onFirstInteract, { once: true });
    window.addEventListener('keydown', onKey);

    return () => {
      cleanup();
    };
  }, [introPlayed]);

  const handlePlayIntro = async () => {
    if (!speechSupported) return;
    const line = "Hi, I’m Ava — your AI BDR. Click ‘Barge in’ to see what I’m currently working on, or click ‘Let’s chat’ to talk about what I’ve done in the past.";
    if (muted) { setIntroPlayed(true); return; }
    try { await speakText(line); } catch {}
    setIntroPlayed(true);
  };

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
  };
  
  // Fetch stats for footer
  const { data: historyData } = useSWR('/api/history', fetcher, { refreshInterval: 10000 });
  const { data: feedbackData } = useSWR('/api/feedback', fetcher, { refreshInterval: 10000 });

  const totalExplained = (historyData?.tasks?.length || 0) + 3; // +3 for current feed
  const avgConfidence = historyData?.tasks?.reduce((acc: number, t: any) => acc + (t.decision.confidence * 100), 0) / (historyData?.tasks?.length || 1) || 75;
  const feedbackReceived = feedbackData?.total || 0;

  const handleBargeIn = (inProgressTask: InProgressTask) => {
    // Create a summary for the barge-in
    const completedSteps = inProgressTask.steps.filter(s => s.completed).length;
    const totalSteps = inProgressTask.steps.length;
    const currentStepName = inProgressTask.steps[inProgressTask.currentStep]?.name || 'Unknown';
    
    const bargeInSummary = `I'm currently working on: ${inProgressTask.task.title}

Progress: ${completedSteps}/${totalSteps} steps completed (${Math.round((completedSteps/totalSteps)*100)}%)

Current step: ${currentStepName}

Completed steps:
${inProgressTask.steps.filter(s => s.completed).map(s => `✓ ${s.name}`).join('\n')}

Remaining steps:
${inProgressTask.steps.filter(s => !s.completed).map(s => `○ ${s.name}`).join('\n')}

This decision was made with ${Math.round(inProgressTask.decision.confidence * 100)}% confidence based on these signals: ${inProgressTask.decision.signals.map(s => s.key).join(', ')}.`;

    // Open reasoning panel with the barge-in context
    const modifiedDecision = {
      ...inProgressTask.decision,
      reason_summary: bargeInSummary,
    };
    
    setPanel({ task: inProgressTask.task, decision: modifiedDecision });
  };

  return (
    <>
      <main className="mx-auto max-w-6xl px-4 py-10 space-y-8 pb-32">
        {/* Header */}
        <div className="flex items-center gap-4">
          <AvaAvatar speaking={speaking} />
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">Ava Mirror</h1>
            <ThoughtBubble text="Click ‘Barge in’ to see what I'm working on, or ‘Let's chat’ to talk about what I've done in the past." />
            <button
              onClick={toggleMute}
              className={`text-xs px-2 py-1 rounded border ${muted ? 'text-gray-600 border-gray-300 bg-gray-50' : 'text-indigo-700 border-indigo-200 bg-indigo-50'} hover:opacity-90`}
              title={muted ? 'Unmute Ava' : 'Mute Ava'}
            >
              {muted ? '🔇 Unmute Ava' : '🔊 Mute Ava'}
            </button>

          </div>
        </div>

        {/* Main grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: Live feed */}
          <section className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-sm uppercase tracking-wide text-gray-500 font-semibold mb-3">
                🔴 Live Work Feed
              </h2>
              <TaskFeed onExplain={(task, decision)=> setPanel({task, decision})} />
            </div>

            <div>
              <h2 className="text-sm uppercase tracking-wide text-gray-500 font-semibold mb-3">
                ⏳ In Progress
              </h2>
              <InProgressList onBargeIn={handleBargeIn} />
            </div>
          </section>

          {/* Right column: Completed */}
          <section className="space-y-3">
            <h2 className="text-sm uppercase tracking-wide text-gray-500 font-semibold mb-3">
              ✅ Completed Tasks
            </h2>
            <CompletedList onExplain={(task, decision)=> setPanel({task, decision})} />
          </section>
        </div>
      </main>

      {/* Footer with stats */}
      <footer className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Explained:</span>
                <span className="bg-white/20 px-2 py-0.5 rounded-full font-mono">{totalExplained}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">Avg Confidence:</span>
                <span className="bg-white/20 px-2 py-0.5 rounded-full font-mono">{Math.round(avgConfidence)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">Feedback:</span>
                <span className="bg-white/20 px-2 py-0.5 rounded-full font-mono">{feedbackReceived}</span>
              </div>
            </div>
            <div className="text-xs opacity-75">
              Ava Mirror v2.0 • Transparent AI Teammate
            </div>
          </div>
        </div>
      </footer>

      {/* Reasoning panel overlay */}
      {panel && (
        <ReasoningPanel task={panel.task} decision={panel.decision} onClose={()=>setPanel(null)} />
      )}
    </>
  );
}
