import { useState, useEffect } from 'react';
import { formatDate } from '../config/constants';
import { getUserFromStorage, ROLE_LABELS } from '../config/rbac';

interface Summary {
  revenue?: number;
  rooms?: number;
  occupiedRooms?: number;
  orders?: number;
  employees?: number;
  clients?: number;
  products?: number;
}

export default function ManagerDashboard() {
  const [summary, setSummary] = useState<Summary>({});
  const [loading, setLoading] = useState(true);
  const user = getUserFromStorage();
  const role = user?.role || 'CLIENT';
  const roleLabel = ROLE_LABELS[role] || role;

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };

    const fetchData = async () => {
      try {
        if (role === 'ADMIN') {
          // Admin: full reports summary
          const res = await fetch('/api/reports/summary', { headers });
          if (res.ok) setSummary(await res.json());
        } else if (role === 'BRANCH_MANAGER') {
          // Branch Manager: rooms + orders count
          const [roomsRes, ordersRes, clientsRes] = await Promise.all([
            fetch('/api/rooms', { headers }),
            fetch('/api/orders', { headers }),
            fetch('/api/clients', { headers }),
          ]);
          const rooms = roomsRes.ok ? await roomsRes.json() : [];
          const orders = ordersRes.ok ? await ordersRes.json() : [];
          const clients = clientsRes.ok ? await clientsRes.json() : [];
          setSummary({
            rooms: rooms.length,
            occupiedRooms: rooms.filter((r: any) => r.status === 'OCCUPIED').length,
            orders: orders.length,
            clients: clients.length,
          });
        } else if (role === 'SERVICE_STAFF') {
          // Service Staff: orders
          const res = await fetch('/api/orders', { headers });
          if (res.ok) {
            const orders = await res.json();
            setSummary({
              orders: orders.length,
            });
          }
        }
      } catch (e) {
        console.error('Dashboard fetch error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [role]);

  if (loading) {
    return <div className="p-8 text-slate-400">Đang tải dashboard...</div>;
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto w-full space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-h1 text-white">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">{roleLabel}</p>
        </div>
        <p className="text-slate-400 font-body-md">{formatDate(new Date())}</p>
      </div>

      {/* KPI Cards — show different cards based on role */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {role === 'ADMIN' && (
          <>
            <KpiCard label="Doanh thu" value={summary.revenue ? `${Number(summary.revenue).toLocaleString()}đ` : '0đ'} icon="payments" color="primary-container" />
            <KpiCard label="Phòng hoạt động" value={`${summary.occupiedRooms || 0}/${summary.rooms || 0}`} icon="meeting_room" color="status-available" />
            <KpiCard label="Đơn F&B" value={String(summary.orders || 0)} icon="receipt_long" color="tertiary" />
            <KpiCard label="Nhân viên" value={String(summary.employees || 0)} icon="groups" color="secondary" />
          </>
        )}
        {role === 'BRANCH_MANAGER' && (
          <>
            <KpiCard label="Phòng hoạt động" value={`${summary.occupiedRooms || 0}/${summary.rooms || 0}`} icon="meeting_room" color="status-available" />
            <KpiCard label="Đơn F&B" value={String(summary.orders || 0)} icon="receipt_long" color="tertiary" />
            <KpiCard label="Khách hàng" value={String(summary.clients || 0)} icon="people" color="primary-container" />
            <KpiCard label="Tổng phòng" value={String(summary.rooms || 0)} icon="hotel" color="secondary" />
          </>
        )}
        {role === 'SERVICE_STAFF' && (
          <>
            <KpiCard label="Đơn hôm nay" value={String(summary.orders || 0)} icon="receipt_long" color="tertiary" />
          </>
        )}
        {role === 'RECEPTIONIST' && (
          <>
            <KpiCard label="Phòng trống" value={String((summary.rooms || 0) - (summary.occupiedRooms || 0))} icon="meeting_room" color="status-available" />
            <KpiCard label="Phòng đang dùng" value={String(summary.occupiedRooms || 0)} icon="event_busy" color="status-occupied" />
          </>
        )}
        {role === 'CLIENT' && (
          <div className="col-span-2 md:col-span-4 bg-surface-container rounded-xl border border-slate-700/50 p-6 text-center">
            <p className="text-slate-400 font-body-md">Chào mừng bạn đến với Famtaoke!</p>
            <p className="text-slate-500 text-sm mt-2">Sử dụng menu bên trái để đặt phòng hoặc gọi món.</p>
          </div>
        )}
      </div>

      {/* Quick actions based on role */}
      {(role === 'ADMIN' || role === 'BRANCH_MANAGER') && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-surface-container rounded-xl border border-slate-700/50 p-5">
            <p className="font-label-caps text-slate-400 uppercase mb-2">Tổng khách hàng</p>
            <p className="font-h1 text-white">{summary.clients || 0}</p>
          </div>
          <div className="bg-surface-container rounded-xl border border-slate-700/50 p-5">
            <p className="font-label-caps text-slate-400 uppercase mb-2">Menu items</p>
            <p className="font-h1 text-white">{summary.products || 0}</p>
          </div>
        </div>
      )}
    </div>
  );
}

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
