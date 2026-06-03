import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../config/constants';
import { getUserFromStorage, ROLE_LABELS, type Role } from '../config/rbac';

/* ─── Data types ─── */
interface Room { id: string; name: string; status: string; capacity?: number; type?: string; }
interface Order { id: string; roomId: string; status: string; createdAt: string; }
interface Booking { id: string; roomId: string; clientName: string; clientPhone: string; date: string; startTime: string; endTime: string; status: string; }
interface Employee { id: string; fullName: string; role: string; }
interface DamageReport { id: string; createdAt: string; }
interface Summary { revenue?: number; rooms?: number; occupiedRooms?: number; orders?: number; employees?: number; clients?: number; products?: number; }

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const user = getUserFromStorage();
  const role: Role = user?.role || 'CLIENT';
  const roleLabel = ROLE_LABELS[role] || role;

  /* ── Shared state ── */
  const [summary, setSummary] = useState<Summary>({});
  const [rooms, setRooms] = useState<Room[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);
  const [damageReports, setDamageReports] = useState<DamageReport[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    const get = async (url: string) => {
      try { const r = await fetch(url, { headers }); return r.ok ? await r.json() : []; }
      catch { return []; }
    };

    const load = async () => {
      try {
        if (role === 'ADMIN') {
          // Admin: full access to all endpoints
          const [s, emps, rms, bks, drs] = await Promise.all([
            get('/api/reports/summary'),
            get('/api/employees'),
            get('/api/rooms'),
            get('/api/bookings'),
            get('/api/damage-reports'),
          ]);
          setSummary(s);
          setEmployees(emps);
          setRooms(rms);
          setBookings(bks);
          setDamageReports(drs);
        } else if (role === 'BRANCH_MANAGER') {
          // Branch Manager: rooms, orders, bookings, damage-reports
          // (employees is ADMIN-only so skip it)
          const [rms, ords, bks, drs] = await Promise.all([
            get('/api/rooms'),
            get('/api/orders'),
            get('/api/bookings'),
            get('/api/damage-reports'),
          ]);
          setRooms(rms);
          setOrders(ords);
          setBookings(bks);
          setDamageReports(drs);
        } else if (role === 'SERVICE_STAFF') {
          const [ords, drs] = await Promise.all([
            get('/api/orders'),
            get('/api/damage-reports'),
          ]);
          setOrders(ords);
          setDamageReports(drs);
        } else if (role === 'RECEPTIONIST') {
          const [rms, pBks, bks] = await Promise.all([
            get('/api/rooms'),
            get('/api/bookings/pending'),
            get('/api/bookings'),
          ]);
          setRooms(rms);
          setPendingBookings(pBks);
          setBookings(bks);
        }
      } catch (e) {
        console.error('Dashboard error:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [role]);

  if (loading) return <div className="p-8 text-slate-400">Đang tải dashboard...</div>;

  /* ── Derived counts ── */
  const roomStats = {
    total: rooms.length,
    available: rooms.filter(r => r.status === 'AVAILABLE').length,
    occupied: rooms.filter(r => r.status === 'OCCUPIED').length,
    reserved: rooms.filter(r => r.status === 'RESERVED').length,
    cleaning: rooms.filter(r => r.status === 'CLEANING').length,
    maintenance: rooms.filter(r => r.status === 'MAINTENANCE').length,
  };

  const orderStats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'PENDING').length,
    preparing: orders.filter(o => o.status === 'PREPARING').length,
    served: orders.filter(o => o.status === 'SERVED').length,
    cancelled: orders.filter(o => o.status === 'CANCELLED').length,
  };

  const bookingStats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'PENDING').length,
    confirmed: bookings.filter(b => b.status === 'CONFIRMED').length,
    checkedIn: bookings.filter(b => b.status === 'CHECKED_IN').length,
    completed: bookings.filter(b => b.status === 'COMPLETED').length,
    cancelled: bookings.filter(b => b.status === 'CANCELLED').length,
  };

  const empByRole = {
    total: employees.length,
    admin: employees.filter(e => e.role === 'ADMIN').length,
    manager: employees.filter(e => e.role === 'BRANCH_MANAGER').length,
    receptionist: employees.filter(e => e.role === 'RECEPTIONIST').length,
    staff: employees.filter(e => e.role === 'SERVICE_STAFF').length,
  };

  const openDamage = damageReports.length;

  /* ── Quick-link tiles used by multiple roles ── */
  const QuickLink = ({ label, icon, path, color }: { label: string; icon: string; path: string; color: string }) => (
    <button onClick={() => navigate(path)} className={`bg-surface-container rounded-xl border border-slate-700/50 p-4 hover:border-${color}/50 transition-colors text-left group`}>
      <span className={`material-symbols-outlined text-${color} group-hover:scale-110 transition-transform`}>{icon}</span>
      <p className="font-body-md text-slate-300 mt-2">{label}</p>
    </button>
  );

  return (
    <div className="p-8 max-w-[1600px] mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-h1 text-white">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">{roleLabel} — {user?.username}</p>
        </div>
        <p className="text-slate-400 font-body-md">{formatDate(new Date())}</p>
      </div>

      {/* ═══════════════════ ADMIN ═══════════════════ */}
      {role === 'ADMIN' && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <KpiCard label="Doanh thu" value={summary.revenue ? `${Number(summary.revenue).toLocaleString()}đ` : '0đ'} icon="payments" color="primary-container" />
            <KpiCard label="Phòng hoạt động" value={`${roomStats.occupied}/${roomStats.total}`} icon="meeting_room" color="status-available" />
            <KpiCard label="Đơn F&B" value={String(orderStats.total)} icon="receipt_long" color="tertiary" />
            <KpiCard label="Nhân viên" value={String(empByRole.total)} icon="groups" color="secondary" />
            <KpiCard label="Khách hàng" value={String(summary.clients || 0)} icon="people" color="primary-container" />
          </div>

          {/* Detailed breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Room status */}
            <SectionCard title="Trạng thái phòng" icon="meeting_room">
              <StatRow label="Trống" value={roomStats.available} color="text-status-available" />
              <StatRow label="Đang hát" value={roomStats.occupied} color="text-status-occupied" />
              <StatRow label="Đã đặt" value={roomStats.reserved} color="text-status-reserved" />
              <StatRow label="Chờ dọn" value={roomStats.cleaning} color="text-status-cleaning" />
              <StatRow label="Bảo trì" value={roomStats.maintenance} color="text-slate-500" />
            </SectionCard>

            {/* Employee breakdown */}
            <SectionCard title="Nhân sự" icon="groups">
              <StatRow label="Admin" value={empByRole.admin} color="text-primary-container" />
              <StatRow label="Quản lý" value={empByRole.manager} color="text-tertiary" />
              <StatRow label="Lễ tân" value={empByRole.receptionist} color="text-status-available" />
              <StatRow label="Phục vụ" value={empByRole.staff} color="text-secondary" />
            </SectionCard>

            {/* Orders & Bookings */}
            <SectionCard title="Đơn hàng & Đặt phòng" icon="receipt_long">
              <StatRow label="Đơn chờ" value={orderStats.pending} color="text-status-reserved" />
              <StatRow label="Đang chuẩn bị" value={orderStats.preparing} color="text-status-occupied" />
              <StatRow label="Đã phục vụ" value={orderStats.served} color="text-status-available" />
              <div className="border-t border-slate-700/50 my-2" />
              <StatRow label="Booking chờ" value={bookingStats.pending} color="text-status-reserved" />
              <StatRow label="Đã check-in" value={bookingStats.checkedIn} color="text-status-occupied" />
            </SectionCard>
          </div>

          {/* Quick links */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickLink label="Quản lý nhân viên" icon="badge" path="/employees" color="secondary" />
            <QuickLink label="Báo cáo chi nhánh" icon="assessment" path="/branch-report" color="tertiary" />
            <QuickLink label="Báo cáo chuỗi" icon="equalizer" path="/chain-report" color="primary-container" />
            <QuickLink label="Quản lý phòng" icon="meeting_room" path="/rooms" color="status-available" />
          </div>
        </>
      )}

      {/* ═══════════════════ BRANCH MANAGER ═══════════════════ */}
      {role === 'BRANCH_MANAGER' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KpiCard label="Phòng trống" value={String(roomStats.available)} icon="meeting_room" color="status-available" />
            <KpiCard label="Đang hát" value={`${roomStats.occupied}/${roomStats.total}`} icon="event_busy" color="status-occupied" />
            <KpiCard label="Đơn F&B" value={String(orderStats.total)} icon="receipt_long" color="tertiary" />
            <KpiCard label="Đặt phòng" value={String(bookingStats.total)} icon="event" color="secondary" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SectionCard title="Phòng" icon="meeting_room">
              <StatRow label="Trống" value={roomStats.available} color="text-status-available" />
              <StatRow label="Đang hát" value={roomStats.occupied} color="text-status-occupied" />
              <StatRow label="Đã đặt" value={roomStats.reserved} color="text-status-reserved" />
              <StatRow label="Chờ dọn" value={roomStats.cleaning} color="text-status-cleaning" />
            </SectionCard>

            <SectionCard title="Đơn hàng F&B" icon="receipt_long">
              <StatRow label="Chờ xử lý" value={orderStats.pending} color="text-status-reserved" />
              <StatRow label="Đang chuẩn bị" value={orderStats.preparing} color="text-status-occupied" />
              <StatRow label="Đã phục vụ" value={orderStats.served} color="text-status-available" />
              <StatRow label="Đã hủy" value={orderStats.cancelled} color="text-slate-500" />
            </SectionCard>

            <SectionCard title="Đặt phòng" icon="event">
              <StatRow label="Chờ xác nhận" value={bookingStats.pending} color="text-status-reserved" />
              <StatRow label="Đã xác nhận" value={bookingStats.confirmed} color="text-status-available" />
              <StatRow label="Đã check-in" value={bookingStats.checkedIn} color="text-status-occupied" />
              <StatRow label="Hoàn thành" value={bookingStats.completed} color="text-primary-container" />
            </SectionCard>
          </div>

          {openDamage > 0 && (
            <div className="bg-status-occupied/10 border border-status-occupied/30 rounded-xl p-4 flex items-center gap-3">
              <span className="material-symbols-outlined text-status-occupied">warning</span>
              <p className="text-status-occupied font-body-md">{openDamage} báo cáo hư hỏng chưa xử lý</p>
              <button onClick={() => navigate('/damage-reports')} className="ml-auto text-status-occupied underline font-body-md">Xem</button>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickLink label="Quản lý phòng" icon="meeting_room" path="/rooms" color="status-available" />
            <QuickLink label="Đơn hàng" icon="receipt_long" path="/order-management" color="tertiary" />
            <QuickLink label="Đặt phòng" icon="event" path="/booking-management" color="status-reserved" />
            <QuickLink label="Khách hàng" icon="people" path="/customers" color="primary-container" />
          </div>
        </>
      )}

      {/* ═══════════════════ SERVICE STAFF ═══════════════════ */}
      {role === 'SERVICE_STAFF' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KpiCard label="Chờ xử lý" value={String(orderStats.pending)} icon="pending_actions" color="status-reserved" />
            <KpiCard label="Đang chuẩn bị" value={String(orderStats.preparing)} icon="skillet" color="status-occupied" />
            <KpiCard label="Đã phục vụ" value={String(orderStats.served)} icon="task_alt" color="status-available" />
            <KpiCard label="Hư hỏng" value={String(openDamage)} icon="report_problem" color="secondary" />
          </div>

          {/* Pending orders list */}
          {orderStats.pending > 0 && (
            <SectionCard title="Đơn chờ xử lý" icon="pending_actions">
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {orders.filter(o => o.status === 'PENDING').slice(0, 8).map(o => (
                  <div key={o.id} className="flex items-center justify-between py-2 px-3 bg-surface-secondary rounded-lg">
                    <div>
                      <span className="text-white font-body-md">Đơn #{o.id.slice(-6)}</span>
                      <span className="text-slate-400 text-sm ml-2">Phòng {o.roomId}</span>
                    </div>
                    <span className="text-status-reserved text-sm">{new Date(o.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {openDamage > 0 && (
            <div className="bg-status-occupied/10 border border-status-occupied/30 rounded-xl p-4 flex items-center gap-3">
              <span className="material-symbols-outlined text-status-occupied">warning</span>
              <p className="text-status-occupied font-body-md">{openDamage} báo cáo hư hỏng cần xử lý</p>
              <button onClick={() => navigate('/damage-reports')} className="ml-auto text-status-occupied underline font-body-md">Xem</button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <QuickLink label="Quản lý đơn hàng" icon="receipt_long" path="/order-management" color="tertiary" />
            <QuickLink label="Báo cáo hư hỏng" icon="report_problem" path="/damage-reports" color="secondary" />
          </div>
        </>
      )}

      {/* ═══════════════════ RECEPTIONIST ═══════════════════ */}
      {role === 'RECEPTIONIST' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KpiCard label="Phòng trống" value={String(roomStats.available)} icon="meeting_room" color="status-available" />
            <KpiCard label="Đang hát" value={String(roomStats.occupied)} icon="event_busy" color="status-occupied" />
            <KpiCard label="Chờ check-in" value={String(pendingBookings.length)} icon="login" color="status-reserved" />
            <KpiCard label="Booking hôm nay" value={String(bookings.length)} icon="event" color="primary-container" />
          </div>

          {/* Pending check-ins */}
          {pendingBookings.length > 0 && (
            <SectionCard title="Chờ check-in" icon="login">
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {pendingBookings.slice(0, 6).map(b => (
                  <div key={b.id} className="flex items-center justify-between py-2 px-3 bg-surface-secondary rounded-lg">
                    <div>
                      <span className="text-white font-body-md">{b.clientName}</span>
                      <span className="text-slate-400 text-sm ml-2">{b.clientPhone}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-status-reserved text-sm">Phòng {b.roomId}</p>
                      <p className="text-slate-500 text-xs">{b.startTime} - {b.endTime}</p>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {/* Room status mini */}
          <SectionCard title="Tổng quan phòng" icon="meeting_room">
            <div className="flex gap-4 flex-wrap">
              <RoomBadge label="Trống" count={roomStats.available} color="bg-status-available" />
              <RoomBadge label="Đang hát" count={roomStats.occupied} color="bg-status-occupied" />
              <RoomBadge label="Đã đặt" count={roomStats.reserved} color="bg-status-reserved" />
              <RoomBadge label="Chờ dọn" count={roomStats.cleaning} color="bg-status-cleaning" />
            </div>
          </SectionCard>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <QuickLink label="Đặt phòng" icon="add_circle" path="/booking" color="status-available" />
            <QuickLink label="Check-in" icon="login" path="/check-in" color="status-reserved" />
            <QuickLink label="Quản lý phòng" icon="meeting_room" path="/rooms" color="primary-container" />
          </div>
        </>
      )}

      {/* ═══════════════════ CLIENT ═══════════════════ */}
      {role === 'CLIENT' && (
        <div className="bg-surface-container rounded-xl border border-slate-700/50 p-8 text-center max-w-lg mx-auto">
          <span className="material-symbols-outlined text-[64px] text-primary-container mb-4">celebration</span>
          <h2 className="font-h2 text-white mb-2">Chào mừng đến với Famtaoke!</h2>
          <p className="text-slate-400 font-body-md mb-6">Đặt phòng hát karaoke và gọi món trực tuyến</p>
          <div className="grid grid-cols-2 gap-3">
            <QuickLink label="Đặt phòng" icon="event" path="/booking" color="status-available" />
            <QuickLink label="Gọi món" icon="room_service" path="/orders" color="tertiary" />
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Sub-components ─── */
function KpiCard({ label, value, icon, color }: { label: string; value: string; icon: string; color: string }) {
  return (
    <div className="bg-surface-container rounded-xl border border-slate-700/50 p-5">
      <div className="flex items-center gap-3 mb-3">
        <span className={`material-symbols-outlined text-${color}`}>{icon}</span>
        <p className="font-label-caps text-slate-400 uppercase">{label}</p>
      </div>
      <p className={`font-h1 text-${color} mb-1`}>{value}</p>
    </div>
  );
}

function SectionCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface-container rounded-xl border border-slate-700/50 p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-slate-400 text-[20px]">{icon}</span>
        <h3 className="font-label-caps text-slate-400 uppercase">{title}</h3>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function StatRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-slate-400 text-sm">{label}</span>
      <span className={`font-semibold ${color}`}>{value}</span>
    </div>
  );
}

function RoomBadge({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`w-3 h-3 rounded-full ${color}`}></span>
      <span className="text-slate-300 text-sm">{label}: <span className="font-semibold text-white">{count}</span></span>
    </div>
  );
}
