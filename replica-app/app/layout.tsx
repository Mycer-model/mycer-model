import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Nav } from '@/components/Nav';
import { getBalance } from '@/lib/data';
export const metadata: Metadata = { title: 'Replica Studio', description: 'Create video, images and audio from a prompt.' };
export const dynamic = 'force-dynamic';
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const credits = await getBalance();
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen md:grid md:grid-cols-[240px_1fr]">
          <aside className="border-b border-border bg-surface md:border-b-0 md:border-r">
            <div className="flex items-center justify-between px-4 pt-4 md:block">
              <Link href="/" className="text-lg font-bold">Replica Studio</Link>
              <p className="text-xs text-muted md:mt-1" aria-label="Credit balance">{credits} credits left</p>
            </div>
            <Nav />
          </aside>
          <main className="mx-auto w-full max-w-content p-4 md:p-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
