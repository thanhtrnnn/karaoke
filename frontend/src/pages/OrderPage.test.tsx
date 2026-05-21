import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import OrderPage from './OrderPage';

describe('OrderPage', () => {
  it('renders without crashing', () => {
    const { container } = render(<BrowserRouter><OrderPage /></BrowserRouter>);
    expect(container).toBeInTheDocument();
  });
});
