// src/lib/demoData.ts
import { Task, Decision, Signal } from './types';

const tasks: Task[] = [
  {
    id: 't1',
    kind: 'ANALYZE_REPLIES',
    title: 'Cluster reply sentiment themes',
    ts: Date.now(),
    metadata: { replies: 1200, campaigns: 12, client: 'Lunaris SaaS' },
  },
  {
    id: 't2',
    kind: 'RE_ENGAGE',
    title: 'Re-contact closed-lost leads with new integrations',
    ts: Date.now(),
    metadata: { leads: 312, feature: 'Salesforce Integration', tag: 'Missing Feature' },
  },
  {
    id: 't3',
    kind: 'MONITOR_DELIVERY',
    title: 'Check deliverability on secondary domain',
    ts: Date.now(),
    metadata: { domain: 'lunaris-outreach.io', inboxRate: 98, volume: 450 },
  },
];

const decisions: Decision[] = [
  {
    action: 'FORWARD_TO_PRODUCT',
    reason_summary: 'Integration requests were 38% of negative replies — forwarding insights to product team.',
    confidence: 0.86,
    considered: ['WAIT_FOR_MORE_DATA', 'ROUTE_TO_SALES_OPS'],
    signals: [
      { key: 'Reply Sentiment', value: 'Negative (38%)', weight: 0.9 },
      { key: 'Keyword Frequency', value: 'Integrations (120 mentions)', weight: 0.85 },
      { key: 'Deal Stage Correlation', value: 'Lost at Demo (62%)', weight: 0.75 },
    ],
  },
  {
    action: 'PERSONALIZED_REACTIVATION',
    reason_summary: 'Re-engaged 312 contacts with new Salesforce integration. Early open rate 32%, expect 5-8% reactivation.',
    confidence: 0.82,
    considered: ['GENERIC_ANNOUNCEMENT', 'WAIT_FOR_GA_RELEASE'],
    signals: [
      { key: 'Past Lost Reason', value: 'Missing Feature', weight: 0.9 },
      { key: 'Feature Release Notes', value: 'Salesforce Live', weight: 0.88 },
      { key: 'Email Open History', value: 'Active openers (78%)', weight: 0.7 },
    ],
  },
  {
    action: 'EXPAND_VOLUME',
    reason_summary: 'Deliverability stable at 98% inbox placement. Increasing volume by 15% for Product follow-up emails.',
    confidence: 0.91,
    considered: ['HOLD_AT_CURRENT', 'SWITCH_TO_PRIMARY_DOMAIN'],
    signals: [
      { key: 'Inbox Placement', value: '98%', weight: 0.95 },
      { key: 'Bounce Rate', value: '1.2%', weight: 0.9 },
      { key: 'Spam Reports', value: '0.03%', weight: 0.85 },
    ],
  },
];

let idx = 0;
export function getSnapshot(): { task: Task; decision: Decision } {
  const i = idx % tasks.length;
  idx++;
  return { task: tasks[i], decision: decisions[i] };
}
