import React from 'react';
import { render, screen } from '@testing-library/react';
import ChannelTabChannels from '../ChannelTabChannels';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { BrowserRouter } from 'react-router-dom';

const mockStore = configureStore([]);

function renderWithStore(storeState) {
  const store = mockStore({ profile: { data: storeState } });
  return render(
    <Provider store={store}>
      <BrowserRouter>
        <ChannelTabChannels />
      </BrowserRouter>
    </Provider>
  );
}

describe('ChannelTabChannels', () => {
  it('renders message when no channels subscribed', () => {
    renderWithStore({ channels: [] });
    expect(screen.getByText(/Not subscribed to any channels/i)).toBeInTheDocument();
  });

  it('renders channel cards for each channel', () => {
    const channels = [
      {
        id: 1,
        avatar: 'a.jpg',
        username: 'Alpha',
        subscribersCount: 5,
      },
      {
        id: 2,
        avatar: 'b.jpg',
        username: 'Beta',
        subscribersCount: 12,
      },
    ];
    renderWithStore({ channels });

    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
    expect(screen.getAllByRole('img')).toHaveLength(channels.length);
    expect(screen.getByText('5 subscribers')).toBeInTheDocument();
    expect(screen.getByText('12 subscribers')).toBeInTheDocument();
  });

  it('renders correct channel card links', () => {
    const channels = [{
      id: 900,
      avatar: 'zzz.jpg',
      username: 'Zed',
      subscribersCount: 99,
    }];
    renderWithStore({ channels });

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/channel/900');
    expect(screen.getByText('Zed')).toBeInTheDocument();
  });
});
