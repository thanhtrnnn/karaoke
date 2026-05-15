import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import CheckoutPage from './CheckoutPage';

describe('CheckoutPage', () => {
  it('renders without crashing', () => {
    const { container } = render(<BrowserRouter><CheckoutPage /></BrowserRouter>);
    expect(container).toBeInTheDocument();
  });
});
