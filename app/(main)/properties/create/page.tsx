'use client';

import { useState } from 'react';

export default function CreatePropertyPage() {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [type, setType] = useState('RENT'); // "RENT" or "SALE"
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    const res = await fetch('/api/properties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, location, price, type }),
    });

    setLoading(false);

    if (res.ok) {
      setMessage('Property created successfully!');
      setTitle('');
      setLocation('');
      setPrice('');
      setType('RENT');
    } else {
      const error = await res.json();
      setMessage(error.message || 'Failed to create property.');
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Create New Property</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
        />
        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={e => setLocation(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
        />
        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={e => setPrice(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
        />
        <select
          value={type}
          onChange={e => setType(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
        >
          <option value="RENT">For Rent</option>
          <option value="SALE">For Sale</option>
        </select>
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Create Property'}
        </button>
      </form>
      {message && <p className="mt-4 text-center text-green-700">{message}</p>}
    </div>
  );
}