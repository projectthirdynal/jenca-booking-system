'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/services', label: 'Services' },
  { href: '/about', label: 'About' },
  { href: '/gallery', label: 'Gallery' },
];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 font-display text-sm font-bold text-white">
            JA
          </span>
          <span className="font-display text-lg font-semibold text-neutral-900">
            Jenca Aesthetics
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'text-sm font-medium transition-colors',
                isActive(link.href)
                  ? 'text-brand-600'
                  : 'text-neutral-600 hover:text-brand-600'
              )}
            >
              {link.label}
            </Link>
          ))}
          <Link href="/book">
            <Button size="sm">
              <Calendar className="mr-1.5 h-4 w-4" />
              Book Now
            </Button>
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 lg:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <nav className="border-t border-neutral-100 bg-white px-4 py-4 lg:hidden">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive(link.href)
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-neutral-600 hover:bg-neutral-50'
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/book" onClick={() => setMobileOpen(false)} className="block pt-2">
              <Button size="md" className="w-full">
                <Calendar className="mr-1.5 h-4 w-4" />
                Book Now
              </Button>
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
