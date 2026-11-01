import Link from 'next/link';
import { listGenerations } from '@/lib/data';
import { GenerationCard } from '@/components/GenerationCard';
import { EmptyState } from '@/components/EmptyState';
export const dynamic = 'force-dynamic';
export default async function Home() {
  const items = await listGenerations();
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold">What do you want to make?</h1>
        <Link href="/generate" className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-on-accent hover:bg-accent-hover">New creation</Link>
      </header>
      {items.length === 0
        ? <EmptyState title="Nothing here yet" body="Describe a scene and pick a model. Your results will show up on this page." href="/generate" action="Start creating" />
        : <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{items.map((g) => <li key={g.id}><GenerationCard g={g} /></li>)}</ul>}
    </div>
  );
}
