import { useState } from 'react';
import { mockCustomers, type Customer } from '../data/mockData';

export default function CustomerPage() {
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(mockCustomers[0] || null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', phone: '', salutation: 'Anh' });

  const filteredCustomers = customers.filter(c => {
    const q = searchQuery.toLowerCase();
    return c.fullName.toLowerCase().includes(q) || c.phone.includes(q);
  });

  const handleAddCustomer = () => {
    if (!formData.fullName || !formData.phone) {
      alert("Vui lòng nhập đầy đủ Họ tên và SĐT!");
      return;
    }
    const newCustomer: Customer = {
      id: `KH${(customers.length + 1).toString().padStart(3, '0')}`,
      salutation: formData.salutation,
      firstName: formData.fullName.split(' ').pop() || '',
      lastName: formData.fullName.split(' ').slice(0, -1).join(' '),
      fullName: formData.fullName,
      phone: formData.phone,
      tier: 'Đồng',
      points: 0
    };
    setCustomers([...customers, newCustomer]);
    setIsModalOpen(false);
    setFormData({ fullName: '', phone: '', salutation: 'Anh' });
  };



  return (
    <div className="p-8 max-w-[1600px] mx-auto w-full space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="font-h1 text-white">Quản lý khách hàng</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary-container text-on-primary-container rounded-lg font-body-md font-semibold hover:bg-primary transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>Thêm KH
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-4 bg-surface-container rounded-xl p-5 border border-slate-700/50">
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
              <th className="py-4 px-6">Mã KH</th><th className="py-4 px-6">Họ tên</th><th className="py-4 px-6">SĐT</th><th className="py-4 px-6">Hạng</th><th className="py-4 px-6">Điểm</th><th className="py-4 px-6">Chi tiết</th>
            </tr>
          </thead>
          <tbody className="font-body-md divide-y divide-slate-800/50">
            {filteredCustomers.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
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
                <td className="py-4 px-6 text-primary-container">{c.points.toLocaleString()}</td>
                <td className="py-4 px-6">
                  <button 
                    onClick={() => setSelectedCustomer(c)}
                    className={`px-3 py-1.5 border rounded-lg transition-colors font-label-caps ${selectedCustomer?.id === c.id ? 'bg-primary-container/20 border-primary-container text-primary-container' : 'bg-surface-secondary border-border-subtle text-slate-300 hover:border-primary-container hover:text-primary-container'}`}
                  >
                    👁 Xem
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Customer Detail */}
      {selectedCustomer && (
        <div className="bg-surface-container rounded-xl border border-slate-700/50 p-6">
          <h2 className="font-h2 text-white mb-4">Chi tiết khách hàng {selectedCustomer.id}</h2>
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
              <p className="font-label-caps text-slate-400 uppercase mb-1">Email</p>
              <p className="text-white font-body-md">chưa cập nhật</p>
            </div>
            <div>
              <p className="font-label-caps text-slate-400 uppercase mb-1">Hạng</p>
              <p className="text-primary-container font-body-md font-semibold">{selectedCustomer.tier} ({selectedCustomer.points.toLocaleString()} điểm)</p>
            </div>
          </div>
          <h3 className="font-label-caps text-slate-400 uppercase mb-3">Lịch sử sử dụng (Gần đây)</h3>
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="border-b border-slate-700/50 text-slate-400 font-label-caps">
                <th className="py-3 px-4">Ngày</th>
                <th className="py-3 px-4">Phòng</th>
                <th className="py-3 px-4">Thời gian</th>
                <th className="py-3 px-4">Tổng tiền</th>
              </tr>
            </thead>
            <tbody className="font-body-md divide-y divide-slate-800/50">
              <tr><td className="py-3 px-4">04/05/2026</td><td className="py-3 px-4">P01</td><td className="py-3 px-4">3h 23p</td><td className="py-3 px-4 text-primary-container">947,500đ</td></tr>
              {selectedCustomer.points > 500 && (
                <tr><td className="py-3 px-4">28/04/2026</td><td className="py-3 px-4">P05</td><td className="py-3 px-4">2h 00p</td><td className="py-3 px-4 text-primary-container">350,000đ</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-container border border-slate-700/50 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-h2 text-white">Thêm Khách Hàng Mới</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
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
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 border border-slate-700/50 text-slate-300 rounded-lg font-body-md hover:bg-surface-secondary transition-colors"
              >
                Hủy
              </button>
              <button 
                onClick={handleAddCustomer}
                className="px-6 py-2.5 bg-primary-container text-on-primary-container rounded-lg font-body-md font-semibold hover:bg-primary transition-colors"
              >
                Lưu Thông Tin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
