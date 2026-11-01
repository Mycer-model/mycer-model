'use client';
import { AppShell } from '@/components/AppShell';
import { Button } from '@/components/ui';
import { PLANS } from '@/lib/plans';
import { setPlan, useDB } from '@/lib/store';
import type { Plan } from '@/lib/types';

// S16 plans. Prices are placeholders; launch pricing is decided in /replica-launch. Checkout comes with the backend.
const PRICE: Record<Plan, string> = { free: '$0', plus: '$12 / month', pro: '$29 / month' };
const fmt = (n: number) => (n === Infinity ? 'Unlimited' : n.toLocaleString());
export default function Pricing() {
  const db = useDB();
  return (
    <AppShell>
      <h1 className="mb-1 text-xl font-bold">Plans</h1>
      <p className="mb-6 text-sm text-muted">Prototype: switching plans here only changes limits locally. No payment is taken.</p>
      <div className="grid gap-4 md:grid-cols-3">
        {(Object.keys(PLANS) as Plan[]).map((p) => (
          <section key={p} className={`flex flex-col gap-3 rounded-lg border bg-raised p-5 ${db?.plan === p ? 'border-accent' : 'border-border'}`} aria-label={PLANS[p].label}>
            <h2 className="text-lg font-semibold">{PLANS[p].label}</h2>
            <p className="text-xl font-bold">{PRICE[p]}</p>
            <ul className="flex-1 text-sm text-muted">
              <li>Suggestions: {fmt(PLANS[p].autocomplete)} per {PLANS[p].window}</li>
              <li>PDF uploads: {fmt(PLANS[p].maxUploads)}</li>
              <li>PDF size: {PLANS[p].maxPdfMb} MB, {PLANS[p].maxPdfPages} pages</li>
              <li>Word export with reference list: {PLANS[p].fullExport ? 'yes' : 'no'}</li>
            </ul>
            <Button variant={db?.plan === p ? 'secondary' : 'primary'} disabled={db?.plan === p} onClick={() => setPlan(p)}>{db?.plan === p ? 'Current plan' : `Use ${PLANS[p].label}`}</Button>
          </section>
        ))}
      </div>
    </AppShell>
  );
}
