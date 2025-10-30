// src/app/api/progress/route.ts
import { NextResponse } from 'next/server';
import { InProgressTask, Task, Decision, TaskStep } from '@/lib/types';

// Mock in-progress tasks - RevOps Bridge Scenario
const inProgressTasks: InProgressTask[] = [
  {
    id: 'progress-1',
    task: {
      id: 'progress-task-1',
      kind: 'DRAFT_SUMMARY',
      title: 'Draft Product Feedback Summary for PM Team',
      ts: Date.now() - 1800000, // 30 min ago
      metadata: { prospects: 27, highARR: true, themes: 3 },
    },
    decision: {
      action: 'SYNTHESIZE_FEEDBACK',
      reason_summary: 'I am synthesizing feedback from 27 high-value prospects. Next, I will package the top 3 requested integrations for next week\'s roadmap sync.',
      confidence: 0.88,
      considered: ['WAIT_FOR_MORE_FEEDBACK', 'ROUTE_TO_CS_TEAM'],
      signals: [
        { key: 'ARR Potential', value: '$840K pipeline', weight: 0.9 },
        { key: 'Feature Requests', value: 'Clustered into 3 themes', weight: 0.85 },
        { key: 'Urgency Score', value: 'High (roadmap sync Tue)', weight: 0.8 },
      ],
    },
    steps: [
      { name: 'Extract key verbatims', completed: true },
      { name: 'Score by ARR potential', completed: true },
      { name: 'Summarize themes for PM deck', completed: false },
    ],
    currentStep: 2,
  },
  {
    id: 'progress-2',
    task: {
      id: 'progress-task-2',
      kind: 'MONITOR_DELIVERY',
      title: 'Monitor Deliverability on New Outreach',
      ts: Date.now() - 3600000, // 1 hour ago
      metadata: { domain: 'lunaris-outreach.io', volume: 450, inboxRate: 98 },
    },
    decision: {
      action: 'EXPAND_SEND_VOLUME',
      reason_summary: 'Deliverability is stable — 98% inbox placement so far. I will expand the volume by 15% after the Product follow-up emails finish.',
      confidence: 0.91,
      considered: ['HOLD_AT_CURRENT', 'SWITCH_TO_PRIMARY_DOMAIN'],
      signals: [
        { key: 'Inbox Placement', value: '98%', weight: 0.95 },
        { key: 'Bounce Rate', value: '1.2%', weight: 0.9 },
        { key: 'Spam Reports', value: '0.03%', weight: 0.85 },
      ],
    },
    steps: [
      { name: 'Warm secondary domain', completed: true },
      { name: 'Run seed inbox test', completed: true },
      { name: 'Adjust send cadence', completed: false },
    ],
    currentStep: 2,
  },
];

export async function GET() {
  return NextResponse.json({ tasks: inProgressTasks });
}
