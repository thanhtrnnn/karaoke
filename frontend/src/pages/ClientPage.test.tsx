import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import ClientPage from './ClientPage';

describe('ClientPage', () => {
  it('renders without crashing', () => {
    const { container } = render(<BrowserRouter><ClientPage /></BrowserRouter>);
    expect(container).toBeInTheDocument();
  });
});
