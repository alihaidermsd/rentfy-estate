"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface BookingListProps {
  userId: string;
}

interface Booking {
  id: string;
  bookingNumber: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  currency: string;
  status: string;
  property: {
    id: string;
    title: string;
    address: string;
    city: string;
    state: string;
    user?: { // Owner
      name: string | null;
      email: string;
      phone: string | null;
    };
    agent?: { // Agent
      user: {
        name: string | null;
        email: string;
        phone: string | null;
      };
    };
  };
}

export default function BookingList({ userId }: BookingListProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<{ name: string | null; email: string; phone: string | null } | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/bookings?userId=${userId}&includeProperty=true&includeUser=true`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to fetch bookings');
        }
        setBookings(data.data);
      } catch (err: any) {
        setError(err.message || 'Error fetching bookings');
        console.error("Error fetching bookings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [userId]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return <Badge variant="default" className="bg-green-100 text-green-800">Confirmed</Badge>;
      case 'PENDING': return <Badge variant="default" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'CANCELLED': return <Badge variant="default" className="bg-red-100 text-red-800">Cancelled</Badge>;
      case 'REJECTED': return <Badge variant="default" className="bg-red-100 text-red-800">Rejected</Badge>;
      default: return <Badge variant="default">{status}</Badge>;
    }
  };

  const handleContactClick = (booking: Booking) => {
    const owner = booking.property.user;
    const agent = booking.property.agent?.user;

    if (owner) {
      setSelectedContact(owner);
    } else if (agent) {
      setSelectedContact(agent);
    } else {
      setSelectedContact(null); // No contact info available
    }
    setContactModalOpen(true);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (bookings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <p>You have no bookings yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Bookings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded-lg shadow-sm">
              <div className="mb-2 md:mb-0">
                <h4 className="font-semibold text-lg">{booking.property.title}</h4>
                <p className="text-sm text-gray-600">{booking.property.address}, {booking.property.city}, {booking.property.state}</p>
                <p className="text-sm text-muted-foreground">Booking ID: {booking.bookingNumber}</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm text-gray-600">
                    {format(new Date(booking.startDate), 'MMM dd, yyyy')} - {format(new Date(booking.endDate), 'MMM dd, yyyy')}
                  </p>
                  {getStatusBadge(booking.status)}
                </div>
              </div>
              <div className="text-left md:text-right flex flex-col md:items-end">
                <p className="font-bold text-xl">{booking.currency} {booking.totalAmount.toLocaleString()}</p>
                <Button variant="outline" size="sm" onClick={() => handleContactClick(booking)} className="mt-2">
                  Contact Host/Agent
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        {/* Contact Modal */}
        <Dialog open={contactModalOpen} onOpenChange={setContactModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Contact Information</DialogTitle>
              <DialogDescription>
                Details for the property host or agent.
              </DialogDescription>
            </DialogHeader>
            {selectedContact ? (
              <div className="space-y-2">
                <p><strong>Name:</strong> {selectedContact.name || 'N/A'}</p>
                <p><strong>Email:</strong> {selectedContact.email || 'N/A'}</p>
                <p><strong>Phone:</strong> {selectedContact.phone || 'N/A'}</p>
              </div>
            ) : (
              <p>No contact information available for this property.</p>
            )}
            <div className="flex justify-end">
              <Button onClick={() => setContactModalOpen(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}