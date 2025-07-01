import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import ChannelInfo from '../ChannelInfo';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

const mockDispatch = jest.fn();
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}));

jest.mock('../utils', () => ({
  ...jest.requireActual('../utils'),
  client: jest.fn(),
  addChannelLocalSt: jest.fn(),
  removeChannelLocalSt: jest.fn(),
}));

const store = configureStore()({
  user: {},
  searchResult: {},
  channelRecommendation: {},
});

const baseChannel = {
  id: '1',
  username: 'tester',
  avatar: 'img-avatar',
  subscribersCount: 22,
  videosCount: 5,
  isMe: false,
  isSubscribed: false,
  channelDescription: 'This is a channel about testing!',
};

describe('ChannelInfo', () => {
  it('renders channel info', () => {
    const { getByText, getByAltText } = render(
      <Provider store={store}>
        <ChannelInfo channel={baseChannel} />
      </Provider>
    );
    expect(getByText('tester')).toBeInTheDocument();
    expect(getByAltText('avatar')).toHaveAttribute('src', 'img-avatar');
    expect(getByText(/subscribers/)).toBeInTheDocument();
    expect(getByText(/videos/)).toBeInTheDocument();
    expect(getByText(/Subscribe/)).toBeInTheDocument();
  });

  it('does not render Subscribe button if isMe', () => {
    const { queryByText } = render(
      <Provider store={store}>
        <ChannelInfo channel={{ ...baseChannel, isMe: true }} />
      </Provider>
    );
    expect(queryByText('Subscribe')).not.toBeInTheDocument();
  });

  it('renders Subscribed button when isSubscribed', () => {
    const { getByText } = render(
      <Provider store={store}>
        <ChannelInfo channel={{ ...baseChannel, isSubscribed: true }} />
      </Provider>
    );
    expect(getByText('Subscribed')).toBeInTheDocument();
  });

  it('handleSubscribe dispatches the right actions', () => {
    const { getByText } = render(
      <Provider store={store}>
        <ChannelInfo search={true} channel={{ ...baseChannel, isSubscribed: false }} />
      </Provider>
    );
    fireEvent.click(getByText('Subscribe'));
    expect(mockDispatch).toHaveBeenCalled();
  });

  it('handleUnsubscribe dispatches the right actions', () => {
    const { getByText } = render(
      <Provider store={store}>
        <ChannelInfo channel={{ ...baseChannel, isSubscribed: true }} />
      </Provider>
    );
    fireEvent.click(getByText('Subscribed'));
    expect(mockDispatch).toHaveBeenCalled();
  });

  it('renders truncated channel description', () => {
    const desc = 'x'.repeat(80);
    const { getByText } = render(
      <Provider store={store}>
        <ChannelInfo channel={{ ...baseChannel, channelDescription: desc }} />
      </Provider>
    );
    expect(getByText(desc.substr(0, 65))).toBeInTheDocument();
  });

  it('renders nothing for missing channel prop', () => {
    const { container } = render(
      <Provider store={store}>
        <ChannelInfo channel={{}} />
      </Provider>
    );
    expect(container).toBeDefined();
  });
});
