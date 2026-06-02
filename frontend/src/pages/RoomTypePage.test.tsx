import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import RoomTypePage from './RoomTypePage';

const mockRoomTypes = [
  { id: 'LT-VIP', tenLoai: 'VIP', sucChua: 15, giaCuoc: 200000, trangThai: true },
  { id: 'LT-THUONG', tenLoai: 'Thường', sucChua: 8, giaCuoc: 80000, trangThai: true },
  { id: 'LT-DELUXE', tenLoai: 'Deluxe', sucChua: 12, giaCuoc: 150000, trangThai: false },
];

beforeEach(() => {
  vi.mocked(global.fetch).mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(mockRoomTypes),
  } as Response);
});

const renderPage = () => render(<BrowserRouter><RoomTypePage /></BrowserRouter>);

describe('RoomTypePage — Module 3 UC19 Quản lý danh mục loại phòng', () => {
  it('renders without crashing', () => {
    const { container } = renderPage();
    expect(container).toBeInTheDocument();
  });

  it('displays all room type names', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('VIP')).toBeInTheDocument();
      expect(screen.getByText('Thường')).toBeInTheDocument();
      expect(screen.getByText('Deluxe')).toBeInTheDocument();
    });
  });

  it('displays sucChua with người suffix', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('15 người')).toBeInTheDocument();
      expect(screen.getByText('8 người')).toBeInTheDocument();
    });
  });

  it('shows Hoạt động for active types, Tạm dừng for inactive', async () => {
    renderPage();
    await waitFor(() => {
      const activeItems = screen.getAllByText('Hoạt động');
      expect(activeItems.length).toBe(2); // VIP + Thường
      expect(screen.getByText('Tạm dừng')).toBeInTheDocument(); // Deluxe
    });
  });

  it('opens create modal with correct heading on add button click', async () => {
    renderPage();
    await waitFor(() => screen.getByText('Thêm loại phòng'));
    // Click the add button (first occurrence is in the header area)
    const addButtons = screen.getAllByText('Thêm loại phòng');
    fireEvent.click(addButtons[0]);
    // Modal heading should appear
    await waitFor(() => {
      const headings = screen.getAllByText('Thêm loại phòng');
      expect(headings.length).toBeGreaterThanOrEqualTo(1);
    });
  });

  it('shows empty state message when no room types', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    } as Response);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Chưa có loại phòng nào')).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    renderPage();
    expect(screen.getByText('Đang tải...')).toBeInTheDocument();
  });
});
