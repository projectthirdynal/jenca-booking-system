'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Search, Bell, ChevronDown, User, Settings, LogOut, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminTopbarProps {
  userEmail: string | null;
  failedCount: number;
  breadcrumb: string;
}

export function AdminTopbar({ userEmail, failedCount, breadcrumb }: AdminTopbarProps) {
  const router = useRouter();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/admin/bookings?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-neutral-200 bg-white px-4 sm:px-6">
        {/* Left: mobile toggle + breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 lg:hidden"
            onClick={() => setMobileSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          <nav className="flex items-center gap-2 text-sm">
            <span className="text-neutral-400">Admin</span>
            <span className="text-neutral-300">/</span>
            <span className="font-medium text-neutral-900">{breadcrumb}</span>
          </nav>
        </div>

        {/* Center: search */}
        <form onSubmit={handleSearch} className="hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 rounded-lg border border-neutral-200 bg-neutral-50 py-2 pl-9 pr-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </form>

        {/* Right: notifications + user menu */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative rounded-lg p-2 text-neutral-600 hover:bg-neutral-100"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {failedCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {failedCount > 9 ? '9+' : failedCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-lg border border-neutral-200 bg-white py-2 shadow-lg">
                {failedCount > 0 ? (
                  <>
                    <div className="px-4 py-2 border-b border-neutral-100">
                      <p className="text-sm font-semibold text-neutral-900">Notifications</p>
                    </div>
                    <div className="px-4 py-3 hover:bg-neutral-50">
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-100">
                          <Bell className="h-3 w-3 text-orange-600" />
                        </span>
                        <div>
                          <p className="text-sm text-neutral-900">
                            {failedCount} failed notification{failedCount !== 1 ? 's' : ''}
                          </p>
                          <p className="text-xs text-neutral-500">Review affected bookings and follow up manually.</p>
                        </div>
                      </div>
                    </div>
                    <Link
                      href="/admin/bookings"
                      onClick={() => setNotifOpen(false)}
                      className="block px-4 py-2 text-sm text-brand-600 hover:bg-neutral-50"
                    >
                      View bookings →
                    </Link>
                  </>
                ) : (
                  <div className="px-4 py-6 text-center">
                    <p className="text-sm text-neutral-500">No notifications</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-neutral-100"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white">
                {(userEmail?.[0] || 'A').toUpperCase()}
              </span>
              <ChevronDown className="h-4 w-4 text-neutral-400" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-lg border border-neutral-200 bg-white py-2 shadow-lg">
                <div className="px-4 py-2 border-b border-neutral-100">
                  <p className="text-sm font-medium text-neutral-900">Administrator</p>
                  <p className="truncate text-xs text-neutral-500">{userEmail}</p>
                </div>
                <Link
                  href="/admin/settings"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
                <form action="/api/auth/signout" method="post">
                  <button
                    type="submit"
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64 bg-white shadow-xl">
            <div className="flex h-16 items-center justify-between border-b border-neutral-200 px-6">
              <span className="font-display text-lg font-semibold text-neutral-900">Jenca Admin</span>
              <button onClick={() => setMobileSidebarOpen(false)} className="p-1 rounded hover:bg-neutral-100">
                <X className="h-5 w-5 text-neutral-500" />
              </button>
            </div>
            <MobileNav onNavigate={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}

function MobileNav({ onNavigate }: { onNavigate: () => void }) {
  const pathname = usePathname();
  const items = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/bookings', label: 'Bookings' },
    { href: '/admin/services', label: 'Services' },
    { href: '/admin/staff', label: 'Staff' },
    { href: '/admin/customers', label: 'Customers' },
    { href: '/admin/availability', label: 'Availability' },
    { href: '/admin/content', label: 'Content' },
    { href: '/admin/branding', label: 'Branding' },
    { href: '/admin/gallery', label: 'Gallery' },
    { href: '/admin/settings', label: 'Settings' },
  ];

  return (
    <nav className="space-y-1 p-4">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          className={cn(
            'block rounded-lg px-3 py-2.5 text-sm font-medium',
            pathname === item.href
              ? 'bg-brand-50 text-brand-700'
              : 'text-neutral-600 hover:bg-neutral-50'
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
