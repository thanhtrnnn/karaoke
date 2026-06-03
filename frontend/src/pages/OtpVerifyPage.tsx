import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useRef, useState } from 'react';

/**
 * OtpVerifyPage (Boundary: OTPVerifyView / OTPVerifyPage) — UC02 Đăng ký.
 * Wireframe III.3.3: ô nhập OTP 6 chữ số, [btnConfirm], btnResendOTP.
 *
 * Xác minh mã OTP qua POST /api/auth/verify-otp; gửi lại mã qua
 * POST /api/auth/send-otp. Ngữ cảnh đăng ký (username/phone/email) được nhận
 * từ navigation state do RegisterPage truyền sang.
 */
export default function OtpVerifyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const regData = (location.state || {}) as {
    fullName?: string;
    phoneNumber?: string;
    username?: string;
    email?: string;
  };

  const OTP_LENGTH = 6;
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const code = digits.join('');

  const handleChange = (index: number, value: string) => {
    const v = value.replace(/\D/g, '').slice(-1); // chỉ nhận 1 chữ số
    const next = [...digits];
    next[index] = v;
    setDigits(next);
    if (v && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = Array(OTP_LENGTH).fill('');
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setDigits(next);
    inputsRef.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  // btnConfirm — Xác nhận OTP
  const verifyOtp = async () => {
    setError(null);
    setInfo(null);
    if (code.length < OTP_LENGTH) {
      setError('Vui lòng nhập đủ 6 chữ số mã OTP.');
      return;
    }
    setLoading(true);
    try {
      // UC02: xác minh mã OTP người dùng nhập (kèm định danh tài khoản từ bước đăng ký).
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          otpCode: code,
          phoneNumberOrEmail: regData.phoneNumber || regData.email,
          username: regData.username,
        }),
      });
      if (!res.ok) {
        throw new Error('Mã OTP không hợp lệ hoặc đã hết hạn.');
      }
      const data = (await res.json().catch(() => null)) as { verified?: boolean } | null;
      if (!data?.verified) {
        throw new Error('Mã OTP không hợp lệ hoặc đã hết hạn.');
      }

      // Xác minh thành công -> tài khoản đã được tạo ở bước /api/auth/register.
      setInfo('Đăng ký thành công! Vui lòng đăng nhập.');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err: any) {
      setError(err.message || 'Mã OTP không hợp lệ hoặc đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  // btnResendOTP — Gửi lại mã
  const resendOtp = async () => {
    setError(null);
    setInfo(null);
    setDigits(Array(OTP_LENGTH).fill(''));
    inputsRef.current[0]?.focus();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumberOrEmail: regData.phoneNumber || regData.email,
          type: 'REGISTER',
        }),
      });
      if (!res.ok) {
        throw new Error('Không gửi lại được mã OTP. Vui lòng thử lại.');
      }
      setInfo('Đã gửi lại mã OTP. Vui lòng kiểm tra điện thoại/email.');
    } catch (err: any) {
      setError(err.message || 'Không gửi lại được mã OTP. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Left: Branding panel (đồng bộ với Login/Register) */}
      <div className="hidden md:flex md:w-1/2 relative bg-surface-primary overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-bg-base via-bg-base/50 to-transparent z-10"></div>
        <div className="absolute bottom-16 left-16 z-20 max-w-md">
          <h1 className="font-h1 text-h1 text-primary mb-4 tracking-tight">Famtaoke</h1>
          <p className="font-body-lg text-body-lg text-text-secondary">Chỉ còn một bước nữa — xác nhận mã OTP để hoàn tất đăng ký tài khoản của bạn.</p>
        </div>
      </div>

      {/* Right: OTP form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 sm:p-16 lg:p-24 bg-bg-base relative z-10">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <h2 className="font-h1 text-h1 text-text-primary mb-2">Xác nhận OTP</h2>
            <p className="font-body-md text-body-md text-text-secondary">
              Nhập mã OTP 6 chữ số đã được gửi đến
              {regData.phoneNumber ? ` SĐT ${regData.phoneNumber}` : regData.email ? ` ${regData.email}` : ' SĐT/Email của bạn'}.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 font-body-md">{error}</div>
          )}
          {info && (
            <div className="mb-6 p-4 bg-status-available/10 border border-status-available/50 rounded-lg text-status-available font-body-md">{info}</div>
          )}

          <div className="flex justify-between gap-2 sm:gap-3 mb-8" onPaste={handlePaste}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => { inputsRef.current[i] = el; }}
                value={d}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                inputMode="numeric"
                maxLength={1}
                aria-label={`Chữ số OTP ${i + 1}`}
                className="w-12 h-14 sm:w-14 sm:h-16 text-center text-h2 font-h2 bg-surface-secondary border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
            ))}
          </div>

          <button
            type="button"
            onClick={verifyOtp}
            disabled={loading}
            className="w-full bg-primary text-on-primary font-body-lg font-bold py-4 rounded hover:bg-primary-fixed transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? 'ĐANG XÁC NHẬN...' : 'XÁC NHẬN'}
          </button>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={resendOtp}
              disabled={loading}
              className="font-label-caps text-label-caps text-primary hover:text-primary-fixed transition-colors disabled:opacity-50"
            >
              Gửi lại mã
            </button>
          </div>

          <div className="mt-8 text-center border-t border-border-subtle pt-6">
            <p className="font-body-md text-body-md text-text-secondary">
              Quay lại <Link className="text-primary hover:text-primary-fixed transition-colors font-medium" to="/login">Đăng nhập</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
