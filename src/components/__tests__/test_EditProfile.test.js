import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import EditProfile from '../EditProfile';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

jest.mock('../EditProfileModal', () => ({ closeModal }) => (
  <div data-testid="editprofilemodal" onClick={closeModal}>ModalComp</div>
));
jest.mock('../styles/Button', () => (props) => <button {...props} data-testid="button" />);

jest.mock('../Icons', () => ({
  SignoutIcon: (props) => <button data-testid="signout" {...props}>Signout</button>,
}));

const mockStore = configureStore([]);

describe('EditProfile', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    Object.defineProperty(window, 'location', {
      value: { assign: jest.fn(), href: '', ...window.location },
      writable: true,
    });
  });

  it('renders EditProfile button and signout icon', () => {
    const store = mockStore({});
    render(
      <Provider store={store}>
        <EditProfile />
      </Provider>
    );
    expect(screen.getByTestId('button')).toBeInTheDocument();
    expect(screen.getByTestId('signout')).toBeInTheDocument();
  });

  it('opens modal when button is clicked and closes it on callback', () => {
    const store = mockStore({});
    render(
      <Provider store={store}>
        <EditProfile />
      </Provider>
    );
    fireEvent.click(screen.getByTestId('button'));
    expect(screen.getByTestId('editprofilemodal')).toBeInTheDocument();

    // Should allow closing modal
    fireEvent.click(screen.getByTestId('editprofilemodal'));
    expect(screen.queryByTestId('editprofilemodal')).toBeNull();
  });

  it('performs logout on icon click', () => {
    const store = mockStore({});
    window.location = { assign: jest.fn(), href: '' };
    window.localStorage.setItem = jest.fn();
    window.localStorage.removeItem = jest.fn();
    render(
      <Provider store={store}>
        <EditProfile />
      </Provider>
    );
    fireEvent.click(screen.getByTestId('signout'));
    expect(window.localStorage.removeItem).toHaveBeenCalledWith('user');
  });
});
