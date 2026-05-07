import { useState, useEffect } from 'react';

interface TierConfig {
  tierName: string;
  minPoints: number;
  discount: string;
}

interface MembershipStats {
  total: number;
  [tier: string]: number;
}

export default function MembershipPage() {
  const [tiers, setTiers] = useState<TierConfig[]>([]);
  const [stats, setStats] = useState<MembershipStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingTier, setEditingTier] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ minPoints: 0, discount: '' });

  const token = localStorage.getItem('token');

  useEffect(() => {
    Promise.all([
      fetch('/api/membership/tiers', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()),
      fetch('/api/membership/stats', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()),
    ])
      .then(([tiersData, statsData]) => {
        setTiers(tiersData);
        setStats(statsData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  const handleEdit = (tier: TierConfig) => {
    setEditingTier(tier.tierName);
    setEditForm({ minPoints: tier.minPoints, discount: tier.discount });
  };

  const handleSaveRow = (tierName: string) => {
    fetch(`/api/membership/tiers/${encodeURIComponent(tierName)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ tierName, ...editForm }),
    })
      .then(r => r.json())
      .then(updated => {
        setTiers(tiers.map(t => t.tierName === tierName ? updated : t));
        setEditingTier(null);
      })
      .catch(console.error);
  };

  if (loading) {
    return <div className="p-8 text-slate-400">Đang tải dữ liệu hội viên...</div>;
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto w-full space-y-6">
      <h1 className="font-h1 text-white">Quản lý hạng hội viên</h1>
      <div className="bg-surface-container rounded-xl border border-slate-700/50 p-6">
        <h2 className="font-h2 text-white mb-4">Cấu hình hạng thành viên</h2>
        <table className="w-full text-left whitespace-nowrap"><thead><tr className="border-b border-slate-700/50 text-slate-400 font-label-caps"><th className="py-4 px-6">Hạng</th><th className="py-4 px-6">Điểm tối thiểu</th><th className="py-4 px-6">Ưu đãi</th><th className="py-4 px-6">Thao tác</th></tr></thead>
          <tbody className="font-body-md divide-y divide-slate-800/50">
            {tiers.map((t) => (
              <tr key={t.tierName} className="hover:bg-slate-900/30 transition-colors">
                <td className="py-4 px-6 text-white font-medium">{t.tierName}</td>
                <td className="py-4 px-6 text-primary-container">
                  {editingTier === t.tierName ? (
                    <input
                      type="number"
                      value={editForm.minPoints}
                      onChange={e => setEditForm({ ...editForm, minPoints: parseInt(e.target.value) || 0 })}
                      className="bg-surface-secondary border border-border-subtle rounded px-2 py-1 text-white w-24 focus:outline-none focus:border-primary-container"
                    />
                  ) : (
                    t.minPoints.toLocaleString()
                  )}
                </td>
                <td className="py-4 px-6 text-slate-300">
                  {editingTier === t.tierName ? (
                    <input
                      type="text"
                      value={editForm.discount}
                      onChange={e => setEditForm({ ...editForm, discount: e.target.value })}
                      className="bg-surface-secondary border border-border-subtle rounded px-2 py-1 text-white w-48 focus:outline-none focus:border-primary-container"
                    />
                  ) : (
                    t.discount
                  )}
                </td>
                <td className="py-4 px-6">
                  {editingTier === t.tierName ? (
                    <div className="flex gap-2">
                      <button onClick={() => handleSaveRow(t.tierName)} className="text-primary-container hover:text-primary transition-colors font-semibold">Lưu</button>
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
      </div>
      <div className="bg-surface-container rounded-xl border border-slate-700/50 p-6">
        <h2 className="font-h2 text-white mb-4">Thống kê hội viên</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-surface-container-high rounded-lg p-4 border border-slate-700/50 text-center"><p className="font-label-caps text-slate-400 uppercase mb-2">Tổng</p><p className="font-h2 text-white">{stats?.total?.toLocaleString() ?? 0}</p></div>
          {tiers.map(t => (
            <div key={t.tierName} className="bg-surface-container-high rounded-lg p-4 border border-slate-700/50 text-center">
              <p className="font-label-caps text-slate-400 uppercase mb-2">{t.tierName}</p>
              <p className="font-h2 text-primary-container">{(stats?.[t.tierName] ?? 0).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
