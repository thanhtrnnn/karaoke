import { Link, useLocation } from 'react-router-dom';
import { useUIStore } from '../store/uiStore';

const menuItems = [
  { path: '/', label: 'Lễ tân', icon: 'dashboard' },
  { path: '/booking', label: 'Đặt phòng', icon: 'calendar_month' },
  { path: '/booking-management', label: 'QL Đặt phòng', icon: 'event_note' },
  { path: '/rooms', label: 'Quản lý phòng', icon: 'meeting_room' },
  { path: '/orders', label: 'Gọi món', icon: 'restaurant_menu' },
  { path: '/order-management', label: 'QL Order', icon: 'list_alt' },
  { path: '/menu', label: 'QL Menu', icon: 'menu_book' },
  { path: '/inventory', label: 'Kho', icon: 'inventory_2' },
  { path: '/customers', label: 'Khách hàng', icon: 'people' },
  { path: '/membership', label: 'Hội viên', icon: 'card_membership' },
  { path: '/employees', label: 'Nhân viên', icon: 'badge' },
  { path: '/reports', label: 'Báo cáo', icon: 'analytics' },
  { path: '/settings', label: 'Cài đặt', icon: 'settings' },
];

export default function Sidebar() {
  const location = useLocation();
  const { isSidebarOpen, closeSidebar } = useUIStore();

  return (
    <>
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={closeSidebar}
        />
      )}
      <nav className={`fixed left-0 top-0 h-screen w-64 border-r border-slate-700/50 shadow-sm flex-col bg-slate-950 z-30 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} md:flex`}>
        <div className="p-6 border-b border-slate-700/50 flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-surface-primary flex items-center justify-center mb-3 border border-slate-700/50">
            <span className="material-symbols-outlined text-3xl text-primary-container">mic_external_on</span>
          </div>
          <h1 className="text-xl font-bold tracking-tighter text-[#D4AF37] font-h2 text-center">Famtaoke</h1>
          <p className="text-slate-400 font-label-caps mt-1 tracking-wide uppercase text-xs font-semibold">Karaoke Management</p>
        </div>
        <ul className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={closeSidebar}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors duration-200 ${isActive
                      ? 'text-[#D4AF37] border-r-2 border-[#D4AF37] bg-slate-900/50 font-semibold'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-[#D4AF37]'
                    }`}
                >
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  <span className="font-body-md text-sm">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="p-4 border-t border-slate-700/50 space-y-1">
          <Link to="/profile" onClick={closeSidebar} className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-400 hover:bg-slate-900 hover:text-[#D4AF37] transition-colors">
            <span className="material-symbols-outlined text-[20px]">person</span>
            <span className="font-body-md text-sm">Tài khoản</span>
          </Link>
          <Link to="/login" onClick={closeSidebar} className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-400 hover:bg-slate-900 hover:text-status-occupied transition-colors">
            <span className="material-symbols-outlined text-[20px]">logout</span>
            <span className="font-body-md text-sm">Đăng xuất</span>
          </Link>
        </div>
      </nav>
    </>
  );
}
