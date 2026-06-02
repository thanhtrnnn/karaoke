import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import DamageReportPage from './DamageReportPage';

const mockReports = [
  { id: 'BC-001', maBaoCao: 'BC-2026-001', ngayTao: '2026-06-01T08:00:00', trangThai: 'Cho xu ly', employee: { id: 'NV-001', username: 'nhanvien1' } },
  { id: 'BC-002', maBaoCao: 'BC-2026-002', ngayTao: '2026-06-02T10:00:00', trangThai: 'Da xu ly', employee: { id: 'NV-002', username: 'nhanvien2' } },
];

beforeEach(() => {
  vi.mocked(global.fetch).mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(mockReports),
  } as Response);

  localStorage.setItem('user', JSON.stringify({ id: 'NV-001', username: 'nhanvien1' }));
});

const renderPage = () => render(<BrowserRouter><DamageReportPage /></BrowserRouter>);

describe('DamageReportPage', () => {
  it('renders without crashing', () => {
    const { container } = renderPage();
    expect(container).toBeInTheDocument();
  });

  it('shows page heading', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Báo cáo Hư hỏng')).toBeInTheDocument();
    });
  });

  it('displays list of reports after load', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('BC-2026-001')).toBeInTheDocument();
      expect(screen.getByText('BC-2026-002')).toBeInTheDocument();
    });
  });

  it('shows status badges', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Cho xu ly')).toBeInTheDocument();
      expect(screen.getByText('Da xu ly')).toBeInTheDocument();
    });
  });

  it('shows "Đánh dấu đã xử lý" only for unresolved reports', async () => {
    renderPage();
    await waitFor(() => {
      const resolveButtons = screen.getAllByText('Đánh dấu đã xử lý');
      // Only BC-001 (Cho xu ly) should have this button
      expect(resolveButtons).toHaveLength(1);
    });
  });

  it('opens create modal on button click', async () => {
    renderPage();
    await waitFor(() => screen.getByText('Tạo báo cáo'));
    fireEvent.click(screen.getByText('Tạo báo cáo'));
    await waitFor(() => {
      expect(screen.getByText('Tạo báo cáo hư hỏng')).toBeInTheDocument();
    });
  });

  it('shows empty state when no reports', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    } as Response);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Chưa có báo cáo hư hỏng')).toBeInTheDocument();
    });
  });
});
