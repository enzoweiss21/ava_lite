// src/components/TaskFeed.tsx
'use client';
import useSWR from 'swr';
import { motion } from 'framer-motion';
import { Task, Decision } from '@/lib/types';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function TaskFeed({ onExplain }:{ onExplain:(t:Task,d:Decision)=>void }){
  const { data } = useSWR('/api/tasks', fetcher, { refreshInterval: 3000 });
  const task: Task | undefined = data?.task;
  const decision: Decision | undefined = data?.decision;

  if (!task) return <div className="text-sm text-gray-500">Waiting for tasks…</div>;

  return (
    <motion.div layout className="space-y-3">
      <div className="p-4 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 text-white shadow-lg border border-gray-700">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="text-xs opacity-70 mb-1">{new Date(task.ts).toLocaleTimeString()}</div>
            <div className="font-semibold text-base mb-1">{task.title}</div>
            <div className="text-xs opacity-80">Action: {decision?.action}</div>
          </div>
          <button
            onClick={() => onExplain(task, decision!)}
            className="shrink-0 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors border border-white/20"
          >
            Why?
          </button>
        </div>
      </div>
    </motion.div>
  );
}

