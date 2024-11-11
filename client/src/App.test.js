import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

describe('Client Portal - Login Component', () => {
  test('renders login form', () => {
    render(<App />);

    // Check for the "Login" heading
    const headingElement = screen.getByRole('heading', { name: /login/i });
    expect(headingElement).toBeInTheDocument();

    // Check for username input
    const usernameInput = screen.getByLabelText(/Username/i);
    expect(usernameInput).toBeInTheDocument();

    // Check for account number input (updated label text)
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
    // Mock fetch to simulate a failed login response
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        text: () => Promise.resolve('Login Failed'),
      })
    );

    render(<App />);

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByLabelText(/Account Number/i), { // Updated label
      target: { value: '12345' },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'password' },
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    // Wait for error message to display
    const errorMessage = await screen.findByText(/Login Failed/i);
    expect(errorMessage).toBeInTheDocument();
  });

  test('redirects to home after successful login', async () => {
    // Mock fetch to simulate a successful login response
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ role: 'User' }),
      })
    );

    render(<App />);

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByLabelText(/Account Number/i), { // Updated label
      target: { value: '12345' },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'password' },
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    // Check that the homepage content is displayed after login
    const homePageContent = await screen.findByText(/Welcome to the Homepage!/i);
    expect(homePageContent).toBeInTheDocument();
  });
});
