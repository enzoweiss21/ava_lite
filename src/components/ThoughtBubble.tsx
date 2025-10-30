// src/components/ThoughtBubble.tsx
export default function ThoughtBubble({ text }: { text: string }) {
  return (
    <div className="max-w-xl rounded-2xl bg-white/70 backdrop-blur p-4 shadow border border-black/5">
      <p className="text-sm leading-relaxed">{text}</p>
    </div>
  );
}

