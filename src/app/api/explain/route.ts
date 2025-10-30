// src/app/api/explain/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { explainPrompt, followupPrompt } from '@/lib/prompts';
import { Decision, Task } from '@/lib/types';

const useMock = !process.env.OPENAI_API_KEY;

async function llm(prompt: string) {
  if (useMock) {
    return (
      'I paused Sequence A because bounce rate hit 9% over the last 1,000 sends, '
      + 'and seed inboxes flagged deliverability risk. Confidence ~83%. '
      + 'I considered throttling and switching to a warm domain, but pausing avoids further damage. '
      + 'Next, I will warm a secondary domain and re-test on a 50 lead subset.'
    );
  }
  // Minimal OpenAI call (Edge-safe alternative would be fetch to OpenAI REST)
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    }),
  });
  const json = await res.json();
  return json.choices?.[0]?.message?.content || 'Explanation unavailable.';
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { task, decision, followup, history } = body as {
    task?: Task; decision?: Decision; followup?: string; history?: string;
  };

  const prompt = followup
    ? followupPrompt(history || '', followup)
    : explainPrompt(task!, decision!);

  const text = await llm(prompt);
  return NextResponse.json({ text });
}

