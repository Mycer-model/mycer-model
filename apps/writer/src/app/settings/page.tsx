'use client';
import { AppShell } from '@/components/AppShell';
import { Button } from '@/components/ui';
import { setAutocomplete, useDB, usageNow } from '@/lib/store';

// S15 settings (connections, language and privacy come later)
export default function Settings() {
  const db = useDB();
  const u = db ? usageNow(db) : null;
  return (
    <AppShell>
      <h1 className="mb-6 text-xl font-bold">Settings</h1>
      {db && u && (
        <div className="flex max-w-lg flex-col gap-6">
          <label className="flex items-center gap-3"><input type="checkbox" checked={db.autocompleteEnabled} onChange={(e) => setAutocomplete(e.target.checked)} /> Show writing suggestions in every document</label>
          <div>
            <h2 className="font-semibold">Usage</h2>
            <p className="text-sm text-muted">{u.limit === Infinity ? `${u.used} suggestions accepted. No limit on your plan.` : `${u.used} of ${u.limit} suggestions used.`}</p>
            {u.limit !== Infinity && <progress className="mt-1 w-full" max={u.limit} value={u.used} aria-label="Suggestions used" />}
          </div>
          <div>
            <h2 className="font-semibold">Local data</h2>
            <p className="mb-2 text-sm text-muted">Everything in this prototype is stored in your browser.</p>
            <Button variant="danger" onClick={() => { if (confirm('Delete all local data and start over?')) { localStorage.clear(); location.href = '/login'; } }}>Reset local data</Button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
