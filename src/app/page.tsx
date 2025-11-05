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
  const [speechSupported, setSpeechSupported] = useState(false);
  const [muted, setMuted] = useState(false);
  const [panel, setPanel] = useState<{task:Task, decision:Decision}|null>(null);
  
  // Detect browser speech support (no auto-intro)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    setSpeechSupported(!!window.speechSynthesis);
  }, []);

  const handlePlayIntro = async () => {
    if (!speechSupported) return;
    if (muted) return;
    const line = "Hi, I’m Ava — your AI BDR. Click ‘Barge in’ to see what I’m currently working on, or click ‘Let’s chat’ to talk about what I’ve done in the past.";
    try { await speakText(line); } catch {}
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
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="mx-auto max-w-7xl px-6 py-8 space-y-6 pb-32">
          {/* Header */}
          <div className="rounded-2xl bg-white shadow-lg border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-6 p-6">
              <AvaAvatar speaking={speaking} />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-3 flex-1">
                    <div>
                      <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Ava Mirror
                      </h1>
                      <p className="text-sm text-gray-500 mt-1">Your Transparent AI BDR</p>
                    </div>
                    <div className="max-w-2xl">
                      <ThoughtBubble text="Click 'Barge in' to see what I'm working on, or 'Let's chat' to talk about what I've done in the past." />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={handlePlayIntro}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-medium hover:from-indigo-600 hover:to-purple-600 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Have Ava introduce herself"
                      disabled={!speechSupported || muted}
                    >
                      👋 Say Hi
                    </button>
                    <button
                      onClick={toggleMute}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        muted 
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200' 
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm hover:shadow'
                      }`}
                      title={muted ? 'Unmute Ava' : 'Mute Ava'}
                    >
                      {muted ? '🔇 Muted' : '🔊'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main grid layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column: Live feed */}
            <section className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                  <h2 className="text-lg font-semibold text-gray-900">Live Work Feed</h2>
                </div>
                <TaskFeed onExplain={(task, decision)=> setPanel({task, decision})} />
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                  <h2 className="text-lg font-semibold text-gray-900">In Progress</h2>
                </div>
                <InProgressList onBargeIn={handleBargeIn} />
              </div>
            </section>

            {/* Right column: Completed */}
            <section>
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <h2 className="text-lg font-semibold text-gray-900">Completed Tasks</h2>
                </div>
                <CompletedList onExplain={(task, decision)=> setPanel({task, decision})} />
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Footer with stats */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <span className="text-gray-600 font-medium">Explained:</span>
                <span className="bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full font-semibold">{totalExplained}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600 font-medium">Avg Confidence:</span>
                <span className="bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full font-semibold">{Math.round(avgConfidence)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600 font-medium">Feedback:</span>
                <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-semibold">{feedbackReceived}</span>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              Ava Mirror v2.0
            </div>
          </div>
        </div>
      </footer>

      {/* Reasoning panel overlay */}
      {panel && (
        <ReasoningPanel task={panel.task} decision={panel.decision} onClose={()=>setPanel(null)} muted={muted} />
      )}
    </>
  );
}
