import { getBalance, listLedger } from '@/lib/data';
export const dynamic = 'force-dynamic';
const REASON: Record<string, string> = { plan_grant: 'Plan credits', purchase: 'Top-up', generation: 'Creation', refund: 'Returned' };
export default async function Billing() {
  const [balance, ledger] = await Promise.all([getBalance(), listLedger()]);
  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="text-xl font-bold">Plans & credits</h1>
      <p className="rounded-lg border border-border bg-surface p-4 text-sm">You have <strong>{balance}</strong> credits. Plans and top-ups come with the billing milestone.</p>
      <ul className="divide-y divide-border rounded-lg border border-border">
        {ledger.map((r) => (<li key={r.id} className="flex justify-between p-3 text-sm"><span>{REASON[r.reason]}</span><span className={r.delta < 0 ? 'text-danger' : 'text-success'}>{r.delta > 0 ? '+' : ''}{r.delta}</span></li>))}
      </ul>
    </div>
  );
}
