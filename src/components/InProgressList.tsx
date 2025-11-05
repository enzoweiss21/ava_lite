// src/components/InProgressList.tsx
'use client';
import { useState } from 'react';
import useSWR from 'swr';
import { motion, AnimatePresence } from 'framer-motion';
import { InProgressTask } from '@/lib/types';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function InProgressList({ onBargeIn }: { onBargeIn: (task: InProgressTask) => void }) {
  const { data } = useSWR('/api/progress', fetcher, { refreshInterval: 5000 });
  const tasks: InProgressTask[] = data?.tasks || [];

  if (tasks.length === 0) {
    return <div className="text-sm text-gray-500">No tasks in progress...</div>;
  }

  return (
    <motion.div layout className="space-y-3">
      {tasks.map((inProgress, idx) => (
        <InProgressCard key={inProgress.id} task={inProgress} index={idx} onBargeIn={onBargeIn} />
      ))}
    </motion.div>
  );
}

function InProgressCard({ task, index, onBargeIn }: { task: InProgressTask; index: number; onBargeIn: (t: InProgressTask) => void }) {
  const [expanded, setExpanded] = useState(false);
  const progress = (task.steps.filter(s => s.completed).length / task.steps.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="p-4 rounded-xl bg-white border border-gray-200 hover:border-indigo-300 shadow-sm hover:shadow-md transition-colors"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-xs font-medium text-blue-600">In Progress</span>
            </div>
            <span className="text-xs text-gray-500">{Math.round(progress)}%</span>
          </div>
          <div className="font-medium text-sm mb-1 text-gray-900">{task.task.title}</div>
          <div className="text-xs text-gray-600">
            Step {task.currentStep + 1} of {task.steps.length}: {task.steps[task.currentStep]?.name}
          </div>
        </div>
        <button
          onClick={() => onBargeIn(task)}
          className="shrink-0 text-xs px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 transition-all shadow-sm hover:shadow font-medium"
        >
          🚀 Barge In
        </button>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mb-2">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      {/* Expandable steps */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
      >
        {expanded ? '▼ Hide steps' : '▶ Show steps'}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden mt-2"
          >
            <div className="space-y-1 pl-2 border-l-2 border-gray-200">
              {task.steps.map((step, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs">
                  {step.completed ? (
                    <span className="text-green-600">✓</span>
                  ) : idx === task.currentStep ? (
                    <span className="text-blue-600 animate-pulse">⏳</span>
                  ) : (
                    <span className="text-gray-400">○</span>
                  )}
                  <span className={step.completed ? 'text-gray-500 line-through' : 'text-gray-800'}>
                    {step.name}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

