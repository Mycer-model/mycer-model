import { GenerateForm } from '@/components/GenerateForm';
import { getBalance } from '@/lib/data';
export const dynamic = 'force-dynamic';
export default async function Generate() {
  return (<div className="mx-auto max-w-xl space-y-4"><h1 className="text-xl font-bold">Create</h1><GenerateForm credits={await getBalance()} /></div>);
}
