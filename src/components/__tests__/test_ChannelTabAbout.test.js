import React from 'react';
import { render, screen } from '@testing-library/react';
import ChannelTabAbout from '../ChannelTabAbout';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

const mockStore = configureStore([]);

function renderWithStore(channelDescription) {
  const store = mockStore({ profile: { data: { channelDescription } } });
  return render(
    <Provider store={store}>
      <ChannelTabAbout />
    </Provider>
  );
}

describe('ChannelTabAbout', () => {
  it('renders provided channel description', () => {
    renderWithStore('This is my channel!');
    expect(screen.getByText('This is my channel!')).toBeInTheDocument();
  });

  it('renders fallback if no description', () => {
    renderWithStore('');
    expect(screen.getByText('No description for this channel')).toBeInTheDocument();
  });

  it('renders fallback if description is undefined', () => {
    renderWithStore(undefined);
    expect(screen.getByText('No description for this channel')).toBeInTheDocument();
  });
});
