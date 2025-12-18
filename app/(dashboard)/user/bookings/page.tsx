import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import BookingList from '@/components/dashboard/BookingList'; // Assuming this component exists or will be created

export default async function UserBookingsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  // We will fetch bookings in the BookingList component to allow for client-side filtering/pagination
  // or fetch them here and pass as props if the list is purely server-rendered.
  // For now, let's assume BookingList handles its own fetching.

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Bookings</h1>
      <BookingList userId={session.user.id} />
    </div>
  );
}
