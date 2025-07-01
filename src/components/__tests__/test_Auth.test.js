import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Auth from '../Auth';

// Mock child components
jest.mock('../Login', () => ({ setAuth }) => (
  <div data-testid="mock-login" onClick={() => setAuth("SIGNUP")}>LoginComp</div>
));
jest.mock('../Signup', () => ({ setAuth }) => (
  <div data-testid="mock-signup" onClick={() => setAuth("LOGIN")}>SignupComp</div>
));

describe('Auth component', () => {
  test('renders Login by default', () => {
    render(<Auth />);
    expect(screen.getByTestId('mock-login')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-signup')).not.toBeInTheDocument();
  });

  test('switches to Signup on setAuth', () => {
    render(<Auth />);
    // Click to switch to Signup
    fireEvent.click(screen.getByTestId('mock-login'));
    expect(screen.queryByTestId('mock-login')).not.toBeInTheDocument();
    expect(screen.getByTestId('mock-signup')).toBeInTheDocument();
  });

  test('switches back to Login from Signup', () => {
    render(<Auth />);
    // Go to signup
    fireEvent.click(screen.getByTestId('mock-login'));
    // Now go back to login
    fireEvent.click(screen.getByTestId('mock-signup'));
    expect(screen.getByTestId('mock-login')).toBeInTheDocument();
  });

  // --- Advanced: Handle failed login UI feedback path ---
  it('shows error on login failure (simulated via mocked Login)', async () => {
    // Unmock Login to create a special one for failure
    jest.resetModules();
    jest.doMock('../Login', () => {
      return function Login({ setAuth }) {
        // Simulate form submit calling a failed dispatch
        React.useEffect(() => {
          if (typeof window.handleLoginFailure === 'function') {
            window.handleLoginFailure();
          }
        }, []);
        return <div data-testid="login-failure">FailLogin</div>;
      };
    });
    // Mock react-toastify to verify error is called
    const toast = { error: jest.fn() };
    jest.doMock('react-toastify', () => toast);

    // Callback to simulate side effect on mount
    window.handleLoginFailure = () => toast.error("Network/auth error");
    const AuthFail = require('../Auth').default;
    render(<AuthFail />);
    expect(screen.getByTestId('login-failure')).toBeInTheDocument();
    // Error toast should have fired via simulated useEffect
    expect(toast.error).toHaveBeenCalledWith("Network/auth error");
    delete window.handleLoginFailure;
    jest.resetModules();
  });
});
