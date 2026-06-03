import { useState } from 'react';

export default function ProfilePage() {
  const storedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch { return {}; }
  })();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState<string | null>(null);
  const [pwLoading, setPwLoading] = useState(false);

  const username = storedUser.username || '';
  const role = storedUser.role || '';

  // Các trường chỉ đọc theo wireframe hồ sơ (SĐT, Hạng hội viên, Điểm tích lũy).
  // Backend hiện chưa trả các trường này nên đọc từ localStorage nếu có, không thì hiển thị "—".
  const phoneNumber = storedUser.phoneNumber || storedUser.phone || '';
  const membershipTier = storedUser.membershipTier || storedUser.tier || '';
  const loyaltyPoints = (storedUser.loyaltyPoints ?? storedUser.points);

  // Hồ sơ có thể chỉnh sửa (UC04: cập nhật hồ sơ — PUT /api/auth/profile)
  const [editMode, setEditMode] = useState(false);
  const [fullName, setFullName] = useState(storedUser.fullName || '');
  const [email, setEmail] = useState(storedUser.email || '');
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const handleSaveProfile = async () => {
    setProfileError(null);
    setProfileSuccess(null);
    setProfileLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, fullName, email }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || 'Cập nhật hồ sơ thất bại.');
      }
      // Đồng bộ lại thông tin user trong localStorage
      const updated = { ...storedUser, fullName, email };
      localStorage.setItem('user', JSON.stringify(updated));
      setProfileSuccess('Cập nhật thành công!');
      setEditMode(false); // UC04: quay về chế độ xem sau khi lưu
    } catch (err: any) {
      setProfileError(err.message);
    } finally {
      setProfileLoading(false);
    }
  };

  const roleLabel: Record<string, string> = {
    ADMIN: 'Quản trị viên',
    RECEPTIONIST: 'Lễ tân',
    SERVICE_STAFF: 'Phục vụ',
    BRANCH_MANAGER: 'Quản lý chi nhánh',
    CLIENT: 'Khách hàng',
  };

  const handleChangePassword = async () => {
    setPwError(null);
    setPwSuccess(null);

    if (!currentPassword || !newPassword) {
      setPwError('Vui lòng nhập đầy đủ thông tin.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError('Mật khẩu xác nhận không khớp.');
      return;
    }
    if (newPassword.length < 6) {
      setPwError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }

    setPwLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, currentPassword, newPassword }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || 'Đổi mật khẩu thất bại. Kiểm tra mật khẩu hiện tại.');
      }
      setPwSuccess('Đổi mật khẩu thành công! Đang đăng xuất...');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      // UC03: Thu hồi phiên sau khi đổi mật khẩu
      setTimeout(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }, 2000);
    } catch (err: any) {
      setPwError(err.message);
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto w-full space-y-6">
      <h1 className="font-h1 text-white">Thông tin cá nhân</h1>
      {/* Account Info */}
      <div className="bg-surface-container rounded-xl border border-slate-700/50 p-6">
        <h2 className="font-h2 text-white mb-6">Thông tin tài khoản</h2>
        <div className="flex items-center gap-6 mb-6">
          <div className="w-20 h-20 rounded-full bg-surface-container-high border-2 border-primary-container/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-primary-container">person</span>
          </div>
          <div>
            <p className="text-white font-h2">{username}</p>
            <p className="text-primary-container font-label-caps uppercase">{roleLabel[role] || role}</p>
          </div>
        </div>
        {profileError && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 font-body-md">{profileError}</div>
        )}
        {profileSuccess && (
          <div className="mb-4 p-3 bg-status-available/10 border border-status-available/50 rounded-lg text-status-available font-body-md">{profileSuccess}</div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div><label className="font-label-caps text-slate-400 uppercase block mb-2">Tên đăng nhập</label><input className="w-full bg-surface-secondary border border-border-subtle rounded-lg px-4 py-3 text-on-surface font-body-md focus:outline-none" value={username} readOnly /></div>
          <div><label className="font-label-caps text-slate-400 uppercase block mb-2">Họ và tên</label><input className={`w-full bg-surface-secondary border border-border-subtle rounded-lg px-4 py-3 text-on-surface font-body-md focus:outline-none focus:border-primary-container ${!editMode ? 'opacity-70' : ''}`} value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Họ và tên" readOnly={!editMode} /></div>
          <div><label className="font-label-caps text-slate-400 uppercase block mb-2">Số điện thoại</label><input className="w-full bg-surface-secondary border border-border-subtle rounded-lg px-4 py-3 text-on-surface font-body-md focus:outline-none opacity-70" value={phoneNumber || '—'} readOnly title="SĐT không thể chỉnh sửa" /></div>
          <div><label className="font-label-caps text-slate-400 uppercase block mb-2">Email</label><input className={`w-full bg-surface-secondary border border-border-subtle rounded-lg px-4 py-3 text-on-surface font-body-md focus:outline-none focus:border-primary-container ${!editMode ? 'opacity-70' : ''}`} value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" readOnly={!editMode} /></div>
          <div><label className="font-label-caps text-slate-400 uppercase block mb-2">Hạng hội viên</label><input className="w-full bg-surface-secondary border border-border-subtle rounded-lg px-4 py-3 text-on-surface font-body-md focus:outline-none opacity-70" value={membershipTier || '—'} readOnly /></div>
          <div><label className="font-label-caps text-slate-400 uppercase block mb-2">Điểm tích lũy</label><input className="w-full bg-surface-secondary border border-border-subtle rounded-lg px-4 py-3 text-on-surface font-body-md focus:outline-none opacity-70" value={(loyaltyPoints ?? '') === '' ? '—' : String(loyaltyPoints)} readOnly /></div>
          <div><label className="font-label-caps text-slate-400 uppercase block mb-2">Vai trò</label><input className="w-full bg-surface-secondary border border-border-subtle rounded-lg px-4 py-3 text-on-surface font-body-md focus:outline-none opacity-70" value={roleLabel[role] || role} readOnly /></div>
          <div><label className="font-label-caps text-slate-400 uppercase block mb-2">Mã người dùng</label><input className="w-full bg-surface-secondary border border-border-subtle rounded-lg px-4 py-3 text-on-surface font-body-md focus:outline-none opacity-70" value={storedUser.id || ''} readOnly /></div>
        </div>
        <div className="mt-6 flex gap-3">
          {!editMode ? (
            <button onClick={() => { setProfileError(null); setProfileSuccess(null); setEditMode(true); }} className="px-6 py-3 bg-primary-container text-on-primary-container rounded-lg font-body-md font-semibold hover:bg-primary transition-colors">
              Chỉnh sửa
            </button>
          ) : (
            <>
              <button onClick={handleSaveProfile} disabled={profileLoading} className="px-6 py-3 bg-primary-container text-on-primary-container rounded-lg font-body-md font-semibold hover:bg-primary transition-colors disabled:opacity-50">
                {profileLoading ? 'ĐANG LƯU...' : 'Lưu thay đổi'}
              </button>
              <button onClick={() => { setEditMode(false); setFullName(storedUser.fullName || ''); setEmail(storedUser.email || ''); setProfileError(null); }} disabled={profileLoading} className="px-6 py-3 bg-surface-secondary border border-border-subtle text-slate-300 rounded-lg font-body-md hover:text-white transition-colors disabled:opacity-50">
                Hủy
              </button>
            </>
          )}
        </div>
      </div>
      {/* Change Password */}
      <div className="bg-surface-container rounded-xl border border-slate-700/50 p-6">
        <h2 className="font-h2 text-white mb-4">Đổi mật khẩu</h2>
        {pwError && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 font-body-md">{pwError}</div>
        )}
        {pwSuccess && (
          <div className="mb-4 p-3 bg-status-available/10 border border-status-available/50 rounded-lg text-status-available font-body-md">{pwSuccess}</div>
        )}
        <div className="space-y-4 max-w-md">
          <div><label className="font-label-caps text-slate-400 uppercase block mb-2">Mật khẩu hiện tại</label><input className="w-full bg-surface-secondary border border-border-subtle rounded-lg px-4 py-3 text-on-surface font-body-md focus:outline-none focus:border-primary-container" type="password" placeholder="••••••••" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} /></div>
          <div><label className="font-label-caps text-slate-400 uppercase block mb-2">Mật khẩu mới</label><input className="w-full bg-surface-secondary border border-border-subtle rounded-lg px-4 py-3 text-on-surface font-body-md focus:outline-none focus:border-primary-container" type="password" placeholder="••••••••" value={newPassword} onChange={e => setNewPassword(e.target.value)} /></div>
          <div><label className="font-label-caps text-slate-400 uppercase block mb-2">Xác nhận mật khẩu</label><input className="w-full bg-surface-secondary border border-border-subtle rounded-lg px-4 py-3 text-on-surface font-body-md focus:outline-none focus:border-primary-container" type="password" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} /></div>
        </div>
        <button onClick={handleChangePassword} disabled={pwLoading} className="mt-4 px-6 py-3 bg-primary-container text-on-primary-container rounded-lg font-body-md font-semibold hover:bg-primary transition-colors disabled:opacity-50">
          {pwLoading ? 'ĐANG XỬ LÝ...' : 'Đổi mật khẩu'}
        </button>
      </div>
    </div>
  );
}
