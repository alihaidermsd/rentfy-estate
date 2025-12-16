import { redirect } from 'next/navigation';

export default function DashboardOwnerRedirect() {
  redirect('/owner');
}
