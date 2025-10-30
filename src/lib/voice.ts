// src/lib/voice.ts
export function speak(text: string){
  if (typeof window === 'undefined') return;
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = 1.02;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
}

