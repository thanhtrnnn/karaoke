import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import ImportReceiptPage from './ImportReceiptPage';

const mockReceipts = [
  { id: 'PN-001', maPhieu: 'PN-2026-001', ngayNhap: '2026-06-01T10:00:00', tongTien: 500000, trangThai: 'DaNhan', provider: { id: 'NCC-001', tenNCC: 'Cong ty ABC' } },
  { id: 'PN-002', maPhieu: 'PN-2026-002', ngayNhap: '2026-06-02T14:00:00', tongTien: 300000, trangThai: 'DaNhan', provider: { id: 'NCC-002', tenNCC: 'Cong ty XYZ' } },
];

const mockProviders = [
  { id: 'NCC-001', tenNCC: 'Cong ty ABC' },
  { id: 'NCC-002', tenNCC: 'Cong ty XYZ' },
];

beforeEach(() => {
  vi.mocked(global.fetch).mockImplementation((url: string | Request | URL) => {
    const urlStr = url.toString();
    if (urlStr.includes('/api/providers')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(mockProviders) } as Response);
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve(mockReceipts) } as Response);
  });
});

const renderPage = () => render(<BrowserRouter><ImportReceiptPage /></BrowserRouter>);

describe('ImportReceiptPage', () => {
  it('renders without crashing', () => {
    const { container } = renderPage();
    expect(container).toBeInTheDocument();
  });

  it('shows page heading', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Quản lý Nhập kho')).toBeInTheDocument();
    });
  });

  it('displays list of receipts after load', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('PN-2026-001')).toBeInTheDocument();
      expect(screen.getByText('PN-2026-002')).toBeInTheDocument();
    });
  });

  it('displays provider names in table', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Cong ty ABC')).toBeInTheDocument();
    });
  });

  it('displays formatted amounts', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/500\.000đ|500,000đ/)).toBeInTheDocument();
    });
  });

  it('opens create modal on button click', async () => {
    renderPage();
    await waitFor(() => screen.getByText('Tạo phiếu nhập'));
    fireEvent.click(screen.getByText('Tạo phiếu nhập'));
    await waitFor(() => {
      expect(screen.getByText('Tạo phiếu nhập kho')).toBeInTheDocument();
    });
  });

  it('shows empty state when no receipts', async () => {
    vi.mocked(global.fetch).mockImplementation(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve([]) } as Response)
    );
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Chưa có phiếu nhập kho')).toBeInTheDocument();
    });
  });
});
