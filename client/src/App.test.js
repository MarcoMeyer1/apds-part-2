// App.test.js

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';  // Assume App already includes routing

describe('Client Portal - Login Component', () => {
  test('renders login form', () => {
    render(<App />);
    const headingElement = screen.getByRole('heading', { name: /login/i });
    expect(headingElement).toBeInTheDocument();
  });

  test('displays error message on failed login', () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/Account Number/i), { target: { value: '12345' } });
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));
    const errorMessage = screen.getByText(/Invalid login credentials/i);
    expect(errorMessage).toBeInTheDocument();
  });

  test('redirects to home after successful login', () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'correctuser' } });
    fireEvent.change(screen.getByLabelText(/Account Number/i), { target: { value: 'correctpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));
    const homeElement = screen.getByText(/Welcome, correctuser/i);
    expect(homeElement).toBeInTheDocument();
  });
});
