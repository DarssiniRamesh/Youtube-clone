import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import BottomBar from '../BottomBar';

// PUBLIC_INTERFACE
describe('BottomBar', () => {
  it('renders all main navigation icons', () => {
    const { getByLabelText, container } = render(
      <MemoryRouter initialEntries={['/']}>
        <BottomBar />
      </MemoryRouter>
    );
    expect(container.querySelectorAll('svg').length).toBe(5);
  });

  it('has NavLinks with correct routes', () => {
    const { getByText, container } = render(
      <MemoryRouter initialEntries={['/feed/trending']}>
        <BottomBar />
      </MemoryRouter>
    );
    // HomeIcon, TrendingIcon, SubIcon, HistoryIcon, WatchIcon all exist.
    expect(
      Array.from(container.querySelectorAll('a')).map(a => a.getAttribute('href'))
    ).toEqual(['/', '/feed/trending', '/feed/subscriptions', '/feed/history', '/feed/liked_videos']);
  });

  it('applies .active class to the correct NavLink', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/feed/trending']}>
        <BottomBar />
      </MemoryRouter>
    );
    const actives = container.querySelectorAll('.active');
    expect(Array.from(actives).length).toBe(1);
    // It should match the trending tab
    expect(actives[0].getAttribute('href')).toBe('/feed/trending');
  });
});
