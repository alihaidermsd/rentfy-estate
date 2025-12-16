import { redirect } from 'next/navigation';

export default function OwnerDashboardAlias() {
  // Redirect legacy/alternate route /owner/dashboard to canonical /owner
  redirect('/owner');
}
