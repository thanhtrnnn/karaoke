import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import ReportsPage from './ReportsPage';

describe('ReportsPage', () => {
  it('renders without crashing', () => {
    const { container } = render(<BrowserRouter><ReportsPage /></BrowserRouter>);
    expect(container).toBeInTheDocument();
  });
});
