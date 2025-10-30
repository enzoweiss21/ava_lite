// src/components/AvaAvatar.tsx
'use client';
import { motion } from 'framer-motion';

export default function AvaAvatar({ speaking }: { speaking: boolean }) {
  return (
    <motion.div
      className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 shadow-xl"
      animate={{ scale: speaking ? 1.06 : 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
    />
  );
}

