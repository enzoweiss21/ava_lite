// src/app/api/voice/speak/route.ts
import { NextRequest, NextResponse } from 'next/server';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(req: NextRequest) {
  try {
    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured. Voice synthesis unavailable.' },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { text, voice = 'alloy', speed = 1.15 } = body;

    if (!text) {
      return NextResponse.json(
        { error: 'No text provided' },
        { status: 400 }
      );
    }

    // Validate voice option
    const validVoices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
    const selectedVoice = validVoices.includes(voice) ? voice : 'alloy';

    // Validate speed (OpenAI supports 0.25 - 4.0)
    const selectedSpeed = Math.max(0.25, Math.min(4.0, speed));

    // Call OpenAI TTS API
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1', // Use tts-1-hd for higher quality (2x cost)
        input: text,
        voice: selectedVoice,
        response_format: 'mp3',
        speed: selectedSpeed, // Faster speech (default 1.4)
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('TTS API error:', error);
      return NextResponse.json(
        { error: 'Failed to generate speech' },
        { status: response.status }
      );
    }

    // Get audio data as buffer
    const audioBuffer = await response.arrayBuffer();

    // Return audio file
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
      },
    });

  } catch (error) {
    console.error('TTS error:', error);
    return NextResponse.json(
      { error: 'Internal server error during speech synthesis' },
      { status: 500 }
    );
  }
}

