'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
const ITEMS = [
  { href: '/', label: 'Home' }, { href: '/generate', label: 'Create' }, { href: '/projects', label: 'Projects' },
  { href: '/brand-kits', label: 'Brand kits' }, { href: '/team', label: 'Team' }, { href: '/developers', label: 'Developers' }, { href: '/billing', label: 'Plans & credits' },
];
export function Nav() {
  const path = usePathname();
  return (
    <nav aria-label="Main" className="flex gap-1 overflow-x-auto p-2 md:flex-col md:p-3">
      {ITEMS.map((i) => {
        const active = i.href === '/' ? path === '/' : path.startsWith(i.href);
        return (
          <Link key={i.href} href={i.href} aria-current={active ? 'page' : undefined}
            className={`whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ${active ? 'bg-accent text-on-accent' : 'text-muted hover:bg-surface hover:text-text'}`}>
            {i.label}
          </Link>
        );
      })}
    </nav>
  );
}
