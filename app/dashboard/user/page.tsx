import { redirect } from 'next/navigation';

export default function DashboardUserRedirect() {
  // Redirect to the user dashboard under the route-group layout
  redirect('/user');
}
