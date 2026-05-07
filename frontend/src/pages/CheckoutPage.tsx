import { useState, useEffect } from 'react';

interface Invoice {
  id: string;
  booking: { id: string } | null;
  roomTotal: number;
  serviceTotal: number;
  discount: number;
  grandTotal: number;
  paidAt: string | null;
  status: string;
}

export default function CheckoutPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'TRANSFER' | 'CARD'>('CASH');

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch('/api/invoices', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json())
      .then((data: Invoice[]) => {
        setInvoices(data);
        const draft = data.find(i => i.status === 'DRAFT');
        if (draft) setSelectedId(draft.id);
        else if (data.length > 0) setSelectedId(data[0].id);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  const invoice = invoices.find(i => i.id === selectedId);

  const handlePay = () => {
    if (!invoice) return;
    setPaying(true);
    fetch(`/api/invoices/${invoice.id}/pay`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then(r => r.json())
      .then((updated: Invoice) => {
        setInvoices(invoices.map(i => i.id === updated.id ? updated : i));
      })
      .catch(console.error)
      .finally(() => setPaying(false));
  };

  if (loading) {
    return <div className="p-8 text-slate-400">Đang tải hóa đơn...</div>;
  }

  if (!invoice) {
    return <div className="p-8 text-slate-400">Không có hóa đơn nào.</div>;
  }

  const isPaid = invoice.status === 'PAID';

  return (
    <div className="p-8 flex-1 flex gap-6 max-w-[1600px] mx-auto w-full">
      {/* Left: Invoice Detail */}
      <section className="w-full lg:w-[60%] flex flex-col gap-6">
        <div className="bg-surface-primary rounded-xl border border-slate-700/50 p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="font-h1 text-white mb-1">Thanh toán</h1>
              <p className="text-slate-400 font-body-md">Mã Bill: <span className="text-primary-container font-medium">#{invoice.id}</span></p>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-surface-container-high border border-slate-700/50 mb-2">
                <span className="font-h2 text-primary-container">{invoice.booking?.id ?? 'N/A'}</span>
              </div>
              <p className="text-slate-400 font-body-md">
                Trạng thái: <span className={isPaid ? 'text-status-available' : 'text-status-reserved'}>{isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}</span>
              </p>
            </div>
          </div>
          {invoices.length > 1 && (
            <div className="mt-4">
              <label className="text-slate-400 font-body-md mr-2">Chọn hóa đơn:</label>
              <select
                value={selectedId}
                onChange={e => setSelectedId(e.target.value)}
                className="bg-surface-secondary border border-border-subtle rounded px-3 py-2 text-white focus:outline-none focus:border-primary-container"
              >
                {invoices.map(inv => (
                  <option key={inv.id} value={inv.id}>{inv.id} — {inv.status === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}</option>
                ))}
              </select>
            </div>
          )}
        </div>
        <div className="bg-surface-primary rounded-xl border border-slate-700/50 shadow-sm flex-1 flex flex-col overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700/50 bg-surface-container-low flex justify-between items-center">
            <span className="font-label-caps text-slate-400 uppercase">Hạng mục</span>
            <span className="font-label-caps text-slate-400 uppercase">Thành tiền</span>
          </div>
          <div className="p-6 flex-1 overflow-y-auto">
            <div className="mb-6">
              <h3 className="font-label-caps text-primary-container mb-4 uppercase flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">schedule</span>Tiền giờ hát
              </h3>
              <div className="flex justify-between items-center py-2">
                <div>
                  <p className="font-body-lg text-white">Phòng</p>
                  <p className="font-body-md text-slate-400">Tổng giờ hát</p>
                </div>
                <span className="font-h2 text-white">{invoice.roomTotal.toLocaleString()}đ</span>
              </div>
            </div>
            <div className="border-b border-dashed border-slate-700/50 my-6"></div>
            <div>
              <h3 className="font-label-caps text-primary-container mb-4 uppercase flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">room_service</span>Dịch vụ
              </h3>
              <div className="flex justify-between items-center">
                <p className="font-body-lg text-white">Tổng dịch vụ</p>
                <span className="font-body-lg text-white font-medium">{invoice.serviceTotal.toLocaleString()}đ</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Right: Summary & Payment */}
      <section className="w-full lg:w-[40%] flex flex-col gap-6">
        <div className="bg-surface-primary rounded-xl border border-slate-700/50 p-6 shadow-sm flex-1 flex flex-col">
          <h3 className="font-label-caps text-slate-400 mb-6 uppercase border-b border-slate-700/50 pb-2">Tổng Kết</h3>
          <div className="flex flex-col gap-4 flex-1">
            <div className="flex justify-between items-center">
              <span className="font-body-lg text-slate-400">Tiền phòng</span>
              <span className="font-body-lg text-white">{invoice.roomTotal.toLocaleString()}đ</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-body-lg text-slate-400">Tiền dịch vụ</span>
              <span className="font-body-lg text-white">{invoice.serviceTotal.toLocaleString()}đ</span>
            </div>
            {invoice.discount > 0 && (
              <div className="flex justify-between items-center text-status-available">
                <span className="font-body-lg">Giảm giá</span>
                <span className="font-body-lg">-{invoice.discount.toLocaleString()}đ</span>
              </div>
            )}
            <div className="mt-auto pt-6 border-t border-slate-700/50 flex flex-col items-end">
              <span className="font-label-caps text-slate-400 mb-2 uppercase">Tổng cộng</span>
              <span className="font-room-number text-primary-container">{invoice.grandTotal.toLocaleString()}đ</span>
            </div>
          </div>
        </div>
        <div className="bg-surface-primary rounded-xl border border-slate-700/50 p-6 shadow-sm">
          <h3 className="font-label-caps text-slate-400 mb-4 uppercase">Phương thức thanh toán</h3>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { key: 'CASH' as const, label: 'Tiền mặt', icon: 'payments' },
              { key: 'TRANSFER' as const, label: 'Chuyển khoản', icon: 'account_balance' },
              { key: 'CARD' as const, label: 'Thẻ', icon: 'credit_card' },
            ].map(m => (
              <button
                key={m.key}
                onClick={() => setPaymentMethod(m.key)}
                className={`flex flex-col items-center justify-center p-4 rounded-xl gap-2 transition-all ${
                  paymentMethod === m.key
                    ? 'border-2 border-primary-container bg-primary-container/10 text-primary-container'
                    : 'border border-slate-700/50 bg-surface-container-high hover:border-primary-container text-slate-400 hover:text-primary-container'
                }`}
              >
                <span className="material-symbols-outlined text-2xl">{m.icon}</span>
                <span className="font-label-caps">{m.label}</span>
              </button>
            ))}
          </div>
          <button
            onClick={handlePay}
            disabled={isPaid || paying}
            className={`w-full py-5 rounded-xl font-h2 uppercase tracking-wide flex items-center justify-center gap-3 transition-colors shadow-[0_0_15px_rgba(212,175,55,0.2)] ${
              isPaid
                ? 'bg-status-available/20 text-status-available cursor-not-allowed'
                : 'bg-primary-container text-on-primary-fixed hover:bg-primary'
            }`}
          >
            <span className="material-symbols-outlined">receipt_long</span>
            {isPaid ? 'ĐÃ THANH TOÁN' : paying ? 'ĐANG XỬ LÝ...' : 'HOÀN TẤT THANH TOÁN'}
          </button>
        </div>
      </section>
    </div>
  );
}
