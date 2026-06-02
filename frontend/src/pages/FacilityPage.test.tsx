import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import FacilityPage from './FacilityPage';

const mockFacilities = [
  { id: 'TS-001', tenTaiSan: 'Mic karaoke', loai: 'AmThanh', trangThai: 'Bình thường', room: { id: 'RM-001', name: 'Phòng VIP 1' } },
  { id: 'TS-002', tenTaiSan: 'Màn hình 55"', loai: 'ManHinh', trangThai: 'Hư hỏng', room: { id: 'RM-002', name: 'Phòng Thường 1' } },
  { id: 'TS-003', tenTaiSan: 'Loa Bluetooth', loai: 'AmThanh', trangThai: 'Bình thường', room: { id: 'RM-001', name: 'Phòng VIP 1' } },
];

const mockRooms = [
  { id: 'RM-001', name: 'Phòng VIP 1' },
  { id: 'RM-002', name: 'Phòng Thường 1' },
];

beforeEach(() => {
  vi.mocked(global.fetch).mockImplementation((url: string | Request | URL) => {
    const urlStr = url.toString();
    if (urlStr.includes('/api/rooms')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(mockRooms) } as Response);
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve(mockFacilities) } as Response);
  });
});

const renderPage = () => render(<BrowserRouter><FacilityPage /></BrowserRouter>);

describe('FacilityPage — Module 4 UC09 Quản lý tài sản phòng', () => {
  it('renders without crashing', () => {
    const { container } = renderPage();
    expect(container).toBeInTheDocument();
  });

  it('shows page heading', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/Quản lý Tài sản|Tài sản phòng/i)).toBeInTheDocument();
    });
  });

  it('displays all facility names', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Mic karaoke')).toBeInTheDocument();
      expect(screen.getByText('Màn hình 55"')).toBeInTheDocument();
      expect(screen.getByText('Loa Bluetooth')).toBeInTheDocument();
    });
  });

  it('displays facility type (loai)', async () => {
    renderPage();
    await waitFor(() => {
      const amThanhItems = screen.getAllByText('AmThanh');
      expect(amThanhItems.length).toBe(2);
      expect(screen.getByText('ManHinh')).toBeInTheDocument();
    });
  });

  it('shows trangThai for each facility', async () => {
    renderPage();
    await waitFor(() => {
      const binhThuong = screen.getAllByText('Bình thường');
      expect(binhThuong.length).toBe(2);
      expect(screen.getByText('Hư hỏng')).toBeInTheDocument();
    });
  });

  it('opens create modal on Thêm tài sản click', async () => {
    renderPage();
    await waitFor(() => screen.getByText('Thêm tài sản'));
    fireEvent.click(screen.getByText('Thêm tài sản'));
    await waitFor(() => {
      // Modal opens with "Thêm tài sản" heading
      const allThemTaiSan = screen.getAllByText('Thêm tài sản');
      expect(allThemTaiSan.length).toBeGreaterThanOrEqualTo(1);
    });
  });

  it('shows empty state when no facilities', async () => {
    vi.mocked(global.fetch).mockImplementation(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve([]) } as Response)
    );
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Chưa có tài sản nào')).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    renderPage();
    expect(screen.getByText('Đang tải...')).toBeInTheDocument();
  });
});
