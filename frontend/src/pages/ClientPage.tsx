import { useState, useEffect } from 'react';

interface Customer {
  id: string;
  salutation: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  tier: string;
  loyaltyPoints: number;
  accountStatus?: boolean;
}

export default function ClientPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchField, setSearchField] = useState<'all' | 'name' | 'phone' | 'id'>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({ fullName: '', phone: '', salutation: 'Anh' });

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/clients', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const mapped = data.map((c: any) => ({
            id: c.id,
            salutation: c.salutation || '',
            firstName: c.firstName || '',
            lastName: c.lastName || '',
            fullName: c.fullName || `${c.firstName} ${c.lastName}`,
            phone: c.phone,
            tier: c.tier || 'Đồng',
            loyaltyPoints: c.loyaltyPoints || 0,
            accountStatus: c.accountStatus,
          }));
          setCustomers(mapped);
          if (mapped.length > 0) setSelectedCustomer(mapped[0]);
        }
      } catch (e) {
        console.error('Failed to fetch customers:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(c => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    if (searchField === 'name') return c.fullName.toLowerCase().includes(q);
    if (searchField === 'phone') return c.phone.toLowerCase().includes(q);
    if (searchField === 'id') return c.id.toLowerCase().includes(q);
    return c.fullName.toLowerCase().includes(q) || c.phone.toLowerCase().includes(q) || c.id.toLowerCase().includes(q);
  });

  // UC17: Khóa / mở khóa tài khoản khách hàng (toggle)
  const handleToggleLock = async (c: Customer) => {
    const locking = c.accountStatus !== false;
    const action = locking ? 'khóa' : 'mở khóa';
    if (!confirm(`Bạn có chắc muốn ${action} tài khoản ${c.fullName} (${c.id})?`)) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/clients/${c.id}/lock`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const updated = await res.json();
        setCustomers(prev => prev.map(x => x.id === updated.id ? { ...x, accountStatus: updated.accountStatus } : x));
        setSelectedCustomer(prev => prev && prev.id === updated.id ? { ...prev, accountStatus: updated.accountStatus } : prev);
      } else {
        alert(`Không thể ${action} tài khoản. Vui lòng thử lại.`);
      }
    } catch (e) {
      console.error('Failed to toggle lock:', e);
      alert('Lỗi kết nối khi cập nhật trạng thái tài khoản.');
    }
  };

  const handleSaveCustomer = async () => {
    if (!formData.fullName || !formData.phone) {
      alert("Vui lòng nhập đầy đủ Họ tên và SĐT!");
      return;
    }

    const nameParts = formData.fullName.trim().split(' ');
    const firstName = nameParts.pop() || '';
    const lastName = nameParts.join(' ');

    try {
      const token = localStorage.getItem('token');
      const body: Record<string, unknown> = {
        salutation: formData.salutation,
        firstName,
        lastName,
        fullName: formData.fullName,
        phone: formData.phone,
        tier: editingCustomer?.tier || 'Đồng',
        loyaltyPoints: editingCustomer?.loyaltyPoints || 0,
      };

      if (!editingCustomer) {
        body.id = `KH${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
      }

      const url = editingCustomer ? `/api/clients/${editingCustomer.id}` : '/api/clients';
      const method = editingCustomer ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const saved = await res.json();
        if (editingCustomer) {
          setCustomers(customers.map(c => c.id === editingCustomer.id ? { ...c, ...saved, fullName: saved.fullName || formData.fullName } : c));
        } else {
          setCustomers([...customers, {
            id: saved.id,
            salutation: saved.salutation || formData.salutation,
            firstName: saved.firstName || firstName,
            lastName: saved.lastName || lastName,
            fullName: saved.fullName || formData.fullName,
            phone: saved.phone,
            tier: saved.tier || 'Đồng',
            loyaltyPoints: saved.loyaltyPoints || 0,
          }]);
        }
        setIsModalOpen(false);
        setEditingCustomer(null);
        setFormData({ fullName: '', phone: '', salutation: 'Anh' });
      }
    } catch (e) {
      console.error('Failed to save customer:', e);
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa khách hàng này?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/clients/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        setCustomers(customers.filter(c => c.id !== id));
        if (selectedCustomer?.id === id) setSelectedCustomer(null);
      }
    } catch (e) {
      console.error('Failed to delete customer:', e);
    }
  };

  const openEditModal = (c: Customer) => {
    setEditingCustomer(c);
    setFormData({ fullName: c.fullName, phone: c.phone, salutation: c.salutation || 'Anh' });
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingCustomer(null);
    setFormData({ fullName: '', phone: '', salutation: 'Anh' });
    setIsModalOpen(true);
  };

  if (loading) {
    return <div className="p-8 text-slate-400">Đang tải danh sách khách hàng...</div>;
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto w-full space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="font-h1 text-white">Quản lý khách hàng</h1>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary-container text-on-primary-container rounded-lg font-body-md font-semibold hover:bg-primary transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>Thêm KH
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-4 bg-surface-container rounded-xl p-5 border border-slate-700/50">
        <select
          value={searchField}
          onChange={(e) => setSearchField(e.target.value as 'all' | 'name' | 'phone' | 'id')}
          className="bg-surface-secondary border border-slate-700/50 rounded-lg py-2.5 px-3 text-white font-body-md focus:outline-none focus:border-[#D4AF37]"
        >
          <option value="all">Tất cả tiêu chí</option>
          <option value="name">Tên</option>
          <option value="phone">SĐT</option>
          <option value="id">Mã KH</option>
        </select>
        <div className="relative flex-1 min-w-[250px] max-w-[30rem]">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[20px]">search</span>
          <input
            className="w-full bg-surface-secondary border border-slate-700/50 rounded-lg py-2.5 pl-11 pr-10 text-white font-body-md focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] hover:border-slate-500 transition-all placeholder:text-slate-500"
            placeholder="Tìm kiếm SĐT / Tên khách hàng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>
      </div>
      <div className="bg-surface-container rounded-xl border border-slate-700/50 overflow-hidden overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap">
          <thead>
            <tr className="border-b border-slate-700/50 text-slate-400 font-label-caps bg-surface-container-low">
              <th className="py-4 px-6">Mã KH</th><th className="py-4 px-6">Họ tên</th><th className="py-4 px-6">SĐT</th><th className="py-4 px-6">Hạng</th><th className="py-4 px-6">Điểm</th><th className="py-4 px-6">Trạng thái</th><th className="py-4 px-6">Chi tiết</th>
            </tr>
          </thead>
          <tbody className="font-body-md divide-y divide-slate-800/50">
            {filteredCustomers.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  Không tìm thấy khách hàng nào.
                </td>
              </tr>
            )}
            {filteredCustomers.map((c) => (
              <tr key={c.id} className="hover:bg-slate-900/30 transition-colors">
                <td className="py-4 px-6 text-slate-400">{c.id}</td>
                <td className="py-4 px-6 text-white font-medium">
                  <span className="text-slate-400 font-normal mr-1">{c.salutation}</span>
                  {c.firstName} <span className="text-slate-400 text-sm hidden lg:inline">({c.lastName})</span>
                </td>
                <td className="py-4 px-6">{c.phone}</td>
                <td className="py-4 px-6">
                  <span className={`px-2.5 py-1 rounded-md font-label-caps ${c.tier === 'Kim cương' ? 'bg-secondary/10 text-secondary border border-secondary/20' : c.tier === 'Vàng' ? 'bg-primary-container/10 text-primary-container border border-primary-container/20' : 'bg-slate-800 text-slate-400 border border-slate-700/50'}`}>
                    {c.tier}
                  </span>
                </td>
                <td className="py-4 px-6 text-primary-container">{c.loyaltyPoints.toLocaleString()}</td>
                <td className="py-4 px-6">
                  <span className={`px-2.5 py-1 rounded-md font-label-caps ${c.accountStatus !== false ? 'bg-green-900/40 text-green-300 border border-green-700/40' : 'bg-red-900/40 text-red-300 border border-red-700/40'}`}>
                    {c.accountStatus !== false ? 'Hoạt động' : 'Đã khóa'}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedCustomer(c)}
                      className={`px-3 py-1.5 border rounded-lg transition-colors font-label-caps ${selectedCustomer?.id === c.id ? 'bg-primary-container/20 border-primary-container text-primary-container' : 'bg-surface-secondary border-border-subtle text-slate-300 hover:border-primary-container hover:text-primary-container'}`}
                    >
                      Xem
                    </button>
                    <button
                      onClick={() => openEditModal(c)}
                      className="px-3 py-1.5 bg-surface-secondary border border-border-subtle rounded-lg text-slate-300 hover:border-primary-container hover:text-primary-container transition-colors font-label-caps"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleToggleLock(c)}
                      className={`px-3 py-1.5 rounded-lg transition-colors font-label-caps border ${c.accountStatus !== false ? 'bg-amber-900/20 border-amber-700/40 text-amber-300 hover:bg-amber-900/50' : 'bg-green-900/20 border-green-700/40 text-green-300 hover:bg-green-900/50'}`}
                    >
                      {c.accountStatus !== false ? 'Khóa TK' : 'Mở khóa'}
                    </button>
                    <button
                      onClick={() => handleDeleteCustomer(c.id)}
                      className="px-3 py-1.5 bg-status-occupied/10 border border-status-occupied/20 rounded-lg text-status-occupied hover:bg-status-occupied hover:text-white transition-colors font-label-caps"
                    >
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selectedCustomer && (
        <div className="bg-surface-container rounded-xl border border-slate-700/50 p-6">
          <div className="flex items-start justify-between mb-4">
            <h2 className="font-h2 text-white">Chi tiết khách hàng {selectedCustomer.id}</h2>
            <button onClick={() => setSelectedCustomer(null)} className="text-slate-400 hover:text-white text-sm">Đóng</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div>
              <p className="font-label-caps text-slate-400 uppercase mb-1">Họ tên</p>
              <p className="text-white font-body-md">{selectedCustomer.salutation} {selectedCustomer.firstName} <span className="text-slate-400">({selectedCustomer.lastName})</span></p>
            </div>
            <div>
              <p className="font-label-caps text-slate-400 uppercase mb-1">SĐT</p>
              <p className="text-white font-body-md">{selectedCustomer.phone}</p>
            </div>
            <div>
              <p className="font-label-caps text-slate-400 uppercase mb-1">Hạng</p>
              <p className="text-primary-container font-body-md font-semibold">{selectedCustomer.tier} ({selectedCustomer.loyaltyPoints.toLocaleString()} điểm)</p>
            </div>
            <div>
              <p className="font-label-caps text-slate-400 uppercase mb-1">Trạng thái</p>
              <p className={`font-body-md font-semibold ${selectedCustomer.accountStatus !== false ? 'text-green-400' : 'text-red-400'}`}>
                {selectedCustomer.accountStatus !== false ? 'Hoạt động' : 'Đã khóa'}
              </p>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => handleToggleLock(selectedCustomer)}
              className={`px-5 py-2.5 rounded-lg font-body-md font-semibold transition-colors ${selectedCustomer.accountStatus !== false ? 'bg-red-600 text-white hover:bg-red-500' : 'bg-green-600 text-white hover:bg-green-500'}`}
            >
              {selectedCustomer.accountStatus !== false ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
            </button>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-container border border-slate-700/50 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-h2 text-white">{editingCustomer ? 'Cập Nhật Khách Hàng' : 'Thêm Khách Hàng Mới'}</h2>
              <button onClick={() => { setIsModalOpen(false); setEditingCustomer(null); }} className="text-slate-400 hover:text-white transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-slate-400 font-body-md mb-2">Danh xưng</label>
                <select
                  value={formData.salutation}
                  onChange={e => setFormData({...formData, salutation: e.target.value})}
                  className="w-full bg-surface-secondary border border-border-subtle rounded-lg px-4 py-2.5 text-white font-body-md focus:outline-none focus:border-primary-container"
                >
                  <option value="Anh">Anh</option>
                  <option value="Chị">Chị</option>
                  <option value="Cô">Cô</option>
                  <option value="Chú">Chú</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 font-body-md mb-2">Họ & Tên</label>
                <input
                  value={formData.fullName}
                  onChange={e => setFormData({...formData, fullName: e.target.value})}
                  className="w-full bg-surface-secondary border border-border-subtle rounded-lg px-4 py-2.5 text-white font-body-md focus:outline-none focus:border-primary-container"
                  placeholder="VD: Nguyễn Văn A"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-body-md mb-2">Số điện thoại</label>
                <input
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-surface-secondary border border-border-subtle rounded-lg px-4 py-2.5 text-white font-body-md focus:outline-none focus:border-primary-container"
                  placeholder="VD: 0901234567"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setIsModalOpen(false); setEditingCustomer(null); }}
                className="px-6 py-2.5 border border-slate-700/50 text-slate-300 rounded-lg font-body-md hover:bg-surface-secondary transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveCustomer}
                className="px-6 py-2.5 bg-primary-container text-on-primary-container rounded-lg font-body-md font-semibold hover:bg-primary transition-colors"
              >
                {editingCustomer ? 'Cập Nhật' : 'Lưu Thông Tin'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
