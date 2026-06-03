import { useState } from 'react';

interface Customer {
  id: string;
  fullName: string;
  phone: string;
  tier: string;
  loyaltyPoints: number;
  joinedAt: string;
  accountStatus?: boolean;
}

interface Invoice {
  id: string;
  roomFee: number;
  serviceFee: number;
  totalAmount: number;
  paidAt: string;
  status: string;
}

export default function CustomerInfoPage() {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoiceLoading, setInvoiceLoading] = useState(false);

  const token = localStorage.getItem('token');
  const headers = { 'Authorization': `Bearer ${token}` };

  const handleSearch = async () => {
    if (!searchKeyword.trim()) return;
    setLoading(true);
    setSearched(true);
    setSelectedCustomer(null);
    setInvoices([]);
    try {
      // Branch-scoping: backend /api/clients hiện chỉ nhận tham số `keyword`
      // (CrudControllers.list(keyword) — Client không gắn chi nhánh), nên giữ
      // nguyên tìm kiếm. Khi backend bổ sung filter theo chi nhánh, thêm
      // &branchId=<storedUser.branchId> cho BRANCH_MANAGER ở đây.
      const res = await fetch(`/api/clients?keyword=${encodeURIComponent(searchKeyword)}`, { headers });
      if (res.ok) setCustomers(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const viewHistory = async (customer: Customer) => {
    setSelectedCustomer(customer);
    setInvoiceLoading(true);
    try {
      const res = await fetch(`/api/room-receipts?clientId=${customer.id}`, { headers });
      if (res.ok) setInvoices(await res.json());
    } catch (e) { console.error(e); }
    finally { setInvoiceLoading(false); }
  };

  // UC17: Khóa / mở khóa tài khoản khách hàng (toggle)
  const toggleLock = async (customer: Customer) => {
    const locking = customer.accountStatus !== false;
    const action = locking ? 'khóa' : 'mở khóa';
    if (!confirm(`Bạn có chắc muốn ${action} tài khoản ${customer.fullName} (${customer.id})?`)) return;
    try {
      const res = await fetch(`/api/clients/${customer.id}/lock`, {
        method: 'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const updated = await res.json();
        setCustomers(prev => prev.map(c => c.id === updated.id ? { ...c, ...updated } : c));
        setSelectedCustomer(prev => prev && prev.id === updated.id ? { ...prev, ...updated } : prev);
      } else {
        alert(`Không thể ${action} tài khoản. Vui lòng thử lại.`);
      }
    } catch (e) { console.error(e); alert('Lỗi kết nối khi cập nhật trạng thái tài khoản.'); }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Thông tin khách hàng chi nhánh</h1>
        <p className="text-slate-400 text-sm mt-1">UC14 — Tra cứu khách hàng và lịch sử sử dụng</p>
      </div>

      {/* UC14: Search panel */}
      <div className="bg-slate-800 rounded-xl p-5 flex gap-3">
        <input type="text" value={searchKeyword} onChange={e => setSearchKeyword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder="Tìm theo tên hoặc SĐT..."
          className="flex-1 bg-slate-700 text-white rounded-lg px-4 py-2 text-sm border border-slate-600 focus:border-[#D4AF37] focus:outline-none"
        />
        <button onClick={handleSearch} disabled={loading}
          className="px-6 py-2 bg-[#D4AF37] text-black rounded-lg font-semibold hover:bg-yellow-400 disabled:opacity-50">
          {loading ? 'Đang tìm...' : 'Tìm kiếm'}
        </button>
      </div>

      {/* Customer list */}
      {customers.length > 0 && (
        <div className="bg-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-700 text-slate-300">
              <tr>
                <th className="px-4 py-3 text-left">Mã KH</th>
                <th className="px-4 py-3 text-left">Họ tên</th>
                <th className="px-4 py-3 text-left">SĐT</th>
                <th className="px-4 py-3 text-left">Hạng</th>
                <th className="px-4 py-3 text-right">Điểm</th>
                <th className="px-4 py-3 text-center">Trạng thái</th>
                <th className="px-4 py-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(c => (
                <tr key={c.id} className={`border-t border-slate-700 hover:bg-slate-750 ${selectedCustomer?.id === c.id ? 'bg-slate-750' : ''}`}>
                  <td className="px-4 py-3 text-slate-400 font-mono">{c.id}</td>
                  <td className="px-4 py-3 text-white font-medium">{c.fullName}</td>
                  <td className="px-4 py-3 text-slate-300">{c.phone}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded-full text-xs bg-[#D4AF37]/20 text-[#D4AF37]">{c.tier}</span>
                  </td>
                  <td className="px-4 py-3 text-right text-[#D4AF37]">{c.loyaltyPoints}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs ${c.accountStatus !== false ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                      {c.accountStatus !== false ? 'Hoạt động' : 'Đã khóa'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => viewHistory(c)}
                        className="px-3 py-1 bg-slate-700 text-slate-300 rounded-lg text-xs hover:bg-slate-600">
                        Xem lịch sử
                      </button>
                      <button onClick={() => toggleLock(c)}
                        className={`px-3 py-1 rounded-lg text-xs ${c.accountStatus !== false ? 'bg-red-900/40 text-red-300 hover:bg-red-900/70' : 'bg-green-900/40 text-green-300 hover:bg-green-900/70'}`}>
                        {c.accountStatus !== false ? 'Khóa TK' : 'Mở khóa'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {searched && !loading && customers.length === 0 && (
        <div className="text-center py-12 text-slate-500">Không có kết quả cho "{searchKeyword}"</div>
      )}

      {/* UC14: Customer history panel */}
      {selectedCustomer && (
        <div className="bg-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Lịch sử — {selectedCustomer.fullName}</h2>
            <button onClick={() => { setSelectedCustomer(null); setInvoices([]); }}
              className="text-slate-400 hover:text-white text-sm">Đóng</button>
          </div>
          <div className="flex flex-wrap gap-6 text-sm">
            <span className="text-slate-400">Mã KH: <span className="text-white">{selectedCustomer.id}</span></span>
            <span className="text-slate-400">SĐT: <span className="text-white">{selectedCustomer.phone}</span></span>
            <span className="text-slate-400">Hạng: <span className="text-[#D4AF37]">{selectedCustomer.tier}</span></span>
            <span className="text-slate-400">Điểm: <span className="text-[#D4AF37]">{selectedCustomer.loyaltyPoints}</span></span>
            <span className="text-slate-400">Trạng thái: <span className={selectedCustomer.accountStatus !== false ? 'text-green-400' : 'text-red-400'}>{selectedCustomer.accountStatus !== false ? 'Hoạt động' : 'Đã khóa'}</span></span>
          </div>

          {invoiceLoading ? (
            <div className="py-4 text-slate-400">Đang tải lịch sử...</div>
          ) : invoices.length > 0 ? (
            <table className="w-full text-sm mt-3">
              <thead className="bg-slate-700 text-slate-300">
                <tr>
                  <th className="px-4 py-2 text-left">Mã HĐ</th>
                  <th className="px-4 py-2 text-right">Tiền phòng</th>
                  <th className="px-4 py-2 text-right">Tiền DV</th>
                  <th className="px-4 py-2 text-right">Tổng</th>
                  <th className="px-4 py-2 text-left">Ngày thanh toán</th>
                  <th className="px-4 py-2 text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(inv => (
                  <tr key={inv.id} className="border-t border-slate-700">
                    <td className="px-4 py-2 text-slate-300 font-mono">{inv.id}</td>
                    <td className="px-4 py-2 text-right text-slate-300">{inv.roomFee?.toLocaleString()}đ</td>
                    <td className="px-4 py-2 text-right text-slate-300">{inv.serviceFee?.toLocaleString()}đ</td>
                    <td className="px-4 py-2 text-right text-[#D4AF37] font-semibold">{inv.totalAmount?.toLocaleString()}đ</td>
                    <td className="px-4 py-2 text-slate-300">{inv.paidAt ? new Date(inv.paidAt).toLocaleDateString('vi-VN') : '—'}</td>
                    <td className="px-4 py-2 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs ${inv.status === 'PAID' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'}`}>
                        {inv.status === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-4 text-slate-500">Khách hàng chưa có hóa đơn nào.</div>
          )}

          <div className="flex justify-end gap-3 pt-2 border-t border-slate-700">
            <button onClick={() => { setSelectedCustomer(null); setInvoices([]); }}
              className="px-5 py-2 rounded-lg border border-slate-600 text-slate-300 text-sm hover:bg-slate-700">
              Đóng
            </button>
            <button onClick={() => toggleLock(selectedCustomer)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold ${selectedCustomer.accountStatus !== false ? 'bg-red-600 text-white hover:bg-red-500' : 'bg-green-600 text-white hover:bg-green-500'}`}>
              {selectedCustomer.accountStatus !== false ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
