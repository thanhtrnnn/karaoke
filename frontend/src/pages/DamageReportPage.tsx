import { useState, useEffect } from 'react';
import { formatDateTime } from '../config/constants';

/* ─── Types ─── */
interface Room { id: string; name: string; status: string; capacity?: number; branch?: { id: string; name: string }; }
interface Facility { id: string; name: string; compensationPrice: number; unit?: string; stock?: number; room?: { id: string }; }
interface DamageCartItem { facility: Facility; quantity: number; }
interface DamageDetail { id: number; facility: Facility; quantity: number; unitFineAmount: number; lineTotal: number; }
interface DamageReport { id: string; maBaoCao: string; reportTime: string; totalFine: number; trangThai: string; employee?: { id: string; fullName?: string }; roomReceipt?: { id: string }; details?: DamageDetail[]; }

export default function DamageReportPage() {
  const [step, setStep] = useState<'rooms' | 'facilities' | 'confirm'>('rooms');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [damageCart, setDamageCart] = useState<DamageCartItem[]>([]);
  const [reports, setReports] = useState<DamageReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<DamageReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [roomReceiptId, setRoomReceiptId] = useState<string | null>(null);

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  /* ── Fetch reports list ── */
  useEffect(() => {
    fetch('/api/damage-reports', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : [])
      .then(setReports)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  /* ── Step 1: Load occupied rooms ── */
  const loadRooms = async () => {
    try {
      const res = await fetch('/api/rooms?status=OCCUPIED', { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) setRooms(await res.json());
    } catch (e) { console.error(e); }
  };

  useEffect(() => { loadRooms(); }, []);

  /* ── Step 2: Select room → load facilities + active receipt ── */
  const selectRoom = async (room: Room) => {
    setSelectedRoom(room);
    setDamageCart([]);
    try {
      const [facRes, receiptRes] = await Promise.all([
        fetch(`/api/facilities?roomId=${room.id}`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`/api/damage-reports/active-receipt?roomId=${room.id}`, { headers: { 'Authorization': `Bearer ${token}` } }),
      ]);
      if (facRes.ok) setFacilities(await facRes.json());
      if (receiptRes.ok) {
        const receipt = await receiptRes.json();
        setRoomReceiptId(receipt?.id || null);
      }
    } catch (e) { console.error(e); }
    setStep('facilities');
  };

  /* ── Cart operations ── */
  const addToCart = (f: Facility) => {
    setDamageCart(prev => {
      const existing = prev.find(d => d.facility.id === f.id);
      if (existing) return prev.map(d => d.facility.id === f.id ? { ...d, quantity: d.quantity + 1 } : d);
      return [...prev, { facility: f, quantity: 1 }];
    });
  };

  const setQty = (id: string, qty: number) => {
    const item = damageCart.find(d => d.facility.id === id);
    const maxStock = item?.facility.stock ?? 999;
    setDamageCart(prev => prev.map(d =>
      d.facility.id === id ? { ...d, quantity: Math.min(Math.max(1, qty), maxStock) } : d
    ));
  };

  const removeFromCart = (id: string) => setDamageCart(prev => prev.filter(d => d.facility.id !== id));

  const cartTotal = damageCart.reduce((s, d) => s + (d.facility.compensationPrice || 0) * d.quantity, 0);

  /* ── Save report ── */
  const saveReport = async () => {
    if (damageCart.length === 0) return;
    setSaving(true);
    try {
      const body: any = {
        id: 'DR-' + crypto.randomUUID().slice(0, 8).toUpperCase(),
        maBaoCao: `BC-${selectedRoom?.id || ''}-${new Date().toISOString().slice(0, 10)}`,
        employee: user.id ? { id: user.id } : undefined,
        details: damageCart.map(d => ({ facility: { id: d.facility.id }, quantity: d.quantity })),
      };
      if (roomReceiptId) body.roomReceipt = { id: roomReceiptId };

      const res = await fetch('/api/damage-reports', { method: 'POST', headers, body: JSON.stringify(body) });
      if (res.ok) {
        const saved = await res.json();
        setReports(prev => [saved, ...prev]);
        setStep('confirm');
      }
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  /* ── Reset flow ── */
  const resetFlow = () => {
    setStep('rooms');
    setSelectedRoom(null);
    setFacilities([]);
    setDamageCart([]);
    setRoomReceiptId(null);
    loadRooms();
  };

  /* ── Status update ── */
  const updateStatus = async (id: string, trangThai: string) => {
    const report = reports.find(r => r.id === id);
    if (!report) return;
    const res = await fetch(`/api/damage-reports/${id}`, {
      method: 'PUT', headers, body: JSON.stringify({ ...report, trangThai })
    });
    if (res.ok) {
      const saved = await res.json();
      setReports(prev => prev.map(r => r.id === id ? saved : r));
    }
  };

  const statusColor = (s: string) => {
    if (s === 'Đã xử lý') return 'bg-green-900/50 text-green-300 border border-green-700/50';
    if (s === 'Chờ xử lý') return 'bg-yellow-900/50 text-yellow-300 border border-yellow-700/50';
    return 'bg-blue-900/50 text-blue-300 border border-blue-700/50';
  };

  if (loading) return <div className="p-8 text-slate-400">Đang tải...</div>;

  return (
    <div className="p-8 max-w-[1600px] mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[32px] text-primary-container">report_problem</span>
          <div>
            <h1 className="font-h1 text-white">Báo cáo hư hỏng</h1>
            <p className="text-slate-400 text-sm">UC10 — Báo cáo tình trạng hàng hóa</p>
          </div>
        </div>
        {step !== 'rooms' && (
          <button onClick={resetFlow} className="flex items-center gap-2 px-4 py-2 bg-surface-container border border-slate-700/50 rounded-lg text-slate-300 hover:text-white transition-colors">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>Quay lại
          </button>
        )}
      </div>

      {/* ═══ STEP 1: Chọn phòng đang hoạt động ═══ */}
      {step === 'rooms' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="material-symbols-outlined text-[20px]">meeting_room</span>
            <p className="font-body-md">Chọn phòng đang hoạt động để tạo báo cáo hư hỏng</p>
          </div>
          {rooms.length === 0 ? (
            <div className="bg-surface-container rounded-xl border border-slate-700/50 p-12 text-center">
              <span className="material-symbols-outlined text-[48px] text-slate-600 mb-3">meeting_room</span>
              <p className="text-slate-500">Không có phòng nào đang hoạt động</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rooms.map(room => (
                <button key={room.id} onClick={() => selectRoom(room)}
                  className="bg-surface-container rounded-xl border border-slate-700/50 p-5 text-left hover:border-status-occupied/50 transition-colors group">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-h2 text-white">{room.name}</h3>
                    <span className="px-2 py-0.5 rounded text-xs bg-status-occupied/10 text-status-occupied border border-status-occupied/20">Đang hát</span>
                  </div>
                  <p className="text-slate-400 text-sm">Phòng: <span className="text-slate-300">{room.id}</span></p>
                  {room.branch && <p className="text-slate-400 text-sm">Chi nhánh: <span className="text-slate-300">{room.branch.name}</span></p>}
                  <p className="text-slate-400 text-sm">Sức chứa: <span className="text-slate-300">{room.capacity} người</span></p>
                  <div className="mt-3 flex items-center gap-1 text-status-occupied text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>Chọn phòng
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Reports list */}
          <div className="mt-8">
            <h2 className="font-label-caps text-slate-400 uppercase mb-4">Lịch sử báo cáo</h2>
            <div className="bg-surface-container rounded-xl border border-slate-700/50 overflow-hidden">
              <table className="w-full text-left whitespace-nowrap">
                <thead className="bg-surface-container-low text-slate-400 font-label-caps">
                  <tr>
                    <th className="px-6 py-3">Mã BC</th>
                    <th className="px-6 py-3">Ngày tạo</th>
                    <th className="px-6 py-3">Tổng phí</th>
                    <th className="px-6 py-3 text-center">Trạng thái</th>
                    <th className="px-6 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="font-body-md divide-y divide-slate-800/50">
                  {reports.length === 0 && (
                    <tr><td colSpan={5} className="py-8 text-center text-slate-500">Chưa có báo cáo</td></tr>
                  )}
                  {reports.map(r => (
                    <tr key={r.id} className="hover:bg-slate-900/30 transition-colors">
                      <td className="px-6 py-3 text-primary-container font-medium">{r.maBaoCao || r.id}</td>
                      <td className="px-6 py-3 text-slate-300">{r.reportTime ? formatDateTime(r.reportTime) : '—'}</td>
                      <td className="px-6 py-3 text-[#D4AF37]">{(r.totalFine || 0).toLocaleString()}đ</td>
                      <td className="px-6 py-3 text-center">
                        <span className={`px-2.5 py-1 rounded-md font-label-caps text-xs ${statusColor(r.trangThai)}`}>{r.trangThai}</span>
                      </td>
                      <td className="px-6 py-3 flex justify-end gap-2">
                        <button onClick={() => setSelectedReport(r)} className="px-3 py-1.5 bg-surface-secondary border border-border-subtle rounded-lg text-slate-300 hover:text-primary-container hover:border-primary-container transition-colors text-xs flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">visibility</span>Chi tiết
                        </button>
                        {r.trangThai !== 'Đã xử lý' && (
                          <button onClick={() => updateStatus(r.id, 'Đã xử lý')} className="px-3 py-1.5 bg-green-900/30 text-green-300 border border-green-700/50 rounded-lg hover:bg-green-800/50 transition-colors text-xs">
                            Đã xử lý
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══ STEP 2: Chọn tài sản trong phòng ═══ */}
      {step === 'facilities' && selectedRoom && (
        <div className="space-y-4">
          <div className="bg-surface-container rounded-xl border border-slate-700/50 p-4 flex items-center gap-4">
            <span className="material-symbols-outlined text-status-occupied text-[24px]">meeting_room</span>
            <div>
              <p className="text-white font-medium">{selectedRoom.name} <span className="text-slate-400">({selectedRoom.id})</span></p>
              {selectedRoom.branch && <p className="text-slate-400 text-sm">{selectedRoom.branch.name}</p>}
            </div>
            {roomReceiptId && <span className="ml-auto text-xs text-green-400 bg-green-900/30 px-2 py-1 rounded">HĐ: {roomReceiptId}</span>}
            {!roomReceiptId && <span className="ml-auto text-xs text-yellow-400 bg-yellow-900/30 px-2 py-1 rounded">Chưa có hóa đơn</span>}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Facility list */}
            <div>
              <h3 className="font-label-caps text-slate-400 uppercase mb-3">Tài sản trong phòng ({facilities.length})</h3>
              <div className="bg-surface-container rounded-xl border border-slate-700/50 overflow-hidden max-h-[500px] overflow-y-auto">
                {facilities.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">Phòng này chưa có tài sản</div>
                ) : (
                  <div className="divide-y divide-slate-800/50">
                    {facilities.map(f => (
                      <div key={f.id} className="flex items-center justify-between px-4 py-3 hover:bg-slate-900/30 transition-colors">
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">{f.name}</p>
                          <p className="text-slate-400 text-sm">
                            {(f.compensationPrice || 0).toLocaleString()}đ{f.unit ? ` / ${f.unit}` : ''}
                            {f.stock != null && <span className="ml-2 text-slate-500">Tồn: {f.stock}</span>}
                          </p>
                        </div>
                        <button onClick={() => addToCart(f)} disabled={f.stock === 0}
                          className="ml-3 px-3 py-1.5 bg-primary-container/10 text-primary-container border border-primary-container/30 rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-colors text-xs flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed">
                          <span className="material-symbols-outlined text-[14px]">add</span>Thêm
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Damage cart */}
            <div>
              <h3 className="font-label-caps text-slate-400 uppercase mb-3">Chi tiết hư hỏng ({damageCart.length})</h3>
              {damageCart.length === 0 ? (
                <div className="bg-surface-container rounded-xl border border-slate-700/50 p-8 text-center">
                  <span className="material-symbols-outlined text-[40px] text-slate-600 mb-2">shopping_cart</span>
                  <p className="text-slate-500">Chọn tài sản từ danh sách bên trái</p>
                </div>
              ) : (
                <div className="bg-surface-container rounded-xl border border-slate-700/50 overflow-hidden">
                  <div className="divide-y divide-slate-800/50 max-h-[400px] overflow-y-auto">
                    {damageCart.map(d => (
                      <div key={d.facility.id} className="flex items-center gap-3 px-4 py-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm truncate">{d.facility.name}</p>
                          <p className="text-slate-500 text-xs">Tồn: {d.facility.stock ?? '∞'}</p>
                        </div>
                        <input type="number" min={1} max={d.facility.stock ?? 999} value={d.quantity}
                          onChange={e => setQty(d.facility.id, parseInt(e.target.value) || 1)}
                          className="w-16 bg-surface-secondary text-white rounded px-2 py-1 text-sm text-center border border-border-subtle focus:border-primary-container focus:outline-none" />
                        <span className="text-[#D4AF37] text-sm w-24 text-right font-medium">{((d.facility.compensationPrice || 0) * d.quantity).toLocaleString()}đ</span>
                        <button onClick={() => removeFromCart(d.facility.id)} className="text-slate-400 hover:text-red-400 transition-colors">
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center px-4 py-3 bg-surface-container-low border-t border-slate-700/50">
                    <span className="text-slate-300 font-medium">Tổng phí đền bù</span>
                    <span className="text-[#D4AF37] font-semibold text-lg">{cartTotal.toLocaleString()}đ</span>
                  </div>
                  <div className="px-4 py-3 bg-surface-container-low">
                    <button onClick={saveReport} disabled={saving || damageCart.length === 0}
                      className="w-full py-3 bg-primary-container text-on-primary-container font-semibold rounded-lg hover:bg-primary-fixed-dim transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                      {saving ? (
                        <><span className="animate-spin material-symbols-outlined text-[18px]">progress_activity</span>Đang lưu...</>
                      ) : (
                        <><span className="material-symbols-outlined text-[18px]">send</span>Tạo báo cáo</>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══ STEP 3: Xác nhận thành công ═══ */}
      {step === 'confirm' && (
        <div className="bg-surface-container rounded-xl border border-slate-700/50 p-12 text-center max-w-lg mx-auto">
          <span className="material-symbols-outlined text-[64px] text-green-400 mb-4">check_circle</span>
          <h2 className="font-h2 text-white mb-2">Báo cáo đã tạo thành công!</h2>
          <p className="text-slate-400 mb-2">Phòng: <span className="text-white">{selectedRoom?.name}</span></p>
          <p className="text-slate-400 mb-2">Tài sản hỏng: <span className="text-white">{damageCart.length} mục</span></p>
          <p className="text-[#D4AF37] font-semibold text-lg mb-6">Tổng phí: {cartTotal.toLocaleString()}đ</p>
          {roomReceiptId && <p className="text-green-400 text-sm mb-6">✓ Đã cập nhật phí hư hỏng vào hóa đơn {roomReceiptId}</p>}
          <div className="flex gap-3 justify-center">
            <button onClick={resetFlow} className="px-6 py-2.5 bg-surface-secondary border border-border-subtle rounded-lg text-slate-300 hover:text-white transition-colors">
              Tạo báo cáo mới
            </button>
            <button onClick={() => { setStep('rooms'); setSelectedRoom(null); }} className="px-6 py-2.5 bg-primary-container text-on-primary-container font-semibold rounded-lg hover:bg-primary-fixed-dim transition-colors">
              Về danh sách
            </button>
          </div>
        </div>
      )}

      {/* ═══ Report Detail Modal ═══ */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-surface-container rounded-xl border border-slate-700/50 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-surface-container-low px-6 py-4 border-b border-slate-700/50 flex justify-between items-center">
              <div>
                <h2 className="font-h2 text-white">Chi tiết báo cáo</h2>
                <p className="text-primary-container text-sm">{selectedReport.maBaoCao || selectedReport.id}</p>
              </div>
              <button onClick={() => setSelectedReport(null)} className="text-slate-400 hover:text-white transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 font-label-caps uppercase text-xs mb-1">Ngày tạo</p>
                  <p className="text-white">{selectedReport.reportTime ? formatDateTime(selectedReport.reportTime) : '—'}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-label-caps uppercase text-xs mb-1">Trạng thái</p>
                  <span className={`px-2 py-0.5 rounded text-xs ${statusColor(selectedReport.trangThai)}`}>{selectedReport.trangThai}</span>
                </div>
                <div>
                  <p className="text-slate-400 font-label-caps uppercase text-xs mb-1">Nhân viên</p>
                  <p className="text-white">{selectedReport.employee?.fullName || selectedReport.employee?.id || '—'}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-label-caps uppercase text-xs mb-1">Tổng phí</p>
                  <p className="text-[#D4AF37] font-semibold">{(selectedReport.totalFine || 0).toLocaleString()}đ</p>
                </div>
              </div>
              {selectedReport.details && selectedReport.details.length > 0 && (
                <div>
                  <p className="text-slate-400 font-label-caps uppercase text-xs mb-2">Chi tiết tài sản hỏng</p>
                  <div className="bg-surface-secondary rounded-lg divide-y divide-slate-700/50">
                    {selectedReport.details.map((d, i) => (
                      <div key={i} className="flex items-center justify-between px-4 py-2">
                        <div>
                          <p className="text-white text-sm">{d.facility?.name || `TS${d.facility?.id}`}</p>
                          <p className="text-slate-500 text-xs">SL: {d.quantity} × {(d.unitFineAmount || 0).toLocaleString()}đ</p>
                        </div>
                        <span className="text-[#D4AF37] text-sm font-medium">{(d.lineTotal || 0).toLocaleString()}đ</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-slate-700/50 flex justify-end">
              <button onClick={() => setSelectedReport(null)} className="px-6 py-2.5 text-slate-300 hover:text-white transition-colors font-medium">Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
