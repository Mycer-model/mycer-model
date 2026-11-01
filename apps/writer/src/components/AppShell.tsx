'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BRAND } from '@/lib/brand';
import { signOut, useDB, usageNow } from '@/lib/store';
import { PLANS } from '@/lib/plans';
import { Skeleton } from './ui';

const NAV = [
  { href: '/documents', label: 'Documents' },
  { href: '/library', label: 'Library' },
  { href: '/pricing', label: 'Plans' },
  { href: '/settings', label: 'Settings' },
];

export function AppShell({ children, wide = false }: { children: React.ReactNode; wide?: boolean }) {
  const db = useDB();
  const path = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  useEffect(() => { if (db && !db.user) router.replace('/login'); }, [db, router]);
  if (!db || !db.user) return <div className="p-8"><Skeleton className="h-8 w-48" /></div>;
  const u = usageNow(db);
  return (
    <div className="min-h-screen md:grid md:grid-cols-[240px_1fr]">
      <header className="flex h-header items-center justify-between border-b border-border bg-surface px-4 md:hidden">
        <strong>{BRAND.name}</strong>
        <button className="rounded-md border border-input px-3 py-1 text-sm" aria-expanded={open} aria-controls="side" onClick={() => setOpen(!open)}>Menu</button>
      </header>
      <aside id="side" className={`${open ? 'block' : 'hidden'} border-r border-border bg-surface p-4 md:block`}>
        <Link href="/documents" className="mb-6 block text-lg font-bold">{BRAND.name}</Link>
        <nav aria-label="Main" className="flex flex-col gap-1">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} onClick={() => setOpen(false)} aria-current={path.startsWith(n.href) ? 'page' : undefined}
              className={`rounded-md px-3 py-2 text-sm ${path.startsWith(n.href) ? 'bg-accent-soft font-semibold text-on-accent-soft' : 'hover:bg-border'}`}>{n.label}</Link>
          ))}
        </nav>
        <div className="mt-8 rounded-md border border-border bg-raised p-3 text-sm">
          <p className="font-semibold">{PLANS[db.plan].label} plan</p>
          <p className="text-muted">{u.limit === Infinity ? 'Unlimited suggestions' : `${u.left} of ${u.limit} suggestions left ${PLANS[db.plan].window === 'day' ? 'today' : 'this month'}`}</p>
        </div>
        <p className="mt-6 truncate text-xs text-muted">{db.user.email}</p>
        <button className="mt-1 text-xs underline" onClick={() => { signOut(); router.replace('/login'); }}>Sign out</button>
      </aside>
      <div className={wide ? '' : 'mx-auto w-full max-w-content p-4 md:p-8'}>{children}</div>
    </div>
  );
}
