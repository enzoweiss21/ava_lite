// src/components/CompletedList.tsx
'use client';
import useSWR from 'swr';
import { motion } from 'framer-motion';
import { CompletedTask, Task, Decision } from '@/lib/types';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function CompletedList({ onExplain }: { onExplain: (t: Task, d: Decision) => void }) {
  const { data } = useSWR('/api/history', fetcher, { refreshInterval: 10000 });
  const tasks: CompletedTask[] = data?.tasks || [];

  if (tasks.length === 0) {
    return <div className="text-sm text-gray-500">No completed tasks yet...</div>;
  }

  return (
    <motion.div layout className="space-y-2">
      {tasks.map((completed, idx) => {
        const task = completed.task;
        const decision = completed.decision;
        const timeAgo = getTimeAgo(completed.completedAt);

        return (
          <motion.div
            key={completed.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="p-3 rounded-lg bg-white border border-gray-200 hover:border-indigo-300 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-green-600">✓ Completed</span>
                  <span className="text-xs text-gray-500">{timeAgo}</span>
                </div>
                <div className="font-medium text-sm mb-1 truncate">{task.title}</div>
                <div className="text-xs text-gray-600 truncate">
                  {decision.action} • {Math.round(decision.confidence * 100)}% confidence
                </div>
              </div>
              <button
                onClick={() => onExplain(task, decision)}
                className="shrink-0 text-xs px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors font-medium"
              >
                💬 Let's Chat
              </button>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

function getTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

