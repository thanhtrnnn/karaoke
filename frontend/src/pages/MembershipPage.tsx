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

  // UC18: Manual tier upgrade state
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [newTier, setNewTier] = useState('');
  const [upgrading, setUpgrading] = useState(false);
  const [upgradeMsg, setUpgradeMsg] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
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
  }, []);

  const handleEdit = (tier: TierConfig) => {
    setEditingTier(tier.tierName);
    setEditForm({ minPoints: tier.minPoints, discount: tier.discount });
  };

  const handleSaveRow = (tierName: string) => {
    const token = localStorage.getItem('token');
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

  // UC18: Search customer for manual tier change
  const handleSearch = async () => {
    if (!searchKeyword.trim()) return;
    setSearching(true);
    setSelectedClient(null);
    setSearchResults([]);
    setUpgradeMsg('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/clients?keyword=${encodeURIComponent(searchKeyword)}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) setSearchResults(await res.json());
    } catch (e) { console.error(e); }
    finally { setSearching(false); }
  };

  const selectClient = (c: any) => {
    setSelectedClient(c);
    setNewTier(c.tier || '');
    setUpgradeMsg('');
  };

  const handleUpgrade = async () => {
    if (!selectedClient || !newTier) return;
    setUpgrading(true);
    setUpgradeMsg('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/membership/clients/${selectedClient.id}/tier`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ tierName: newTier }),
      });
      if (res.ok) {
        const updated = await res.json();
        setUpgradeMsg(`✅ Đã đổi hạng ${updated.fullName} → ${newTier}`);
        setSelectedClient(updated);
        setSearchResults(prev => prev.map(c => c.id === updated.id ? updated : c));
      } else {
        const err = await res.json().catch(() => ({}));
        setUpgradeMsg(`❌ ${err.message || 'Lỗi khi đổi hạng'}`);
      }
    } catch (e) { setUpgradeMsg('❌ Lỗi kết nối'); }
    finally { setUpgrading(false); }
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

      {/* UC18: Manual tier upgrade */}
      <div className="bg-surface-container rounded-xl border border-slate-700/50 p-6">
        <h2 className="font-h2 text-white mb-4">Thay đổi hạng thủ công</h2>
        <p className="text-slate-400 text-sm mb-4">Tìm khách hàng và đổi hạng trực tiếp (bỏ qua ngưỡng điểm tự động).</p>

        {/* Search */}
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            value={searchKeyword}
            onChange={e => setSearchKeyword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Nhập tên hoặc SĐT khách hàng..."
            className="flex-1 bg-surface-secondary border border-slate-700/50 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary-container"
          />
          <button onClick={handleSearch} disabled={searching}
            className="px-5 py-2.5 bg-primary-container text-on-primary-container rounded-lg font-semibold hover:bg-primary transition-colors disabled:opacity-50">
            {searching ? 'Đang tìm...' : 'Tìm kiếm'}
          </button>
        </div>

        {/* Search results */}
        {searchResults.length > 0 && (
          <div className="mb-4 bg-surface-container-high rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-700 text-slate-300">
                <tr>
                  <th className="px-4 py-2 text-left">Họ tên</th>
                  <th className="px-4 py-2 text-left">SĐT</th>
                  <th className="px-4 py-2 text-left">Hạng hiện tại</th>
                  <th className="px-4 py-2 text-left">Điểm</th>
                  <th className="px-4 py-2 text-left">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {searchResults.map((c: any) => (
                  <tr key={c.id} className={`hover:bg-slate-800 transition-colors ${selectedClient?.id === c.id ? 'bg-slate-800' : ''}`}>
                    <td className="px-4 py-2 text-white">{c.fullName}</td>
                    <td className="px-4 py-2 text-slate-300">{c.phone}</td>
                    <td className="px-4 py-2 text-primary-container">{c.tier || '—'}</td>
                    <td className="px-4 py-2 text-slate-300">{c.loyaltyPoints?.toLocaleString() ?? 0}</td>
                    <td className="px-4 py-2">
                      <button onClick={() => selectClient(c)}
                        className="px-3 py-1 bg-surface-secondary border border-border-subtle rounded text-xs text-slate-300 hover:border-primary-container hover:text-primary-container transition-colors">
                        Chọn
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Upgrade form */}
        {selectedClient && (
          <div className="bg-surface-container-high rounded-lg p-5 border border-slate-700/50">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <span className="text-slate-400 text-xs uppercase">Khách hàng</span>
                <p className="text-white font-medium">{selectedClient.fullName} ({selectedClient.phone})</p>
              </div>
              <div>
                <span className="text-slate-400 text-xs uppercase">Hạng hiện tại</span>
                <p className="text-primary-container font-medium">{selectedClient.tier || '—'}</p>
              </div>
              <div>
                <span className="text-slate-400 text-xs uppercase">Hạng mới</span>
                <select
                  value={newTier}
                  onChange={e => setNewTier(e.target.value)}
                  className="bg-surface-secondary border border-slate-700/50 rounded px-3 py-1.5 text-white text-sm focus:outline-none focus:border-primary-container"
                >
                  <option value="">-- Chọn hạng --</option>
                  {tiers.map(t => (
                    <option key={t.tierName} value={t.tierName}>{t.tierName}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleUpgrade}
                disabled={upgrading || !newTier || newTier === selectedClient.tier}
                className="px-5 py-2 bg-primary-container text-on-primary-container rounded-lg font-semibold hover:bg-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {upgrading ? 'Đang xử lý...' : 'Xác nhận đổi hạng'}
              </button>
            </div>
            {upgradeMsg && (
              <p className={`mt-3 text-sm ${upgradeMsg.startsWith('✅') ? 'text-green-400' : 'text-red-400'}`}>{upgradeMsg}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
