'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatPHP } from '@/lib/utils';
import { Service } from '@/types';

interface ServicesManagerProps {
  initialServices: Service[];
}

const emptyService = {
  name: '',
  description: '',
  duration_minutes: 30,
  price_php: 0,
  is_active: true,
  image_url: null as string | null,
};

export function ServicesManager({ initialServices }: ServicesManagerProps) {
  const [services, setServices] = useState(initialServices);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyService);
  const [isSaving, setIsSaving] = useState(false);

  const startAdd = () => {
    setForm(emptyService);
    setEditingId(null);
    setIsEditing(true);
  };

  const startEdit = (service: Service) => {
    setForm({
      name: service.name,
      description: service.description || '',
      duration_minutes: service.duration_minutes,
      price_php: service.price_php,
      is_active: service.is_active,
      image_url: service.image_url,
    });
    setEditingId(service.id);
    setIsEditing(true);
  };

  const handleSave = async () => {
    setIsSaving(true);

    const url = editingId ? `/api/services/${editingId}` : '/api/services';
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
          setServices(services.map((s) => (s.id === editingId ? saved : s)));
        } else {
          setServices([saved, ...services]);
        }
        setIsEditing(false);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this service? This cannot be undone.')) return;

    const response = await fetch(`/api/services/${id}`, { method: 'DELETE' });
    if (response.ok) {
      setServices(services.filter((s) => s.id !== id));
    }
  };

  return (
    <div className="mt-6">
      <div className="flex justify-end">
        <Button onClick={startAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add service
        </Button>
      </div>

      {isEditing && (
        <div className="mt-4 card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-semibold">
              {editingId ? 'Edit service' : 'New service'}
            </h3>
            <button onClick={() => setIsEditing(false)} className="p-1 rounded hover:bg-neutral-100">
              <X className="h-5 w-5 text-neutral-500" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Service name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Deep Cleansing Facial"
            />
            <Input
              label="Price (PHP)"
              type="number"
              value={form.price_php}
              onChange={(e) => setForm({ ...form, price_php: parseInt(e.target.value) || 0 })}
            />
            <Input
              label="Duration (minutes)"
              type="number"
              value={form.duration_minutes}
              onChange={(e) => setForm({ ...form, duration_minutes: parseInt(e.target.value) || 30 })}
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
            <div className="sm:col-span-2">
              <label className="label">Description</label>
              <textarea
                className="input-field mt-1.5"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief description of the treatment..."
              />
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <Button onClick={handleSave} disabled={isSaving || !form.name.trim()}>
              {isSaving ? 'Saving...' : 'Save service'}
            </Button>
            <Button variant="secondary" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <div key={service.id} className="card p-5">
            {service.image_url && (
              <div className="mb-3 aspect-[4/3] overflow-hidden rounded-lg bg-neutral-100">
                <img src={service.image_url} alt={service.name} className="h-full w-full object-cover" />
              </div>
            )}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium text-neutral-900">{service.name}</h3>
                <p className="mt-1 text-sm text-neutral-500 line-clamp-2">{service.description}</p>
                <div className="mt-2 flex items-center gap-3 text-sm">
                  <span className="text-neutral-500">{service.duration_minutes} min</span>
                  <span className="font-medium text-brand-700">{formatPHP(service.price_php)}</span>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 border-t border-neutral-100 pt-3">
              <button
                onClick={() => startEdit(service)}
                className="flex items-center gap-1.5 text-sm text-neutral-600 hover:text-brand-600"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </button>
              <button
                onClick={() => handleDelete(service.id)}
                className="flex items-center gap-1.5 text-sm text-neutral-600 hover:text-red-600 ml-auto"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
