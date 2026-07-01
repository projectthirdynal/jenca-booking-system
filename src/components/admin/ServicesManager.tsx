'use client';

import { useState, useRef } from 'react';
import { Plus, Pencil, Trash2, X, Upload, Loader2, AlertCircle, ImageIcon } from 'lucide-react';
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
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startAdd = () => {
    setForm(emptyService);
    setEditingId(null);
    setSaveError(null);
    setUploadError(null);
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
    setSaveError(null);
    setUploadError(null);
    setIsEditing(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image must be under 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setUploadError('Please upload an image file');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('asset_type', 'services');

      const response = await fetch('/api/media', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const { url } = await response.json();
        setForm({ ...form, image_url: url });
      } else {
        const data = await response.json();
        setUploadError(data?.error?.message || 'Failed to upload image');
      }
    } catch {
      setUploadError('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    setSaveError(null);

    if (!form.name.trim()) {
      setSaveError('Service name is required');
      return;
    }
    if (form.duration_minutes <= 0) {
      setSaveError('Duration must be greater than 0');
      return;
    }
    if (form.price_php < 0) {
      setSaveError('Price cannot be negative');
      return;
    }

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
      } else {
        const data = await response.json();
        setSaveError(data?.error?.message || 'Failed to save service');
      }
    } catch {
      setSaveError('Network error. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteId(id);
    const response = await fetch(`/api/services/${id}`, { method: 'DELETE' });
    if (response.ok) {
      setServices(services.filter((s) => s.id !== id));
    }
    setDeleteId(null);
  };

  const activeCount = services.filter((s) => s.is_active).length;

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-neutral-500">
          <span>{services.length} total</span>
          <span className="text-green-600">{activeCount} active</span>
          <span className="text-neutral-400">{services.length - activeCount} inactive</span>
        </div>
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

            <div className="sm:col-span-2">
              <label className="label">Service image</label>
              <div className="mt-1.5 flex items-center gap-4">
                {form.image_url ? (
                  <div className="relative h-24 w-32 overflow-hidden rounded-lg bg-neutral-100">
                    <img src={form.image_url} alt="Preview" className="h-full w-full object-cover" />
                    <button
                      onClick={() => setForm({ ...form, image_url: null })}
                      className="absolute top-1 right-1 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex h-24 w-32 items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 bg-neutral-50">
                    {isUploading ? (
                      <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
                    ) : (
                      <ImageIcon className="h-6 w-6 text-neutral-300" />
                    )}
                  </div>
                )}
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {isUploading ? 'Uploading...' : 'Upload image'}
                  </Button>
                  {uploadError && (
                    <p className="mt-1 text-xs text-red-600">{uploadError}</p>
                  )}
                </div>
              </div>
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
              {isSaving ? 'Saving...' : 'Save service'}
            </Button>
            <Button variant="secondary" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {services.length === 0 && !isEditing ? (
        <div className="mt-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
            <ImageIcon className="h-8 w-8 text-neutral-300" />
          </div>
          <h3 className="mt-4 font-display text-lg font-semibold text-neutral-900">No services yet</h3>
          <p className="mt-1 text-sm text-neutral-500">
            Get started by adding your first treatment.
          </p>
          <Button onClick={startAdd} className="mt-4">
            <Plus className="mr-2 h-4 w-4" />
            Add your first service
          </Button>
        </div>
      ) : (
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
                <span className={`ml-2 inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                  service.is_active
                    ? 'bg-green-100 text-green-700'
                    : 'bg-neutral-100 text-neutral-500'
                }`}>
                  {service.is_active ? 'Active' : 'Inactive'}
                </span>
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
                  disabled={deleteId === service.id}
                  className="flex items-center gap-1.5 text-sm text-neutral-600 hover:text-red-600 ml-auto disabled:opacity-50"
                >
                  {deleteId === service.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
