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
});
