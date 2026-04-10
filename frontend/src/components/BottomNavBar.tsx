import { Link, useLocation } from 'react-router-dom';
import { getUserFromStorage, ROLE_ROUTES } from '../config/rbac';

const allNavItems = [
  { path: '/', label: 'Phòng', icon: 'meeting_room', roles: ['ADMIN', 'BRANCH_MANAGER', 'RECEPTIONIST'] },
  { path: '/rooms', label: 'Phòng', icon: 'meeting_room', roles: ['SERVICE_STAFF'] },
  { path: '/orders', label: 'Gọi món', icon: 'restaurant_menu', roles: ['ADMIN', 'BRANCH_MANAGER', 'RECEPTIONIST', 'SERVICE_STAFF', 'CLIENT'] },
  { path: '/order-management', label: 'QL Order', icon: 'list_alt', roles: ['SERVICE_STAFF'] },
  { path: '/menu', label: 'Menu', icon: 'menu_book', roles: ['SERVICE_STAFF'] },
  { path: '/booking-management', label: 'Đặt phòng', icon: 'assignment', roles: ['ADMIN', 'BRANCH_MANAGER', 'RECEPTIONIST'] },
  { path: '/booking', label: 'Đặt phòng', icon: 'calendar_month', roles: ['CLIENT'] },
  { path: '/profile', label: 'Cá nhân', icon: 'person', roles: ['ADMIN', 'BRANCH_MANAGER', 'RECEPTIONIST', 'SERVICE_STAFF', 'CLIENT'] },
];

export default function BottomNavBar() {
  const location = useLocation();

  const user = getUserFromStorage();
  const role = user?.role;
  const allowedRoutes = role ? ROLE_ROUTES[role] : [];

  const filteredItems = allowedRoutes.length > 0
    ? allNavItems.filter(item =>
        item.roles.includes(role || '') &&
        (allowedRoutes.includes('*') || allowedRoutes.includes(item.path))
      )
    : [];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-16 px-4 pb-safe bg-slate-950 border-t border-slate-700/50 shadow-lg">
      {filteredItems.map(item => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center rounded-xl px-3 py-1 transition-transform active:bg-slate-800 ${
              isActive
                ? 'text-[#D4AF37] bg-[#D4AF37]/10'
                : 'text-slate-500'
            }`}
          >
            <span className="material-symbols-outlined text-[24px] mb-1">{item.icon}</span>
            <span className={`font-label-caps text-[10px] uppercase font-semibold ${isActive ? 'text-[#D4AF37]' : 'text-slate-500'}`}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
