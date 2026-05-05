import { useState } from 'react';

export default function MembershipPage() {
  const [tiers, setTiers] = useState([
    { name: 'Đồng', min: 0, discount: 'Giảm 0%' },
    { name: 'Bạc', min: 300, discount: 'Giảm 5%' },
    { name: 'Vàng', min: 1000, discount: 'Giảm 10%' },
    { name: 'Kim cương', min: 5000, discount: 'Giảm 15% + Ưu tiên' },
  ]);

  const [editingTier, setEditingTier] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ min: 0, discount: '' });

  const handleEdit = (tier: any) => {
    setEditingTier(tier.name);
    setEditForm({ min: tier.min, discount: tier.discount });
  };

  const handleSaveRow = (name: string) => {
    setTiers(tiers.map(t => t.name === name ? { ...t, ...editForm } : t));
    setEditingTier(null);
  };

  const handleSaveConfig = () => {
    alert('Đã lưu cấu hình hạng hội viên thành công!');
  };
  return (
    <div className="p-8 max-w-[1600px] mx-auto w-full space-y-6">
      <h1 className="font-h1 text-white">Quản lý hạng hội viên</h1>
      <div className="bg-surface-container rounded-xl border border-slate-700/50 p-6">
        <h2 className="font-h2 text-white mb-4">Cấu hình hạng thành viên</h2>
        <table className="w-full text-left whitespace-nowrap"><thead><tr className="border-b border-slate-700/50 text-slate-400 font-label-caps"><th className="py-4 px-6">Hạng</th><th className="py-4 px-6">Điểm tối thiểu</th><th className="py-4 px-6">Ưu đãi</th><th className="py-4 px-6">Thao tác</th></tr></thead>
          <tbody className="font-body-md divide-y divide-slate-800/50">
            {tiers.map((t) => (
              <tr key={t.name} className="hover:bg-slate-900/30 transition-colors">
                <td className="py-4 px-6 text-white font-medium">{t.name}</td>
                <td className="py-4 px-6 text-primary-container">
                  {editingTier === t.name ? (
                    <input 
                      type="number" 
                      value={editForm.min} 
                      onChange={e => setEditForm({...editForm, min: parseInt(e.target.value) || 0})}
                      className="bg-surface-secondary border border-border-subtle rounded px-2 py-1 text-white w-24 focus:outline-none focus:border-primary-container"
                    />
                  ) : (
                    t.min.toLocaleString()
                  )}
                </td>
                <td className="py-4 px-6 text-slate-300">
                  {editingTier === t.name ? (
                    <input 
                      type="text" 
                      value={editForm.discount} 
                      onChange={e => setEditForm({...editForm, discount: e.target.value})}
                      className="bg-surface-secondary border border-border-subtle rounded px-2 py-1 text-white w-48 focus:outline-none focus:border-primary-container"
                    />
                  ) : (
                    t.discount
                  )}
                </td>
                <td className="py-4 px-6">
                  {editingTier === t.name ? (
                    <div className="flex gap-2">
                      <button onClick={() => handleSaveRow(t.name)} className="text-primary-container hover:text-primary transition-colors font-semibold">Lưu</button>
                      <button onClick={() => setEditingTier(null)} className="text-slate-400 hover:text-slate-300 transition-colors">Hủy</button>
                    </div>
                  ) : (
                    <button onClick={() => handleEdit(t)} className="px-3 py-1.5 bg-surface-secondary border border-border-subtle rounded-lg text-slate-300 hover:border-primary-container hover:text-primary-container transition-colors font-label-caps">Sửa</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={handleSaveConfig} className="mt-6 px-6 py-3 bg-primary-container text-on-primary-container rounded-lg font-body-md font-semibold hover:bg-primary transition-colors">Lưu cấu hình</button>
      </div>
      <div className="bg-surface-container rounded-xl border border-slate-700/50 p-6">
        <h2 className="font-h2 text-white mb-4">Thống kê hội viên</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-surface-container-high rounded-lg p-4 border border-slate-700/50 text-center"><p className="font-label-caps text-slate-400 uppercase mb-2">Tổng</p><p className="font-h2 text-white">1,200</p></div>
          <div className="bg-surface-container-high rounded-lg p-4 border border-slate-700/50 text-center"><p className="font-label-caps text-slate-400 uppercase mb-2">Đồng</p><p className="font-h2 text-slate-400">800</p></div>
          <div className="bg-surface-container-high rounded-lg p-4 border border-slate-700/50 text-center"><p className="font-label-caps text-slate-400 uppercase mb-2">Bạc</p><p className="font-h2 text-tertiary">250</p></div>
          <div className="bg-surface-container-high rounded-lg p-4 border border-slate-700/50 text-center"><p className="font-label-caps text-slate-400 uppercase mb-2">Vàng</p><p className="font-h2 text-primary-container">120</p></div>
          <div className="bg-surface-container-high rounded-lg p-4 border border-slate-700/50 text-center"><p className="font-label-caps text-slate-400 uppercase mb-2">Kim cương</p><p className="font-h2 text-secondary">30</p></div>
        </div>
      </div>
    </div>
  );
}
