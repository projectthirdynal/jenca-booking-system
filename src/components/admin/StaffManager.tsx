'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, X, Loader2, AlertCircle, Search, UserCheck, UserX } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Staff } from '@/types';

interface StaffManagerProps {
  initialStaff: Staff[];
}

const emptyStaff = {
  name: '',
  role: 'Staff',
  phone: '',
  email: '',
  is_active: true,
};

export function StaffManager({ initialStaff }: StaffManagerProps) {
  const [staff, setStaff] = useState(initialStaff);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyStaff);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deactivatingId, setDeactivatingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const startAdd = () => {
    setForm(emptyStaff);
    setEditingId(null);
    setSaveError(null);
    setIsEditing(true);
  };

  const startEdit = (member: Staff) => {
    setForm({
      name: member.name,
      role: member.role,
      phone: member.phone || '',
      email: member.email || '',
      is_active: member.is_active,
    });
    setEditingId(member.id);
    setSaveError(null);
    setIsEditing(true);
  };

  const handleSave = async () => {
    setSaveError(null);

    if (!form.name.trim()) {
      setSaveError('Staff name is required');
      return;
    }

    setIsSaving(true);

    const url = editingId ? `/api/staff/${editingId}` : '/api/staff';
    const method = editingId ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        const saved = await response.json();
        if (editingId) {
          setStaff(staff.map((s) => (s.id === editingId ? saved : s)));
        } else {
          setStaff([saved, ...staff]);
        }
        setIsEditing(false);
      } else {
        const data = await response.json();
        setSaveError(data?.error?.message || 'Failed to save staff member');
      }
    } catch {
      setSaveError('Network error. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    setDeactivatingId(id);
    try {
      const response = await fetch(`/api/staff/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setStaff(staff.map((s) => (s.id === id ? { ...s, is_active: false } : s)));
      }
    } finally {
      setDeactivatingId(null);
    }
  };

  const filtered = staff.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.role.toLowerCase().includes(q) ||
      (s.email || '').toLowerCase().includes(q) ||
      (s.phone || '').includes(q)
    );
  });

  const activeCount = staff.filter((s) => s.is_active).length;

  return (
    <div className="mt-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4 text-sm text-neutral-500">
          <span>{staff.length} total</span>
          <span className="text-green-600">{activeCount} active</span>
          <span className="text-neutral-400">{staff.length - activeCount} inactive</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search staff..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-9 w-full sm:w-48"
            />
          </div>
          <Button onClick={startAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Add staff
          </Button>
        </div>
      </div>

      {isEditing && (
        <div className="mt-4 card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-semibold">
              {editingId ? 'Edit staff member' : 'New staff member'}
            </h3>
            <button onClick={() => setIsEditing(false)} className="p-1 rounded hover:bg-neutral-100">
              <X className="h-5 w-5 text-neutral-500" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Maria Santos"
            />
            <Input
              label="Role"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              placeholder="e.g. Aesthetician"
            />
            <Input
              label="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="e.g. 09171234567"
            />
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="e.g. maria@jenca.com"
            />
            <div>
              <label className="label">Status</label>
              <select
                className="input-field mt-1.5"
                value={form.is_active ? 'active' : 'inactive'}
                onChange={(e) => setForm({ ...form, is_active: e.target.value === 'active' })}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {saveError && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <p className="text-sm text-red-700">{saveError}</p>
            </div>
          )}

          <div className="mt-4 flex gap-3">
            <Button onClick={handleSave} disabled={isSaving || !form.name.trim()}>
              {isSaving ? 'Saving...' : 'Save staff member'}
            </Button>
            <Button variant="secondary" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {filtered.length > 0 ? (
        <div className="mt-4 card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filtered.map((member) => (
                  <tr key={member.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                          {member.name[0]?.toUpperCase()}
                        </span>
                        <span className="text-sm font-medium text-neutral-900">{member.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-600">{member.role}</td>
                    <td className="px-4 py-3 text-sm text-neutral-600">{member.phone || '—'}</td>
                    <td className="px-4 py-3 text-sm text-neutral-600">{member.email || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        member.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-neutral-100 text-neutral-500'
                      }`}>
                        {member.is_active ? <UserCheck className="h-3 w-3" /> : <UserX className="h-3 w-3" />}
                        {member.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => startEdit(member)}
                          className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-brand-600"
                          aria-label="Edit staff"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        {member.is_active && (
                          <button
                            onClick={() => handleDeactivate(member.id)}
                            disabled={deactivatingId === member.id}
                            className="rounded-lg p-1.5 text-neutral-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                            aria-label="Deactivate staff"
                          >
                            {deactivatingId === member.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="mt-4 card p-8 text-center">
          <p className="text-sm text-neutral-500">
            {staff.length === 0 ? 'No staff members yet.' : 'No staff match your search.'}
          </p>
        </div>
      )}
    </div>
  );
}
