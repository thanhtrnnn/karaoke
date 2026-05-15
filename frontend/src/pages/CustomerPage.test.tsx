import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import CustomerPage from './CustomerPage';

describe('CustomerPage', () => {
  it('renders without crashing', () => {
    const { container } = render(<BrowserRouter><CustomerPage /></BrowserRouter>);
    expect(container).toBeInTheDocument();
  });
});
