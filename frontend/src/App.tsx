import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ReceptionDashboard from './pages/ReceptionDashboard';
import BookingPage from './pages/BookingPage';
import BookingManagement from './pages/BookingManagement';
import RoomSession from './pages/RoomSession';
import OrderPage from './pages/OrderPage';
import OrderManagement from './pages/OrderManagement';
import RoomManagement from './pages/RoomManagement';
import EmployeeManagement from './pages/EmployeeManagement';
import MenuManagement from './pages/MenuManagement';
import InventoryPage from './pages/InventoryPage';
import CheckoutPage from './pages/CheckoutPage';
import CustomerPage from './pages/CustomerPage';
import MembershipPage from './pages/MembershipPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import ManagerDashboard from './pages/ManagerDashboard';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [pathname]);
  return null;
}

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <span className="material-symbols-outlined text-[80px] text-[#D4AF37] mb-4">sentiment_dissatisfied</span>
      <h1 className="text-4xl font-h1 text-white mb-2">404 - Không tìm thấy trang</h1>
      <p className="text-slate-400 font-body-md mb-8 max-w-md">Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di dời. Vui lòng kiểm tra lại đường dẫn.</p>
      <a href="/" className="px-6 py-3 bg-primary-container text-on-primary-container font-semibold rounded-lg hover:bg-primary-fixed-dim transition-colors">
        Quay lại Trang chủ
      </a>
    </div>
  );
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Auth routes (no sidebar) */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Main app routes (with sidebar) */}
        <Route element={<MainLayout />}>
          {/* Dashboard */}
          <Route path="/" element={<ReceptionDashboard />} />
          <Route path="/manager" element={<ManagerDashboard />} />

          {/* Booking */}
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/booking-management" element={<BookingManagement />} />

          {/* Room */}
          <Route path="/room-session" element={<RoomSession />} />
          <Route path="/rooms" element={<RoomManagement />} />

          {/* Orders */}
          <Route path="/orders" element={<OrderPage />} />
          <Route path="/order-management" element={<OrderManagement />} />

          {/* Menu & Inventory */}
          <Route path="/menu" element={<MenuManagement />} />
          <Route path="/inventory" element={<InventoryPage />} />

          {/* Checkout */}
          <Route path="/checkout" element={<CheckoutPage />} />

          {/* Customer & Membership */}
          <Route path="/customers" element={<CustomerPage />} />
          <Route path="/membership" element={<MembershipPage />} />

          {/* Employees */}
          <Route path="/employees" element={<EmployeeManagement />} />

          {/* Reports */}
          <Route path="/reports" element={<ReportsPage />} />

          {/* Settings & Profile */}
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/profile" element={<ProfilePage />} />

          {/* Fallback 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App;
