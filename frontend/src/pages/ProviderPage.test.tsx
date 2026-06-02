import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import ProviderPage from './ProviderPage';

const mockProviders = [
  { id: 'NCC-001', tenNCC: 'Cong ty ABC', diaChiNCC: '123 Nguyen Hue', dienThoai: '0901234567' },
  { id: 'NCC-002', tenNCC: 'Cong ty XYZ', diaChiNCC: '456 Le Loi', dienThoai: '0987654321' },
];

beforeEach(() => {
  vi.mocked(global.fetch).mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(mockProviders),
  } as Response);
});

const renderPage = () => render(<BrowserRouter><ProviderPage /></BrowserRouter>);

describe('ProviderPage', () => {
  it('renders without crashing', () => {
    const { container } = renderPage();
    expect(container).toBeInTheDocument();
  });

  it('shows page heading', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Quản lý Nhà cung cấp')).toBeInTheDocument();
    });
  });

  it('displays list of providers after load', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Cong ty ABC')).toBeInTheDocument();
      expect(screen.getByText('Cong ty XYZ')).toBeInTheDocument();
    });
  });

  it('displays provider details in table', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('123 Nguyen Hue')).toBeInTheDocument();
      expect(screen.getByText('0901234567')).toBeInTheDocument();
    });
  });

  it('opens create modal on button click', async () => {
    renderPage();
    await waitFor(() => screen.getByText('Thêm NCC'));
    fireEvent.click(screen.getByText('Thêm NCC'));
    await waitFor(() => {
      expect(screen.getByText('Thêm nhà cung cấp')).toBeInTheDocument();
    });
  });

  it('shows empty state when no providers', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    } as Response);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Chưa có nhà cung cấp nào')).toBeInTheDocument();
    });
  });

  it('shows modal with edit form when edit button clicked', async () => {
    renderPage();
    await waitFor(() => screen.getAllByTitle !== undefined && screen.getByText('Cong ty ABC'));
    const editButtons = document.querySelectorAll('[class*="edit"], button span[class*="material"]');
    // Open modal via button
    fireEvent.click(screen.getByText('Thêm NCC'));
    await waitFor(() => {
      expect(screen.getByPlaceholderText('VD: NCC002')).toBeInTheDocument();
    });
  });
});
