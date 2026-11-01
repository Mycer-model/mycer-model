import { notFound } from 'next/navigation';
import { getGeneration } from '@/lib/data';
import { AssetView } from '@/components/AssetView';
export const dynamic = 'force-dynamic';
export default async function AssetPage({ params }: { params: { id: string } }) {
  const g = await getGeneration(params.id);
  if (!g) notFound();
  return (<div className="mx-auto max-w-3xl space-y-4"><h1 className="text-xl font-bold">Your creation</h1><AssetView initial={g} /></div>);
}
