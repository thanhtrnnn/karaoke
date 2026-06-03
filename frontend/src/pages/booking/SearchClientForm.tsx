import { useState } from 'react';

// SearchClientForm — Màn hình con của module Đặt phòng (UC05)
// Ô tìm tên/SĐT, gọi GET /api/clients?keyword= → bảng khách hàng.

export interface ClientRow {
  id: string;
  fullName: string;
  phone: string;
  tier: string;
  loyaltyPoints: number;
}

interface SearchClientFormProps {
  onPickClient?: (client: ClientRow) => void;
}

function mapClient(c: any): ClientRow {
  return {
    id: c.id,
    fullName: c.fullName ?? '',
    phone: c.phone ?? '',
    tier: c.tier ?? '',
    loyaltyPoints: Number(c.loyaltyPoints ?? 0),
  };
}

export default function SearchClientForm(props: SearchClientFormProps): React.ReactElement {
  const { onPickClient } = props;
  const [keyword, setKeyword] = useState<string>('');
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searched, setSearched] = useState<boolean>(false);

  const handleSearch = async (): Promise<void> => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (keyword.trim()) params.set('keyword', keyword.trim());
      const res = await fetch(`/api/clients?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data: any[] = await res.json();
        setClients(data.map(mapClient));
        setSearched(true);
      } else {
        alert('Không thể tìm khách hàng. Vui lòng thử lại.');
      }
    } catch (e) {
      console.error('Failed to search clients:', e);
      alert('Lỗi kết nối server.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4 bg-surface-container rounded-xl p-4 border border-slate-700/50">
        <div className="flex-1 min-w-[240px]">
          <label className="font-label-caps text-slate-400 uppercase block mb-2">Tên hoặc SĐT khách hàng</label>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nhập tên hoặc số điện thoại..."
            className="w-full bg-surface-secondary border border-border-subtle rounded-lg px-4 py-2.5 text-on-surface font-body-md focus:outline-none focus:border-primary-container"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-5 py-2.5 bg-primary-container text-on-primary-container rounded-lg font-body-md font-semibold hover:bg-primary transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">search</span>
          {loading ? 'Đang tìm...' : 'Tìm khách'}
        </button>
      </div>

      <div className="bg-surface-container rounded-xl border border-slate-700/50 overflow-hidden">
        <table className="w-full text-left whitespace-nowrap">
          <thead>
            <tr className="border-b border-slate-700/50 text-slate-400 font-label-caps bg-surface-container-low">
              <th className="py-4 px-6">Mã KH</th>
              <th className="py-4 px-6">Họ tên</th>
              <th className="py-4 px-6">SĐT</th>
              <th className="py-4 px-6">Hạng</th>
              <th className="py-4 px-6">Điểm</th>
              {onPickClient && <th className="py-4 px-6">Chọn</th>}
            </tr>
          </thead>
          <tbody className="font-body-md divide-y divide-slate-800/50">
            {clients.length === 0 && (
              <tr>
                <td colSpan={onPickClient ? 6 : 5} className="py-8 text-center text-slate-500">
                  {searched ? 'Không tìm thấy khách hàng phù hợp.' : 'Nhập từ khóa và nhấn "Tìm khách".'}
                </td>
              </tr>
            )}
            {clients.map((c) => (
              <tr key={c.id} className="hover:bg-slate-900/30 transition-colors">
                <td className="py-4 px-6 text-slate-200 font-medium">{c.id}</td>
                <td className="py-4 px-6 text-slate-200">{c.fullName}</td>
                <td className="py-4 px-6 text-slate-400">{c.phone}</td>
                <td className="py-4 px-6 text-slate-400">{c.tier}</td>
                <td className="py-4 px-6 text-slate-400">{c.loyaltyPoints.toLocaleString()}</td>
                {onPickClient && (
                  <td className="py-4 px-6">
                    <button
                      onClick={() => onPickClient(c)}
                      className="px-4 py-2 rounded-lg font-label-caps bg-primary-container text-on-primary-container hover:bg-primary transition-colors"
                    >
                      Chọn
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
