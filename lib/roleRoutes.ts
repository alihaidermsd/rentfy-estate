export const ROLE_DASHBOARD_MAP: Record<string, string> = {
  SUPER_ADMIN: '/dashboard/admin',
  ADMIN: '/dashboard/admin',
  USER: '/dashboard/user',
  OWNER: '/dashboard/owner',
  DEALER: '/dashboard/dealer',
  DEVELOPER: '/dashboard/developer',
  AGENT: '/dashboard/agent',
};

export function getDashboardRouteForRole(role?: string | null) {
  if (!role) return '/login';
  return ROLE_DASHBOARD_MAP[role] ?? '/';
}

export function isRoleAllowedOnPath(role: string | undefined | null, pathname: string) {
  if (!role) return false;
  const normalized = pathname.toLowerCase();

  const roleLower = (role || '').toLowerCase();

  // Accept both /admin/dashboard and /dashboard/admin patterns
  if (normalized.includes('/admin') && roleLower === 'admin') return true;
  if (normalized.includes('/user') && roleLower === 'user') return true;
  if (normalized.includes('/owner') && roleLower === 'owner') return true;
  if (normalized.includes('/dealer') && roleLower === 'dealer') return true;
  if (normalized.includes('/developer') && roleLower === 'developer') return true;
  if (normalized.includes('/agent') && roleLower === 'agent') return true;
  // Super admin can access admin routes
  if (role === 'SUPER_ADMIN' && normalized.includes('/admin')) return true;

  return false;
}

export default ROLE_DASHBOARD_MAP;
