// src/components/VoiceControlsOpenAI.tsx
'use client';
import { useState, useRef } from 'react';

interface VoiceControlsOpenAIProps {
  onTranscript: (text: string) => void;
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  speed?: number; // 0.25 to 4.0, default 1.15 for slightly faster speech
}

export default function VoiceControlsOpenAI({ 
  onTranscript, 
  voice = 'nova', // Default to Nova (natural female voice)
  speed = 1.15 // Slightly faster speech
}: VoiceControlsOpenAIProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Start recording
  const startRecording = async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm', // Whisper supports webm, mp3, wav, etc.
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err: any) {
      console.error('Microphone error:', err);
      if (err.name === 'NotReadableError') {
        setError('🔴 Microphone is in use by another app. Close other apps using the microphone and try again.');
      } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('🔴 Microphone access denied. Click the 🔒 icon in your browser address bar to allow microphone access.');
      } else {
        setError(`🔴 Microphone error: ${err.message || 'Could not access microphone'}`);
      }
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Transcribe audio using OpenAI Whisper
  const transcribeAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    setTranscript('Transcribing...');

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const response = await fetch('/api/voice/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Transcription failed');
      }

      const data = await response.json();
      
      if (data.text) {
        setTranscript(data.text);
        onTranscript(data.text); // Send to parent component
      } else {
        setError('No speech detected. Please try again.');
      }
    } catch (err) {
      console.error('Transcription error:', err);
      setError('Failed to transcribe audio. Check your API key.');
    } finally {
      setIsTranscribing(false);
      setTimeout(() => setTranscript(''), 3000); // Clear after 3s
    }
  };

  // Speak text using OpenAI TTS
  const speakText = async (text: string) => {
    if (isSpeaking) {
      stopSpeaking();
    }

    setIsSpeaking(true);
    setError('');

    try {
      const response = await fetch('/api/voice/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice, speed }),
      });

      if (!response.ok) {
        throw new Error('TTS failed');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      const audio = new Audio(audioUrl);
      audioElementRef.current = audio;

      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        setIsSpeaking(false);
        setError('Failed to play audio');
      };

      try {
        await audio.play();
      } catch (playError: any) {
        // Handle autoplay blocking gracefully
        if (playError.name === 'NotAllowedError') {
          setError('🔴 Browser blocked autoplay. Click anywhere on the page first, then try again.');
          console.log('Audio autoplay blocked by browser.');
        } else {
          setError('Failed to play audio');
        }
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      }
    } catch (err: any) {
      console.error('TTS error:', err);
      setError(`🔴 Speech failed: ${err.message || 'Check your OpenAI API key in .env.local'}`);
      setIsSpeaking(false);
    }
  };

  // Stop speaking
  const stopSpeaking = () => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.currentTime = 0;
      setIsSpeaking(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {/* Record button */}
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isTranscribing}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
            isRecording
              ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse'
              : 'bg-indigo-500 text-white hover:bg-indigo-600'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          title={isRecording ? 'Stop recording' : 'Start recording'}
        >
          {isTranscribing ? '⏳' : isRecording ? '⏹' : '🎤'}
          <span>
            {isTranscribing ? 'Transcribing...' : isRecording ? 'Recording...' : 'Record'}
          </span>
        </button>

        {/* Stop speaking button */}
        {isSpeaking && (
          <button
            onClick={stopSpeaking}
            className="px-4 py-2 rounded-lg bg-gray-500 text-white hover:bg-gray-600 font-medium text-sm transition-colors"
            title="Stop speaking"
          >
            🔇 Stop
          </button>
        )}
      </div>

      {/* Transcript preview */}
      {transcript && (
        <div className="text-xs text-gray-600 italic p-2 bg-gray-50 rounded border border-gray-200">
          "{transcript}"
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="text-sm font-medium text-red-600 p-3 bg-red-50 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {/* Info text */}
      <div className="text-xs text-gray-500">
        {isRecording 
          ? 'Recording... Click stop when done' 
          : 'Click Record and speak your question'}
      </div>
    </div>
  );
}

// Export helper function for speaking responses
export async function speakTextOpenAI(text: string, voice: string = 'nova', speed: number = 1.15) {
  try {
    const response = await fetch('/api/voice/speak', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice, speed }),
    });

    if (!response.ok) {
      console.error('TTS failed');
      return false;
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);

    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
    };

    // Try to play, but handle autoplay blocking gracefully
    try {
      await audio.play();
      return true;
    } catch (playError: any) {
      // Silently handle autoplay blocking (browser security policy)
      if (playError.name === 'NotAllowedError') {
        console.log('Audio autoplay blocked by browser. User interaction required first.');
      } else {
        console.error('Audio playback error:', playError);
      }
      URL.revokeObjectURL(audioUrl);
      return false;
    }
  } catch (err) {
    console.error('TTS error:', err);
    return false;
  }
}

