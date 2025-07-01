import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Search from '../Search';

// Mock utils and hooks
jest.mock('../hooks/useInput', () => (init) => {
  const actual = jest.requireActual('../hooks/useInput');
  const [value, setValue] = React.useState(init);
  return {
    value,
    setValue,
    onChange: (e) => setValue(e.target.value),
  };
});

jest.mock('react-toastify', () => ({
  toast: { dark: jest.fn() }
}));

const mockPush = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({ push: mockPush }),
}));

describe('Search', () => {
  beforeEach(() => {
    mockPush.mockClear();
    require('react-toastify').toast.dark.mockClear();
  });

  it('renders input', () => {
    render(<Search />);
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
  });

  it('shows toast if search is empty on enter', () => {
    render(<Search />);
    const input = screen.getByPlaceholderText(/search/i);
    fireEvent.keyDown(input, { key: 'Enter', keyCode: 13 });
    expect(require('react-toastify').toast.dark).toHaveBeenCalledWith('Please enter the searchterm');
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('pushes route and clears input if search filled and enter pressed', () => {
    render(<Search />);
    const input = screen.getByPlaceholderText(/search/i);
    fireEvent.change(input, { target: { value: 'cats' } });
    fireEvent.keyDown(input, { key: 'Enter', keyCode: 13 });
    expect(require('react-toastify').toast.dark).not.toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith('/results/cats');
    // Simulate the value being cleared (should match input field value)
    expect(input.value).toBe('');
  });

  it('does nothing for non-enter key', () => {
    render(<Search />);
    const input = screen.getByPlaceholderText(/search/i);
    fireEvent.keyDown(input, { key: 'a', keyCode: 65 });
    expect(require('react-toastify').toast.dark).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });
});
