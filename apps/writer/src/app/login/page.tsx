'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { BRAND } from '@/lib/brand';
import { signIn } from '@/lib/store';
import { Button, Field, inputCls } from '@/components/ui';

// S01. Stub: any well-formed email signs in locally. Real auth arrives with /replica-backend.
export default function Login() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 p-4">
      <div>
        <h1 className="text-xl font-bold">{BRAND.name}</h1>
        <p className="text-muted">{BRAND.tagline}</p>
      </div>
      <form noValidate className="flex flex-col gap-4" onSubmit={(e) => {
        e.preventDefault();
        if (!/^\S+@\S+\.\S+$/.test(email)) return setError('Enter an email address like name@example.com.');
        signIn(email); router.replace('/documents');
      }}>
        <Field label="Email" error={error}><input type="email" className={inputCls} value={email} autoComplete="email" onChange={(e) => { setEmail(e.target.value); setError(''); }} /></Field>
        <Button variant="primary" type="submit">Continue</Button>
        <p className="text-xs text-muted">Prototype sign-in: your work stays in this browser.</p>
      </form>
    </main>
  );
}
