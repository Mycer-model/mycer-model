import type { Metadata } from 'next';
import './globals.css';
import { BRAND } from '@/lib/brand';
import { ToastProvider } from '@/components/Toast';

export const metadata: Metadata = { title: BRAND.name, description: BRAND.tagline };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-canvas text-text antialiased">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
