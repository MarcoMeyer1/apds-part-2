

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';


global.window = Object.create(window);
Object.defineProperty(window, 'location', {
  value: {
    href: 'https://localhost/',
    origin: 'https://localhost',
  },
  writable: true,
});

describe('Client Portal - Login Component', () => {
  test('renders login form', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    // Check for the "Login" heading
    const headingElement = screen.getByRole('heading', { name: /login/i });
    expect(headingElement).toBeInTheDocument();
  });

  test('displays error message on failed login', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    // Simulate user input for login
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/Account Number/i), { target: { value: '12345' } });
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    // Check for error message
    const errorMessage = screen.getByText(/Invalid login credentials/i);
    expect(errorMessage).toBeInTheDocument();
  });

  test('redirects to home after successful login', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    // Simulate correct login input
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'correctuser' } });
    fireEvent.change(screen.getByLabelText(/Account Number/i), { target: { value: 'correctpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    // Check if redirected to homepage
    const homeElement = screen.getByText(/Welcome, correctuser/i);
    expect(homeElement).toBeInTheDocument();
  });
});
