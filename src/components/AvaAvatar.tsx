// src/components/AvaAvatar.tsx
'use client';
import { motion } from 'framer-motion';

export default function AvaAvatar({ speaking }: { speaking: boolean }) {
  return (
    <motion.div
      className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-xl"
      animate={{ scale: speaking ? 1.05 : 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent" />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-3xl">👤</span>
      </div>
    </motion.div>
  );
}

