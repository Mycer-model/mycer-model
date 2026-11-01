import { EmptyState } from '@/components/EmptyState';
export default function Login() {
  return (<div className="mx-auto max-w-md space-y-4"><h1 className="text-xl font-bold">Sign in</h1><EmptyState title="Sign-in comes next" body="Accounts arrive with the backend step. For now the studio runs with a demo workspace." href="/" action="Open the demo" /></div>);
}
