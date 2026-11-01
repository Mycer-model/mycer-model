import Link from 'next/link';
import type { Generation } from '@/lib/data';
const LABEL: Record<Generation['status'], string> = { running: 'Working on it', succeeded: 'Ready', failed: 'Failed', cancelled: 'Cancelled' };
export function GenerationCard({ g }: { g: Generation }) {
  return (
    <Link href={`/assets/${g.id}`} className="block overflow-hidden rounded-lg border border-border bg-raised shadow-card hover:border-input">
      <div className="flex aspect-video items-center justify-center bg-media text-on-media">
        {g.status === 'succeeded' && g.outputUrl
          ? <img src={g.outputUrl} alt={g.prompt} className="h-full w-full object-cover" />
          : <span className="text-sm" role="status">{LABEL[g.status]}</span>}
      </div>
      <div className="p-3">
        <p className="line-clamp-2 break-words text-sm">{g.prompt}</p>
        <p className="mt-1 text-xs text-muted">{LABEL[g.status]} · {g.cost} credits</p>
      </div>
    </Link>
  );
}
