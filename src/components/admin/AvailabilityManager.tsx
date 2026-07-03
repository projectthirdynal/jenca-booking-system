'use client';

import { useState } from 'react';
import { Plus, Trash2, CalendarOff, Copy, Check, Loader2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AvailabilitySettings, BlackoutDate } from '@/types';

const DAYS_OF_WEEK = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
];

interface AvailabilityManagerProps {
  initialAvailability: AvailabilitySettings[];
  initialBlackoutDates: BlackoutDate[];
}

export function AvailabilityManager({
  initialAvailability,
  initialBlackoutDates,
}: AvailabilityManagerProps) {
  const [availability, setAvailability] = useState(initialAvailability);
  const [blackoutDates, setBlackoutDates] = useState(initialBlackoutDates);
  const [newBlackoutDate, setNewBlackoutDate] = useState('');
  const [newBlackoutReason, setNewBlackoutReason] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [copying, setCopying] = useState(false);
  const [copied, setCopied] = useState(false);

  const updateAvailability = async (id: string, field: string, value: string | boolean) => {
    const updated = availability.map((a) =>
      a.id === id ? { ...a, [field]: value } : a
    );
    setAvailability(updated);

    setSavingId(id);
    try {
      await fetch(`/api/availability/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      });
      setSavedId(id);
      setTimeout(() => setSavedId(null), 1500);
    } finally {
      setSavingId(null);
    }
  };

  const copyToAllDays = async (sourceId: string) => {
    const source = availability.find((a) => a.id === sourceId);
    if (!source || source.is_closed) return;

    setCopying(true);
    const updates = availability
      .filter((a) => a.id !== sourceId && !a.is_closed)
      .map((a) =>
        fetch(`/api/availability/${a.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ open_time: source.open_time, close_time: source.close_time }),
        })
      );

    await Promise.all(updates);

    setAvailability((prev) =>
      prev.map((a) =>
        a.id !== sourceId && !a.is_closed
          ? { ...a, open_time: source.open_time, close_time: source.close_time }
          : a
      )
    );
    setCopying(false);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const addBlackoutDate = async () => {
    if (!newBlackoutDate) return;

    const response = await fetch('/api/availability/blackout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blocked_date: newBlackoutDate, reason: newBlackoutReason }),
    });

    if (response.ok) {
      const saved = await response.json();
      setBlackoutDates([...blackoutDates, saved].sort((a, b) =>
        a.blocked_date.localeCompare(b.blocked_date)
      ));
      setNewBlackoutDate('');
      setNewBlackoutReason('');
    }
  };

  const removeBlackoutDate = async (id: string) => {
    await fetch(`/api/availability/blackout/${id}`, { method: 'DELETE' });
    setBlackoutDates(blackoutDates.filter((bd) => bd.id !== id));
  };

  return (
    <div className="mt-6 space-y-8">
      {copied && (
        <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 p-3">
          <Check className="h-4 w-4 text-green-600" />
          <p className="text-sm text-green-700">Schedule copied to all open days.</p>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold text-neutral-900">Operating hours</h2>
            <p className="mt-1 text-sm text-neutral-500">
              Set the hours you&apos;re open each day. Toggle &quot;Closed&quot; for days you don&apos;t operate.
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {availability.map((slot) => (
            <div key={slot.id} className="card p-4">
              <div className="flex flex-wrap items-center gap-4">
                <span className="w-28 text-sm font-medium text-neutral-900">
                  {DAYS_OF_WEEK[slot.day_of_week]}
                </span>
                <label className="flex items-center gap-2 text-sm text-neutral-600">
                  <input
                    type="checkbox"
                    checked={slot.is_closed}
                    onChange={(e) => updateAvailability(slot.id, 'is_closed', e.target.checked)}
                    className="h-4 w-4 rounded border-neutral-300 text-brand-600 focus:ring-brand-500"
                  />
                  Closed
                </label>
                {!slot.is_closed && (
                  <>
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={slot.open_time}
                        onChange={(e) => updateAvailability(slot.id, 'open_time', e.target.value)}
                        className="input-field py-1.5"
                      />
                      <span className="text-neutral-400">to</span>
                      <input
                        type="time"
                        value={slot.close_time}
                        onChange={(e) => updateAvailability(slot.id, 'close_time', e.target.value)}
                        className="input-field py-1.5"
                      />
                    </div>
                    <button
                      onClick={() => copyToAllDays(slot.id)}
                      disabled={copying}
                      className="ml-auto flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-brand-600 hover:bg-brand-50 disabled:opacity-50"
                      title="Copy this schedule to all open days"
                    >
                      {copying ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                      Copy to all
                    </button>
                  </>
                )}
                {/* Save indicator */}
                <div className="flex items-center gap-1">
                  {savingId === slot.id && (
                    <span className="flex items-center gap-1 text-xs text-neutral-400">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Saving...
                    </span>
                  )}
                  {savedId === slot.id && (
                    <span className="flex items-center gap-1 text-xs text-green-600">
                      <Check className="h-3 w-3" />
                      Saved
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-display text-lg font-semibold text-neutral-900">Blackout dates</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Block off specific dates when the clinic is closed (holidays, events, etc.).
        </p>

        <div className="mt-4 card p-4">
          <div className="flex flex-wrap items-end gap-3">
            <Input
              label="Date"
              type="date"
              value={newBlackoutDate}
              onChange={(e) => setNewBlackoutDate(e.target.value)}
            />
            <Input
              label="Reason (optional)"
              value={newBlackoutReason}
              onChange={(e) => setNewBlackoutReason(e.target.value)}
              placeholder="e.g. Holiday"
            />
            <Button onClick={addBlackoutDate} disabled={!newBlackoutDate}>
              <Plus className="mr-2 h-4 w-4" />
              Add
            </Button>
          </div>
        </div>

        {blackoutDates.length > 0 ? (
          <div className="mt-4 space-y-2">
            {blackoutDates.map((bd) => (
              <div key={bd.id} className="card p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CalendarOff className="h-5 w-5 text-neutral-400" />
                  <div>
                    <p className="text-sm font-medium text-neutral-900">
                      {new Date(bd.blocked_date + 'T00:00:00').toLocaleDateString('en-PH', {
                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                      })}
                    </p>
                    {bd.reason && <p className="text-xs text-neutral-500">{bd.reason}</p>}
                  </div>
                </div>
                <button
                  onClick={() => removeBlackoutDate(bd.id)}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50"
                  aria-label="Remove blackout date"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 card p-6 text-center">
            <Clock className="mx-auto h-8 w-8 text-neutral-300" />
            <p className="mt-2 text-sm text-neutral-500">No blackout dates. Your clinic is open every non-closed day.</p>
          </div>
        )}
      </div>
    </div>
  );
}
