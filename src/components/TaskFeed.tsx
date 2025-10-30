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
      <div className="p-3 rounded-xl bg-gray-900 text-gray-100">
        <div className="text-xs opacity-70">{new Date(task.ts).toLocaleTimeString()}</div>
        <div className="font-medium">{task.title}</div>
        <div className="text-xs opacity-80">Action: {decision?.action}</div>
        <button
          onClick={() => onExplain(task, decision!)}
          className="mt-2 text-xs px-2 py-1 rounded-lg bg-white text-black hover:bg-gray-100"
        >Why?</button>
      </div>
    </motion.div>
  );
}

