import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Navbar from '../Navbar';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { BrowserRouter } from 'react-router-dom';

// Mock inner components
jest.mock('../Search', () => () => <div data-testid="mock-search" />);
jest.mock('../UploadVideo', () => () => <button data-testid="mock-uploadvideo" />);
jest.mock('../Icons', () => ({
  HamburgerIcon: ({ className, onClick }) => (
    <button data-testid="hamburger" className={className} onClick={onClick}>Ham</button>
  ),
  NotificationIcon: () => <span data-testid="notif" />,
}));
jest.mock('../styles/Avatar', () => (props) => <img data-testid="avatar" alt={props.alt} src={props.src} />);

const mockStore = configureStore([]);
const getStore = (overrides) =>
  mockStore({
    user: { data: { avatar: 'ava.jpg', ...overrides } },
    sidebar: { sidebar: false },
  });

describe('Navbar', () => {
  it('renders Navbar with logo, search and user avatar', () => {
    const store = getStore();
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Navbar />
        </BrowserRouter>
      </Provider>
    );
    expect(screen.getByText(/YouTube Clone/)).toBeInTheDocument();
    expect(screen.getByTestId('mock-search')).toBeInTheDocument();
    expect(screen.getByTestId('mock-uploadvideo')).toBeInTheDocument();
    expect(screen.getByTestId('notif')).toBeInTheDocument();
    expect(screen.getByTestId('avatar')).toHaveAttribute('src', 'ava.jpg');
  });

  it('toggles sidebar state on Hamburger click', () => {
    const store = getStore();
    store.dispatch = jest.fn();
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Navbar />
        </BrowserRouter>
      </Provider>
    );
    const ham = screen.getByTestId('hamburger');
    // At first click: opens sidebar
    fireEvent.click(ham);
    expect(store.dispatch).toHaveBeenCalled();
  });

  it('avatar links to /feed/my_videos', () => {
    const store = getStore();
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Navbar />
        </BrowserRouter>
      </Provider>
    );
    // Avatar is wrapped in a link
    expect(screen.getByRole('link', { name: '' })).toHaveAttribute(
      'href',
      '/feed/my_videos'
    );
  });
});
