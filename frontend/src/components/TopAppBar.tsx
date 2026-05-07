import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useUIStore } from '../store/uiStore';

interface Customer {
  id: string;
  salutation: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  tier: string;
}

export default function TopAppBar() {
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const location = useLocation();

  const [isDark, setIsDark] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/customers', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setCustomers(data.map((c: any) => ({
            id: c.id,
            salutation: c.salutation || '',
            firstName: c.firstName || '',
            lastName: c.lastName || '',
            fullName: c.fullName || `${c.firstName} ${c.lastName}`,
            phone: c.phone,
            tier: c.tier || 'Đồng',
          })));
        }
      } catch (e) {
        // Silently fail - search will just show no results
      }
    };
    fetchCustomers();
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/reports/notifications', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
        }
      } catch (e) {
        // Silently fail
      }
    };
    fetchNotifications();
  }, []);

  const getShiftInfo = () => {
    const h = currentTime.getHours();
    if (h >= 6 && h < 14) return 'Sáng (06:00 - 14:00)';
    if (h >= 14 && h < 18) return 'Chiều (14:00 - 18:00)';
    if (h >= 18 && h < 24) return 'Tối (18:00 - 00:00)';
    return 'Khuya (00:00 - 06:00)';
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  let searchPlaceholder = "Tìm kiếm nhanh...";
  let searchType = "generic";

  if (location.pathname.includes('customer')) {
    searchPlaceholder = "Tìm khách (Tên, SĐT)...";
    searchType = "customer";
  } else if (location.pathname.includes('room')) {
    searchPlaceholder = "Tìm phòng hát...";
  } else if (location.pathname.includes('menu') || location.pathname.includes('inventory') || location.pathname.includes('order')) {
    searchPlaceholder = "Tìm kiếm sản phẩm...";
  }

  const searchResults = (searchQuery.trim() === '' || searchType !== "customer")
    ? []
    : customers.filter(c =>
        c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery)
      );

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <header className="flex justify-between items-center px-4 md:px-8 py-4 w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-700/50 shadow-md sticky top-0 z-50 fade-in duration-300">
      <div className="flex items-center gap-4 md:gap-6">
        <button onClick={toggleSidebar} className="md:hidden text-slate-400 hover:text-[#D4AF37] transition-colors p-2">
          <span className="material-symbols-outlined">menu</span>
        </button>
        <div className="relative w-full max-w-[200px] md:max-w-none md:w-96" ref={searchRef}>
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <input
            className="w-full bg-surface-container border border-slate-700/50 rounded-full py-2 pl-10 pr-10 text-sm text-white focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all placeholder:text-slate-500"
            placeholder={searchPlaceholder}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}

          {isSearchFocused && searchQuery && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-surface-container border border-slate-700/50 rounded-xl shadow-xl overflow-hidden z-50">
              {searchResults.length > 0 ? (
                <ul className="py-2">
                  {searchResults.map(c => (
                    <li key={c.id} className="px-4 py-2 hover:bg-slate-800 cursor-pointer flex justify-between items-center transition-colors">
                      <div>
                        <p className="text-white text-sm font-medium">
                          <span className="text-slate-400 mr-1">{c.salutation}</span>
                          {c.firstName} <span className="text-slate-500 text-xs">({c.lastName})</span>
                        </p>
                        <p className="text-slate-400 text-xs mt-0.5">{c.phone}</p>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-sm uppercase font-semibold ${c.tier === 'Kim cương' ? 'bg-secondary/10 text-secondary' : 'bg-primary-container/10 text-primary-container'}`}>
                        {c.tier}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-4 text-center text-sm text-slate-400">
                  Không tìm thấy "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-4 border-r border-slate-700/50 pr-6">
          <div className="text-right">
            <p className="font-label-caps text-slate-400 uppercase text-xs">Ca làm việc</p>
            <p className="font-body-md font-semibold text-primary-container">{getShiftInfo()}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">

          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="text-slate-400 hover:text-primary-container transition-colors relative group p-1"
              title="Thông báo"
            >
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-1 right-1 w-2 h-2 bg-status-occupied rounded-full border border-slate-950 animate-pulse"></span>
            </button>
            {isNotificationsOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-surface-container border border-slate-700/50 rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in">
                <div className="p-4 border-b border-slate-700/50 flex justify-between items-center">
                  <h3 className="font-h2 text-white text-sm">Thông báo mới</h3>
                  <button onClick={() => alert('Đã đánh dấu tất cả là đã đọc!')} className="text-xs text-primary-container hover:underline focus:outline-none focus:ring-1 focus:ring-primary-container rounded">Đánh dấu đã đọc</button>
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/50 custom-scrollbar">
                  {notifications.length > 0 ? (
                    notifications.map(n => (
                      <button
                        key={n.id}
                        onClick={() => alert(`Thông báo: ${n.title}`)}
                        className="w-full text-left p-4 hover:bg-slate-800/50 cursor-pointer transition-colors flex gap-3 focus:outline-none focus:bg-slate-800"
                      >
                        <div className={`w-2 h-2 mt-1.5 rounded-full ${n.type === 'warning' ? 'bg-status-cleaning' : n.type === 'success' ? 'bg-status-available' : 'bg-status-occupied'}`}></div>
                        <div>
                          <p className="font-body-md text-white text-sm">{n.title}</p>
                          <p className="font-label-caps text-slate-500 text-xs mt-1">{n.time}</p>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-center text-sm text-slate-400">
                      Không có thông báo mới
                    </div>
                  )}
                </div>
                <div className="p-3 text-center border-t border-slate-700/50">
                  <button onClick={() => alert('Chuyển đến trang Tất cả thông báo')} className="w-full text-xs text-slate-400 hover:text-white transition-colors p-2 focus:outline-none focus:bg-slate-800 rounded">Xem tất cả thông báo</button>
                </div>
              </div>
            )}
          </div>

          <button onClick={toggleTheme} className="text-slate-400 hover:text-primary-container transition-colors p-1" title="Đổi giao diện">
            <span className="material-symbols-outlined">{isDark ? 'light_mode' : 'dark_mode'}</span>
          </button>

          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity p-1"
            >
              <img
                alt="Staff Avatar"
                className="w-8 h-8 rounded-full border border-slate-700/50 object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD_UVm-2-g00eqWMhaFzGc1VRy3DuTBMgkVY6LkDDjewYGv5ecWSYp_lYlhn8pG0l-DXbmRTpd654nbx3dq5vaJ4ReX1eMPni87GDLWdTWUMqfMrWsxGUSm66_9_GVVit8i9nnLzTe4o29bTTC4449MFdrmOgKuFDiOb90HIbbMYhow5dpQ9bzmBwpLl-DUcYEOpvpMGc5Cwt2TbKPcn20MCjm9zDv1TsMz9mwoLogKk92vFBu_dlvkjoBXA4KiWwLwZGbTxY2XdA"
              />
              <span className="hidden md:block material-symbols-outlined text-slate-400 text-sm">expand_more</span>
            </button>
            {isProfileOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-surface-container border border-slate-700/50 rounded-xl shadow-2xl z-50 py-2 animate-fade-in">
                <div className="px-4 py-3 border-b border-slate-700/50 mb-2">
                  <p className="font-body-md text-white font-medium">Nguyễn Văn Quản Lý</p>
                  <p className="font-label-caps text-slate-400 text-xs">Admin</p>
                </div>
                <button onClick={() => alert('Mở trang quản lý Tài khoản cá nhân')} className="w-full text-left px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-primary-container transition-colors flex items-center gap-3 focus:outline-none focus:bg-slate-800">
                  <span className="material-symbols-outlined text-[18px]">person</span>
                  Tài khoản của tôi
                </button>
                <button onClick={() => alert('Mở bảng cài đặt hiển thị')} className="w-full text-left px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-primary-container transition-colors flex items-center gap-3 focus:outline-none focus:bg-slate-800">
                  <span className="material-symbols-outlined text-[18px]">settings</span>
                  Cài đặt
                </button>
                <div className="h-px bg-slate-700/50 my-2"></div>
                <button onClick={() => window.location.href = '/login'} className="w-full text-left px-4 py-2 text-status-occupied hover:bg-status-occupied/10 transition-colors flex items-center gap-3 focus:outline-none focus:bg-status-occupied/10">
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
