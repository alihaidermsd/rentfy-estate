'use client';

import { useProperties } from '@/hooks/useProperties';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { ErrorMessage } from '@/components/shared/ErrorMessage';
import PropertyTable from '@/components/property/PropertyTable';
import PropertyForm from '@/components/property/PropertyForm';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function PropertiesPage() {
  const {
    properties,
    isLoading,
    error,
    filters,
    updateFilters,
    refetch,
    createProperty,
  } = useProperties();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [busy, setBusy] = useState(false);

  // Allow create/edit/delete in development (no role restrictions)
  const currentUser = null;
  const canCreate = true;

  const handleCreateClick = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const handleEdit = (p: any) => {
    setEditing(p);
    setModalOpen(true);
  };

  const handleDelete = async (p: any) => {
    if (!confirm(`Delete property "${p.title}"? This action cannot be undone.`)) return;
    setBusy(true);
    try {
      // Use API mutation to delete and invalidate cache
      const res = await fetch(`/api/properties/${p.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      await refetch();
      alert('Property deleted');
    } catch (err: any) {
      console.error(err);
      alert(err?.message || 'Failed to delete');
    } finally {
      setBusy(false);
    }
  };

  const handleFormSuccess = async () => {
    setModalOpen(false);
    setEditing(null);
    // refetch properties
    await refetch();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">All Properties</h1>
            <p className="text-gray-600">Manage properties — create, update, and delete listings</p>
          </div>
          <div className="flex items-center gap-3">
            {canCreate ? (
              <Button onClick={handleCreateClick}>Create New Property</Button>
            ) : (
              <div className="text-sm text-gray-500">Create access restricted</div>
            )}
          </div>
        </div>

        {/* Filters - keep simple for now */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Property Type</option>
              <option>House</option>
              <option>Apartment</option>
              <option>Villa</option>
              <option>Commercial</option>
            </select>
            <select className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Price Range</option>
              <option>$0 - $100,000</option>
              <option>$100,000 - $300,000</option>
              <option>$300,000 - $500,000</option>
              <option>$500,000+</option>
            </select>
            <select className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Bedrooms</option>
              <option>1</option>
              <option>2</option>
              <option>3</option>
              <option>4+</option>
            </select>
            <button className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 transition font-semibold">
              Apply Filters
            </button>
          </div>
        </div>

        {/* Main content */}
        {isLoading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorMessage message={error.message} />
        ) : (
          <PropertyTable properties={properties} onEdit={handleEdit} onDelete={handleDelete} currentUser={currentUser} />
        )}

        <PropertyForm open={modalOpen} onOpenChange={setModalOpen} initialData={editing || undefined} onSuccess={handleFormSuccess} />
      </div>
    </div>
  );
}