'use client';
import { forwardRef } from 'react';

type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; size?: 'sm' | 'md'; loading?: boolean };
const V = {
  primary: 'bg-accent text-on-accent hover:bg-accent-hover active:bg-accent-active',
  secondary: 'bg-bg text-text border border-input hover:bg-surface',
  ghost: 'bg-transparent text-text hover:bg-surface',
  danger: 'bg-danger text-bg hover:bg-danger-hover',
};
export const Button = forwardRef<HTMLButtonElement, BtnProps>(function Button({ variant = 'secondary', size = 'md', loading, className = '', children, disabled, ...p }, ref) {
  return (
    <button ref={ref} aria-busy={loading || undefined} disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-md font-semibold text-sm transition-colors ${size === 'sm' ? 'h-8 px-3' : 'h-10 px-4'} ${V[variant]} disabled:bg-disabled-bg disabled:text-disabled-text disabled:cursor-not-allowed ${className}`} {...p}>
      {children}
    </button>
  );
});

export function Field({ label, error, children }: { label: string; error?: string; children: React.ReactElement<any> }) {
  const id = 'f-' + label.toLowerCase().replace(/\W+/g, '-');
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      {React.cloneElement(children, { id, 'aria-invalid': !!error || undefined, 'aria-describedby': error ? id + '-e' : undefined })}
      {error && <p id={id + '-e'} className="text-sm text-danger">{error}</p>}
    </div>
  );
}
import React from 'react';
export const inputCls = 'h-10 w-full rounded-md border border-input bg-bg px-3 text-base text-text placeholder:text-muted';

export function Empty({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border bg-surface p-12 text-center">
      <p className="text-lg font-semibold">{title}</p>
      <p className="max-w-md text-sm text-muted">{body}</p>
      {action}
    </div>
  );
}

export function Dialog({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center bg-overlay p-4" onKeyDown={(e) => e.key === 'Escape' && onClose()}>
      <div role="dialog" aria-modal="true" aria-label={title} className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-lg bg-raised p-6 shadow-pop">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close">Close</Button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Skeleton({ className = '' }: { className?: string }) { return <div className={`animate-pulse rounded-md bg-border ${className}`} aria-hidden="true" />; }
