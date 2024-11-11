import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from './Login';

test('renders login page', () => {
  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );

  // Check for the presence of the "Login" heading
  const headingElement = screen.getByText(/Login/i);
  expect(headingElement).toBeInTheDocument();

  // Check for the presence of the username input
  const usernameInput = screen.getByLabelText(/Username/i);
  expect(usernameInput).toBeInTheDocument();

  // Check for the presence of the account number input
  const accountNumberInput = screen.getByLabelText(/Employee Number/i);
  expect(accountNumberInput).toBeInTheDocument();

  // Check for the presence of the password input
  const passwordInput = screen.getByLabelText(/Password/i);
  expect(passwordInput).toBeInTheDocument();

  // Check for the presence of the CAPTCHA
  const captcha = screen.getByText(/Please complete the CAPTCHA before logging in/i);
  expect(captcha).toBeInTheDocument();

  // Check for the presence of the login button
  const loginButton = screen.getByRole('button', { name: /Login/i });
  expect(loginButton).toBeInTheDocument();
});
