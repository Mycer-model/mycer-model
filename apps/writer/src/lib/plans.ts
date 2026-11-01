import type { Plan } from './types';
// Limits mirror architecture.md. Keep them here (config), not scattered in components.
export const PLANS: Record<Plan, {
  label: string; autocomplete: number; window: 'day' | 'month';
  maxPdfMb: number; maxPdfPages: number; maxUploads: number; fullExport: boolean;
}> = {
  free: { label: 'Free', autocomplete: 10, window: 'day', maxPdfMb: 25, maxPdfPages: 150, maxUploads: 10, fullExport: false },
  plus: { label: 'Plus', autocomplete: 5000, window: 'month', maxPdfMb: 100, maxPdfPages: 500, maxUploads: Infinity, fullExport: true },
  pro: { label: 'Pro', autocomplete: Infinity, window: 'month', maxPdfMb: 100, maxPdfPages: 1000, maxUploads: Infinity, fullExport: true },
};
export function usageKey(plan: Plan, now = new Date()): string {
  const iso = now.toISOString(); // UTC on purpose: free quota resets at midnight UTC
  return PLANS[plan].window === 'day' ? iso.slice(0, 10) : iso.slice(0, 7);
}
