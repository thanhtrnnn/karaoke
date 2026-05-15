import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from './LoginPage';

describe('LoginPage', () => {
  it('renders login form', () => {
    render(<BrowserRouter><LoginPage /></BrowserRouter>);
    expect(screen.getByRole('button', { name: /đăng nhập/i })).toBeInTheDocument();
  });
});
