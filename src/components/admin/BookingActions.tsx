'use client';

import { useState } from 'react';
import { CheckCircle2, XCircle, UserX, Loader2, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BookingActionsProps {
  bookingId: string;
  currentStatus: string;
  onStatusChange: (bookingId: string, newStatus: string) => void;
}

export function BookingActions({ bookingId, currentStatus, onStatusChange }: BookingActionsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setMenuOpen(false);
    if (newStatus === currentStatus) return;

    if (newStatus === 'cancelled' && !confirm('Cancel this booking? The client will be notified.')) {
      return;
    }

    setLoading(newStatus);
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        onStatusChange(bookingId, newStatus);
      }
    } catch {
      // Error handling — could add toast
    } finally {
      setLoading(null);
    }
  };

  const actions = [
    { status: 'completed', label: 'Mark completed', icon: CheckCircle2, color: 'text-blue-600' },
    { status: 'no_show', label: 'Mark no-show', icon: UserX, color: 'text-orange-600' },
    { status: 'cancelled', label: 'Cancel booking', icon: XCircle, color: 'text-red-600' },
  ].filter((a) => a.status !== currentStatus);

  if (actions.length === 0) {
    return <span className="text-xs text-neutral-400">—</span>;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700"
        aria-label="Booking actions"
        disabled={loading !== null}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <MoreVertical className="h-4 w-4" />
        )}
      </button>

      {menuOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
          <div className="absolute right-0 z-20 mt-1 w-48 rounded-lg border border-neutral-200 bg-white py-1 shadow-lg">
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.status}
                  onClick={() => handleStatusChange(action.status)}
                  className={cn(
                    'flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-neutral-50',
                    action.color
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {action.label}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
