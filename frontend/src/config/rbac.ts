export type Role = 'ADMIN' | 'BRANCH_MANAGER' | 'RECEPTIONIST' | 'SERVICE_STAFF' | 'CLIENT';

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: 'Quản trị viên',
  BRANCH_MANAGER: 'Quản lý chi nhánh',
  RECEPTIONIST: 'Lễ tân',
  SERVICE_STAFF: 'Phục vụ',
  CLIENT: 'Khách hàng',
};

export const ROLE_ROUTES: Record<Role, string[]> = {
  ADMIN: ['*'],
  BRANCH_MANAGER: [
    '/manager', '/reports', '/employees', '/customers', '/membership',
    '/rooms', '/room-session', '/orders', '/order-management',
    '/menu', '/inventory', '/checkout', '/booking-management', '/settings', '/profile',
    '/damage-reports', '/facilities', '/import-receipts', '/providers',
    '/room-types', '/customer-info',
  ],
  RECEPTIONIST: [
    '/', '/booking', '/booking-management', '/rooms', '/room-session',
    '/customers', '/orders', '/checkout', '/profile',
  ],
  SERVICE_STAFF: [
    '/orders', '/order-management', '/menu', '/inventory', '/rooms', '/room-session', '/profile',
  ],
  CLIENT: ['/booking', '/orders', '/profile'],
};

export const ROLE_DEFAULT_ROUTE: Record<Role, string> = {
  ADMIN: '/manager',
  BRANCH_MANAGER: '/manager',
  RECEPTIONIST: '/',
  SERVICE_STAFF: '/order-management',
  CLIENT: '/booking',
};

export function hasRouteAccess(role: Role, pathname: string): boolean {
  const routes = ROLE_ROUTES[role];
  if (!routes) return false;
  if (routes.includes('*')) return true;
  return routes.some(route => pathname === route || pathname.startsWith(route + '/'));
}

export function getUserFromStorage(): { id: string; username: string; email: string; role: Role; token: string } | null {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
