import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { describe, it, expect, beforeEach } from 'vitest';
import '@testing-library/jest-dom';

describe('ProtectedRoute', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const renderWithRouter = (initialRoute: string) => {
    render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/manager" element={<div>Manager Dashboard</div>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/reports" element={<div>Reports Page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );
  };

  it('redirects to /login if no token', () => {
    renderWithRouter('/reports');
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('redirects to /login if token exists but no user object', () => {
    localStorage.setItem('token', 'fake-token');
    renderWithRouter('/reports');
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(localStorage.getItem('token')).toBeNull(); // It clears token
  });

  it('renders child route if user has access', () => {
    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('user', JSON.stringify({ role: 'ADMIN' }));
    renderWithRouter('/reports');
    expect(screen.getByText('Reports Page')).toBeInTheDocument();
  });

  it('redirects to fallback route if user lacks access', () => {
    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('user', JSON.stringify({ role: 'SERVICE_STAFF' }));
    
    // Service staff fallback is /order-management but we didn't define it in routes, 
    // it should just try to navigate there. Since we don't have it, nothing renders, 
    // but Reports Page shouldn't be there.
    renderWithRouter('/reports');
    expect(screen.queryByText('Reports Page')).not.toBeInTheDocument();
  });
});
