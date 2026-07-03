'use client';

import { useState } from 'react';
import { Save, Loader2, AlertCircle, Check, Bell, Clock, Shield } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface SettingsManagerProps {
  initialContent: Record<string, string>;
}

export function SettingsManager({ initialContent }: SettingsManagerProps) {
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState<string | null>(null);
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const updateSetting = async (key: string, value: string) => {
    setSaving(key);
    setError(null);

    try {
      const existingId = content[`${key}_id`];
      const method = existingId ? 'PUT' : 'POST';
      const body = existingId ? { id: existingId, content: value } : { block_key: key, content: value };

      const response = await fetch('/api/content', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data = await response.json();
        setContent((prev) => ({
          ...prev,
          [key]: value,
          [`${key}_id`]: data.id,
        }));
        setSavedKey(key);
        setTimeout(() => setSavedKey(null), 2000);
      } else {
        setError('Failed to save setting');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSaving(null);
    }
  };

  const [clinicName, setClinicName] = useState(content['clinic_name'] || 'Jenca Aesthetics');
  const [clinicAddress, setClinicAddress] = useState(content['contact_address'] || '');
  const [clinicPhone, setClinicPhone] = useState(content['contact_phone'] || '');
  const [clinicEmail, setClinicEmail] = useState(content['contact_email'] || '');
  const [footerText, setFooterText] = useState(content['footer_tagline'] || '');
  const [leadTime, setLeadTime] = useState(content['min_lead_time_hours'] || '2');
  const [emailNotifications, setEmailNotifications] = useState(content['email_notifications_enabled'] !== 'false');
  const [smsNotifications, setSmsNotifications] = useState(content['sms_notifications_enabled'] !== 'false');

  return (
    <div className="mt-6 space-y-8">
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Clinic Profile */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100">
            <Shield className="h-5 w-5 text-brand-600" />
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold text-neutral-900">Clinic Profile</h2>
            <p className="text-sm text-neutral-500">Basic information about your clinic.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Clinic name"
            value={clinicName}
            onChange={(e) => setClinicName(e.target.value)}
          />
          <Input
            label="Contact phone"
            value={clinicPhone}
            onChange={(e) => setClinicPhone(e.target.value)}
            placeholder="e.g. +63 917 123 4567"
          />
          <Input
            label="Contact email"
            type="email"
            value={clinicEmail}
            onChange={(e) => setClinicEmail(e.target.value)}
            placeholder="e.g. hello@jenca.com"
          />
          <Input
            label="Address"
            value={clinicAddress}
            onChange={(e) => setClinicAddress(e.target.value)}
            placeholder="Street, City, Province"
          />
          <div className="sm:col-span-2">
            <Input
              label="Footer tagline"
              value={footerText}
              onChange={(e) => setFooterText(e.target.value)}
              placeholder="Short tagline shown in the footer"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button
            onClick={() => {
              updateSetting('clinic_name', clinicName);
              updateSetting('contact_phone', clinicPhone);
              updateSetting('contact_email', clinicEmail);
              updateSetting('contact_address', clinicAddress);
              updateSetting('footer_tagline', footerText);
            }}
            disabled={saving !== null}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {saving ? 'Saving...' : 'Save profile'}
          </Button>
        </div>
      </div>

      {/* Booking Settings */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
            <Clock className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold text-neutral-900">Booking Rules</h2>
            <p className="text-sm text-neutral-500">Configure how clients can book appointments.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Minimum lead time (hours)"
            type="number"
            value={leadTime}
            onChange={(e) => setLeadTime(e.target.value)}
            hint="How far in advance must clients book?"
          />
        </div>

        <div className="mt-4 flex justify-end">
          <Button onClick={() => updateSetting('min_lead_time_hours', leadTime)} disabled={saving !== null}>
            {saving === 'min_lead_time_hours' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {saving === 'min_lead_time_hours' ? 'Saving...' : 'Save rules'}
          </Button>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
            <Bell className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold text-neutral-900">Notification Preferences</h2>
            <p className="text-sm text-neutral-500">Control which notifications are sent to clients.</p>
          </div>
        </div>

        <div className="space-y-3">
          <label className="flex items-center justify-between rounded-lg border border-neutral-200 p-4 cursor-pointer hover:bg-neutral-50">
            <div>
              <p className="text-sm font-medium text-neutral-900">Email notifications</p>
              <p className="text-xs text-neutral-500">Send booking confirmations, reminders, and cancellations via email.</p>
            </div>
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => {
                setEmailNotifications(e.target.checked);
                updateSetting('email_notifications_enabled', String(e.target.checked));
              }}
              className="h-5 w-5 rounded border-neutral-300 text-brand-600 focus:ring-brand-500"
            />
          </label>

          <label className="flex items-center justify-between rounded-lg border border-neutral-200 p-4 cursor-pointer hover:bg-neutral-50">
            <div>
              <p className="text-sm font-medium text-neutral-900">SMS notifications</p>
              <p className="text-xs text-neutral-500">Send booking confirmations, reminders, and cancellations via SMS.</p>
            </div>
            <input
              type="checkbox"
              checked={smsNotifications}
              onChange={(e) => {
                setSmsNotifications(e.target.checked);
                updateSetting('sms_notifications_enabled', String(e.target.checked));
              }}
              className="h-5 w-5 rounded border-neutral-300 text-brand-600 focus:ring-brand-500"
            />
          </label>
        </div>

        {savedKey && (
          <div className="mt-3 flex items-center gap-2 text-sm text-green-600">
            <Check className="h-4 w-4" />
            Saved successfully
          </div>
        )}
      </div>

      {/* Danger Zone */}
      <div className="card border-red-200 p-6">
        <h2 className="font-display text-lg font-semibold text-red-700">Danger Zone</h2>
        <p className="mt-1 text-sm text-neutral-500">Irreversible actions. Proceed with caution.</p>

        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-neutral-200 p-4">
            <div>
              <p className="text-sm font-medium text-neutral-900">Cancel all future bookings</p>
              <p className="text-xs text-neutral-500">Cancel every confirmed booking. Clients will be notified.</p>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                if (confirm('This will cancel ALL future confirmed bookings and notify all clients. This cannot be undone. Are you absolutely sure?')) {
                  alert('This action requires a dedicated API endpoint. Contact your developer.');
                }
              }}
            >
              Cancel all
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
