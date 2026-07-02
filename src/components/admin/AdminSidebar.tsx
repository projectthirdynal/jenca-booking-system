'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Calendar, Scissors, Clock, FileText, Palette, Image as ImageIcon, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/bookings', label: 'Bookings', icon: Calendar },
  { href: '/admin/services', label: 'Services', icon: Scissors },
  { href: '/admin/availability', label: 'Availability', icon: Clock },
  { href: '/admin/content', label: 'Content', icon: FileText },
  { href: '/admin/branding', label: 'Branding', icon: Palette },
  { href: '/admin/gallery', label: 'Gallery', icon: ImageIcon },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 border-r border-neutral-200 bg-white">
      <div className="flex h-16 items-center border-b border-neutral-200 px-6">
        <span className="font-display text-lg font-semibold text-neutral-900">
          Jenca Admin
        </span>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-neutral-200 p-4">
        <form action="/api/auth/signout" method="post">
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
