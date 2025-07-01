import React from 'react';
import { render } from '@testing-library/react';
import { useLocation } from 'react-router-dom';
import ScrollToTop from '../ScrollToTop';

// Mocks
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn(),
}));

describe('ScrollToTop', () => {
  let scrollToMock;
  beforeEach(() => {
    scrollToMock = jest.fn();
    // @ts-ignore
    global.window.scrollTo = scrollToMock;
  });

  it('calls window.scrollTo on mount and pathname change', () => {
    let loc = { pathname: '/page1' };
    useLocation.mockReturnValue(loc);

    const { rerender } = render(<ScrollToTop />);
    expect(scrollToMock).toHaveBeenCalledWith(0, 0);

    // Simulate route change
    loc = { pathname: '/page2' };
    useLocation.mockReturnValue(loc);

    rerender(<ScrollToTop />);
    expect(scrollToMock).toHaveBeenCalledTimes(2);
  });

  it('renders null always', () => {
    useLocation.mockReturnValue({ pathname: '/any' });
    const { container } = render(<ScrollToTop />);
    expect(container.firstChild).toBeNull();
  });
});
