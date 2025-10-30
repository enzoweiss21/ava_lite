// src/app/api/tasks/route.ts
import { NextResponse } from 'next/server';
import { getSnapshot } from '@/lib/demoData';

export async function GET() {
  // returns a fresh snapshot on each poll (client polls every 3s)
  const snapshot = getSnapshot();
  return NextResponse.json(snapshot, { status: 200 });
}

