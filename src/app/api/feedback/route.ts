// src/app/api/feedback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Feedback, FeedbackKind } from '@/lib/types';

// In-memory store for demo (in production, this would go to a database)
const feedbackStore: Feedback[] = [];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { taskId, kind, impact } = body as { taskId: string; kind: FeedbackKind; impact?: string };

    if (!taskId || !kind) {
      return NextResponse.json(
        { error: 'taskId and kind are required' },
        { status: 400 }
      );
    }

    // Validate feedback kind
    if (!Object.values(FeedbackKind).includes(kind)) {
      return NextResponse.json(
        { error: 'Invalid feedback kind' },
        { status: 400 }
      );
    }

    const feedback: Feedback = {
      taskId,
      kind,
      impact,
      timestamp: Date.now(),
    };

    feedbackStore.push(feedback);

    // In a real app, you'd:
    // 1. Save to database
    // 2. Trigger analytics event
    // 3. Update Ava's learning model
    // 4. Send notification to team

    return NextResponse.json(
      {
        success: true,
        message: 'Feedback received! Ava is learning from this.',
        feedback,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process feedback' },
      { status: 500 }
    );
  }
}

// Optional: GET endpoint to retrieve feedback stats
export async function GET() {
  const stats = {
    total: feedbackStore.length,
    breakdown: {
      awesome: feedbackStore.filter(f => f.kind === FeedbackKind.AWESOME).length,
      notIdeal: feedbackStore.filter(f => f.kind === FeedbackKind.NOT_IDEAL).length,
      neverDoThis: feedbackStore.filter(f => f.kind === FeedbackKind.NEVER_DO_THIS).length,
    },
    recent: feedbackStore.slice(-10).reverse(),
  };

  return NextResponse.json(stats, { status: 200 });
}

