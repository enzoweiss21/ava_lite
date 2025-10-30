// src/components/VoiceControls.tsx
'use client';
import { useState, useEffect, useRef } from 'react';

interface VoiceControlsProps {
  onTranscript: (text: string) => void;
  onSpeakResponse?: (text: string) => void;
}

export default function VoiceControls({ onTranscript, onSpeakResponse }: VoiceControlsProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if browser supports Web Speech API
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      setIsSupported(!!SpeechRecognition && !!window.speechSynthesis);

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          const current = event.resultIndex;
          const transcriptText = event.results[current][0].transcript;
          setTranscript(transcriptText);

          if (event.results[current].isFinal) {
            onTranscript(transcriptText);
            setTranscript('');
          }
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onTranscript]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const speak = (text: string) => {
    if (!window.speechSynthesis) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);

    if (onSpeakResponse) {
      onSpeakResponse(text);
    }
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  if (!isSupported) {
    return (
      <div className="text-xs text-gray-500 italic">
        Voice controls not supported in this browser
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* Microphone button */}
      <button
        onClick={isListening ? stopListening : startListening}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-all ${
          isListening
            ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse'
            : 'bg-indigo-500 text-white hover:bg-indigo-600'
        }`}
        title={isListening ? 'Stop listening' : 'Start voice input'}
      >
        {isListening ? '⏹' : '🎤'}
        <span>{isListening ? 'Listening...' : 'Speak'}</span>
      </button>

      {/* Stop speaking button (only shown when speaking) */}
      {isSpeaking && (
        <button
          onClick={stopSpeaking}
          className="px-3 py-2 rounded-lg bg-gray-500 text-white hover:bg-gray-600 font-medium text-sm transition-colors"
          title="Stop speaking"
        >
          🔇 Stop
        </button>
      )}

      {/* Transcript preview */}
      {transcript && (
        <div className="flex-1 text-xs text-gray-600 italic truncate">
          "{transcript}"
        </div>
      )}
    </div>
  );
}

// Export helper function for speaking text from other components
export function speakText(text: string) {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  }
}

