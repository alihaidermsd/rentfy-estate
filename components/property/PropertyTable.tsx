"use client";

import { format } from 'date-fns';
import { Button } from '@/components/ui/button';

export default function PropertyTable({ properties, onEdit, onDelete, currentUser }: { properties: any[]; onEdit: (p: any) => void; onDelete: (p: any) => void; currentUser?: any }) {
  const isAdminRole = (role?: string) => role === 'SUPER_ADMIN' || role === 'ADMIN';

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
            <th className="px-6 py-3"></th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {properties.map((p) => (
            <tr key={p.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center gap-3">
                <div className="w-20 h-14 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                  {p.images && p.images.length > 0 ? (
                    <img src={Array.isArray(p.images) ? p.images[0] : String(p.images).split(',')[0]} alt={p.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                  )}
                </div>
                <div className="truncate">{p.title}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{p.address || ''}{p.city ? `, ${p.city}` : ''}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{p.price ? `$${Number(p.price).toLocaleString()}` : p.rentPrice ? `$${Number(p.rentPrice).toLocaleString()}/mo` : '—'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${p.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : p.status === 'SOLD' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {p.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{p.createdAt ? format(new Date(p.createdAt), 'PPP') : '—'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex gap-2 justify-end">
                <>
                  <Button size="sm" variant="outline" onClick={() => onEdit(p)}>Edit</Button>
                  <Button size="sm" variant="destructive" onClick={() => onDelete(p)}>Delete</Button>
                </>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
