"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  propertyId: string | null;
  propertyTitle?: string;
};

export default function BookingModal({ open, onOpenChange, propertyId, propertyTitle }: Props) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [guests, setGuests] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyId) return setMessage('No property selected');
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId,
          startDate: new Date(startDate).toISOString(), // Convert to ISO 8601
          endDate: new Date(endDate).toISOString(),     // Convert to ISO 8601
          guests,
          guestName: name || 'Guest',
          guestEmail: email || 'guest@example.com',
          guestPhone: phone
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Booking failed');
      setMessage('Booking created — check bookings list');
      onOpenChange(false);
    } catch (err: any) {
      setMessage(err?.message || 'Booking error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{propertyTitle ? `Book: ${propertyTitle}` : 'Create Booking'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 p-2">
          <div>
            <label className="block text-sm text-gray-700">Start Date</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full p-2 border rounded" required />
          </div>
          <div>
            <label className="block text-sm text-gray-700">End Date</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full p-2 border rounded" required />
          </div>
          <div>
            <label className="block text-sm text-gray-700">Guests</label>
            <input type="number" min={1} value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm text-gray-700">Your Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm text-gray-700">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm text-gray-700">Phone</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full p-2 border rounded" />
          </div>

          {message && <div className="text-sm text-red-600">{message}</div>}

          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={busy}>Cancel</Button>
            <Button type="submit" disabled={busy}>{busy ? 'Booking...' : 'Book Now'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
