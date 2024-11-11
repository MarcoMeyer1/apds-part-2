import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

// Mock window.alert
global.alert = jest.fn();

// Mock window.location.href
Object.defineProperty(window, 'location', {
  value: {
    href: '',
  },
  writable: true,
});

describe('Client Portal - Login Component', () => {
  test('renders login form', () => {
    render(<App />);

    // Check for the "Login" heading
    const headingElement = screen.getByRole('heading', { name: /login/i });
    expect(headingElement).toBeInTheDocument();

    // Check for username input
    const usernameInput = screen.getByLabelText(/Username/i);
    expect(usernameInput).toBeInTheDocument();

    // Check for account number input
    const accountNumberInput = screen.getByLabelText(/Account Number/i);
    expect(accountNumberInput).toBeInTheDocument();

    // Check for password input
    const passwordInput = screen.getByLabelText(/Password/i);
    expect(passwordInput).toBeInTheDocument();

    // Check for the login button
    const loginButton = screen.getByRole('button', { name: /Login/i });
    expect(loginButton).toBeInTheDocument();
  });

  test('displays error message on failed login', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        text: () => Promise.resolve('Login Failed'),
      })
    );

    render(<App />);

    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/Account Number/i), { target: { value: '12345' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password' } });

    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    const errorMessage = await screen.findByText(/Login Failed/i);
    expect(errorMessage).toBeInTheDocument();
  });

  test('redirects to home after successful login', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ role: 'User' }),
      })
    );

    render(<App />);

    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/Account Number/i), { target: { value: '12345' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password' } });

    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    // Wait for navigation to complete and check the homepage content
    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Login Successful');
      expect(window.location.href).toBe('/home');
    });
  });
});
