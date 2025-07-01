import React from 'react';
import { render, screen } from '@testing-library/react';
import TrendingCard from '../TrendingCard';

// Mock utils
jest.mock('../utils', () => ({
  ...jest.requireActual('../utils'),
  timeSince: jest.fn(() => '1 hour')
}));

describe('TrendingCard', () => {
  const video = {
    thumbnail: 'thumb.jpg',
    title: 'VidTitle',
    description: 'desc '.repeat(20),
    User: { username: 'John' },
    views: 100,
    createdAt: '2022-01-01T00:00:00Z',
  };

  it('renders all video card elements', () => {
    render(<TrendingCard video={video} />);
    expect(screen.getByAltText(/thumbnail/i)).toHaveAttribute('src', 'thumb.jpg');
    expect(screen.getByText('VidTitle')).toBeInTheDocument();
    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText(/100 views/)).toBeInTheDocument();
    // "desc ..." truncated to 130 chars
    expect(screen.getByText(video.description.substr(0, 130))).toBeInTheDocument();
    expect(screen.getByText(/1 hour ago/)).toBeInTheDocument();
  });

  it('renders fallback for missing views', () => {
    const vidNoViews = { ...video, views: undefined };
    render(<TrendingCard video={vidNoViews} />);
    expect(screen.getByText('0 views')).toBeInTheDocument();
  });
});
