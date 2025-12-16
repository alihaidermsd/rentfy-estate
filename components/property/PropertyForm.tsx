"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: any;
  onSuccess?: (data?: any) => void;
};

export default function PropertyForm({ open, onOpenChange, initialData, onSuccess }: Props) {
  const isEdit = !!initialData?.id;
  const [title, setTitle] = useState(initialData?.title || '');
  const [address, setAddress] = useState(initialData?.address || '');
  const [city, setCity] = useState(initialData?.city || '');
  const [state, setState] = useState(initialData?.state || '');
  const [price, setPrice] = useState(initialData?.price ?? initialData?.rentPrice ?? '');
  const [status, setStatus] = useState(initialData?.status || 'PUBLISHED');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  // Sync form fields when opening the dialog for edit or when initialData changes
  useEffect(() => {
    if (open && initialData) {
      setTitle(initialData.title || '');
      setAddress(initialData.address || '');
      setCity(initialData.city || '');
      setState(initialData.state || '');
      setPrice(initialData.price ?? initialData.rentPrice ?? '');
      setStatus(initialData.status || 'PUBLISHED');
      setError(null);
      // populate previews from existing images (comma-separated or array)
      const imgs = initialData.images
        ? Array.isArray(initialData.images)
          ? initialData.images
          : String(initialData.images).split(',').filter(Boolean)
        : [];
      setPreviews(imgs);
    }

    // Reset form when dialog is closed
    if (!open && !initialData) {
      setTitle('');
      setAddress('');
      setCity('');
      setState('');
      setPrice('');
      setStatus('PUBLISHED');
      setError(null);
      setSelectedFiles([]);
      setPreviews([]);
    }
  }, [initialData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload: any = {
        title: title.trim(),
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        status,
      };
      // keep price as number when provided
      if (price !== '') payload.price = Number(price);

      const url = isEdit ? `/api/properties/${initialData.id}` : '/api/properties';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');

      const property = data.data || data;

      // If there are selected files, upload them to the upload endpoint
      if (selectedFiles.length > 0) {
        const uploadedUrls: string[] = [];
        for (const file of selectedFiles) {
          const form = new FormData();
          form.append('file', file);
          form.append('type', 'property');
          form.append('propertyId', property.id);

          const upRes = await fetch('/api/upload', {
            method: 'POST',
            body: form,
          });
          const upData = await upRes.json();
          if (!upRes.ok) {
            console.warn('Image upload failed for', file.name, upData);
            continue;
          }
          if (upData?.data?.publicUrl) uploadedUrls.push(upData.data.publicUrl);
        }

        // If any images were uploaded, update the property images
        if (uploadedUrls.length > 0) {
          // merge with existing previews (which represent existing urls)
          const existingImgs = previews || [];
          const merged = [...existingImgs, ...uploadedUrls];
          await fetch(`/api/properties/${property.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ images: merged }),
          });
        }
      }

      onOpenChange(false);
      if (onSuccess) onSuccess(property);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to save property');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    const limited = files.slice(0, 6);
    setSelectedFiles(limited);
    const urls = limited.map((f) => URL.createObjectURL(f));
    setPreviews((prev) => [...prev.filter(Boolean), ...urls]);
  };

  const removePreview = (index: number) => {
    setPreviews((p) => p.filter((_, i) => i !== index));
    if (index < selectedFiles.length) {
      setSelectedFiles((s) => s.filter((_, i) => i !== index));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Property' : 'Create New Property'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 p-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Property Name</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} required />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">City</label>
              <Input value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">State</label>
              <Input value={state} onChange={(e) => setState(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Price</label>
            <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Images</label>
            <input type="file" accept="image/*" multiple onChange={handleFileChange} className="mt-2" />

            <div className="mt-3 grid grid-cols-3 gap-2">
              {previews.map((src, idx) => (
                <div key={idx} className="border rounded overflow-hidden relative">
                  <img src={src} alt={`preview-${idx}`} className="object-cover w-full h-24" />
                  <button type="button" onClick={() => removePreview(idx)} className="absolute top-1 right-1 bg-white rounded-full p-1 text-xs">✕</button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full p-2 border rounded">
              <option value="PUBLISHED">Available</option>
              <option value="SOLD">Sold</option>
              <option value="RENTED">Rented</option>
              <option value="DRAFT">Draft</option>
            </select>
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : isEdit ? 'Update Property' : 'Create Property'}
            </Button>
          </div>
        </form>

      </DialogContent>
    </Dialog>
  );
}
