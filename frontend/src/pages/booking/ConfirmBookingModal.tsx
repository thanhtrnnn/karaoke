import { useState } from 'react';

// ConfirmBookingModal — Màn hình con của module Đặt phòng (UC05)
// Hiển thị tóm tắt thông tin phòng + khách + giờ, nút "Xác nhận" gọi POST /api/bookings.

export interface ConfirmBookingRoom {
  id: string;
  type: string;
  price: string;
}

export interface ConfirmBookingClient {
  id: string;
  fullName: string;
  phone: string;
}

export interface ConfirmBookingModalProps {
  open: boolean;
  room: ConfirmBookingRoom | null;
  client: ConfirmBookingClient | null;
  bookingDate: string;
  startTime: string;
  endTime: string;
  guestCount: number;
  onClose: () => void;
  onConfirmed?: (bookingId: string) => void;
}

interface CreatedBooking {
  id: string;
}

export default function ConfirmBookingModal(props: ConfirmBookingModalProps): React.ReactElement | null {
  const { open, room, client, bookingDate, startTime, endTime, guestCount, onClose, onConfirmed } = props;
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!open || !room || !client) {
    return null;
  }

  const handleConfirm = async (): Promise<void> => {
    setSubmitting(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: client.id,
          roomId: room.id,
          startTime: `${bookingDate}T${startTime}:00`,
          endTime: `${bookingDate}T${endTime}:00`,
          guestCount,
        }),
      });
      if (res.ok) {
        const created: CreatedBooking = await res.json();
        if (onConfirmed) onConfirmed(created.id);
        onClose();
      } else {
        setError('Đặt phòng thất bại! Kiểm tra thông tin và thử lại.');
      }
    } catch (e) {
      console.error('Failed to confirm booking:', e);
      setError('Lỗi kết nối server.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-xl p-6 w-full max-w-sm shadow-2xl border border-slate-600">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#D4AF37]">event_available</span>
          Xác nhận đặt phòng
        </h2>
        <div className="space-y-3 text-sm mb-6">
          <div className="flex justify-between">
            <span className="text-slate-400">Phòng</span>
            <span className="text-white font-semibold">{room.id} ({room.type})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Khách hàng</span>
            <span className="text-white">{client.fullName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">SĐT</span>
            <span className="text-white">{client.phone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Thời gian</span>
            <span className="text-white">{bookingDate} | {startTime} — {endTime}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Số người</span>
            <span className="text-white">{guestCount} người</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Đơn giá</span>
            <span className="text-[#D4AF37] font-semibold">{room.price}/giờ</span>
          </div>
        </div>
        {error && <p className="text-red-400 text-xs mb-4">{error}</p>}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={submitting}
            className="flex-1 py-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700 disabled:opacity-50"
          >
            Huỷ
          </button>
          <button
            onClick={handleConfirm}
            disabled={submitting}
            className="flex-1 py-2 rounded-lg bg-[#D4AF37] text-black font-semibold hover:bg-yellow-400 disabled:opacity-50"
          >
            {submitting ? 'Đang đặt...' : 'Xác nhận'}
          </button>
        </div>
      </div>
    </div>
  );
}
