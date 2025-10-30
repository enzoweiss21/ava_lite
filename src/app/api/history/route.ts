// src/app/api/history/route.ts
import { NextResponse } from 'next/server';
import { CompletedTask, Task, Decision } from '@/lib/types';

// Mock completed tasks history - RevOps Bridge Scenario
const completedTasks: CompletedTask[] = [
  {
    id: 'completed-1',
    task: {
      id: 't1-completed',
      kind: 'ANALYZE_REPLIES',
      title: 'Analyze Lead Replies to Identify Product Gaps',
      ts: Date.now() - 10800000, // 3 hours ago
      metadata: { replies: 1200, negativeReplies: 456, client: 'Lunaris SaaS' },
    },
    decision: {
      action: 'FORWARD_TO_PRODUCT',
      reason_summary: 'I found 120 prospects asking for Salesforce integration. Integration requests were 38% of negative replies — forwarding insights to product team.',
      confidence: 0.86,
      considered: ['WAIT_FOR_MORE_DATA', 'ROUTE_TO_SALES_OPS'],
      signals: [
        { key: 'Reply Sentiment', value: 'Negative (38%)', weight: 0.9 },
        { key: 'Keyword Frequency', value: 'Integrations (120 mentions)', weight: 0.85 },
        { key: 'Deal Stage Correlation', value: 'Lost at Demo (62%)', weight: 0.75 },
      ],
    },
    completedAt: Date.now() - 7200000, // 2 hours ago
  },
  {
    id: 'completed-2',
    task: {
      id: 't2-completed',
      kind: 'RE_ENGAGE',
      title: 'Re-Engage Lost Deals With New Features',
      ts: Date.now() - 21600000, // 6 hours ago
      metadata: { leads: 312, feature: 'Salesforce Integration', tag: 'Missing Feature' },
    },
    decision: {
      action: 'PERSONALIZED_REACTIVATION',
      reason_summary: 'I am re-contacting old leads who wanted integrations we just launched. Generated personalized follow-ups mentioning the new integrations.',
      confidence: 0.82,
      considered: ['GENERIC_ANNOUNCEMENT', 'WAIT_FOR_GA_RELEASE'],
      signals: [
        { key: 'Past Lost Reason', value: 'Missing Feature', weight: 0.9 },
        { key: 'Feature Release Notes', value: 'Salesforce Live', weight: 0.88 },
        { key: 'Email Open History', value: 'Active openers (78%)', weight: 0.7 },
      ],
    },
    completedAt: Date.now() - 14400000, // 4 hours ago
  },
  {
    id: 'completed-3',
    task: {
      id: 't3-completed',
      kind: 'BOOK_MEETING',
      title: 'Book Cross-Team Debrief Meeting',
      ts: Date.now() - 5400000, // 1.5 hours ago
      metadata: { teams: ['RevOps', 'PM', 'Sales'], insights: 27, threshold: 20 },
    },
    decision: {
      action: 'SCHEDULE_SYNC',
      reason_summary: 'I have set up a 30-minute sync so Sales and Product can review the findings. Scheduled RevOps × PM × Sales sync for tomorrow 2 PM.',
      confidence: 0.93,
      considered: ['SEND_EMAIL_SUMMARY', 'WAIT_FOR_MORE_INSIGHTS'],
      signals: [
        { key: 'Insights Flagged', value: '27 high-value', weight: 0.9 },
        { key: 'Threshold Trigger', value: '> 20 insights', weight: 0.85 },
        { key: 'Calendar Availability', value: 'Tomorrow 2 PM', weight: 0.8 },
      ],
    },
    completedAt: Date.now() - 3600000, // 1 hour ago
  },
];

export async function GET() {
  return NextResponse.json({ tasks: completedTasks });
}
