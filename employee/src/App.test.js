// Employee Portal - EmployeeLogin.test.js
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from './Pages/Login';

describe('Employee Portal - Login Component', () => {
  test('renders login page', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const headingElement = screen.getByText(/Login/i);
    expect(headingElement).toBeInTheDocument();

    const usernameInput = screen.getByLabelText(/Username/i);
    expect(usernameInput).toBeInTheDocument();

    const accountNumberInput = screen.getByLabelText(/Employee Number/i);
    expect(accountNumberInput).toBeInTheDocument();

    const passwordInput = screen.getByLabelText(/Password/i);
    expect(passwordInput).toBeInTheDocument();

    const captchaMessage = screen.getByText(/Please complete the CAPTCHA before logging in/i);
    expect(captchaMessage).toBeInTheDocument();

    const loginButton = screen.getByRole('button', { name: /Login/i });
    expect(loginButton).toBeInTheDocument();
  });

  test('displays error message on failed login', async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        text: () => Promise.resolve('Login Failed'),
      })
    );

    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByLabelText(/Employee Number/i), {
      target: { value: '12345' },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'password' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    const errorMessage = await screen.findByText(/Login Failed/i);
    expect(errorMessage).toBeInTheDocument();
  });

  test('redirects to employee dashboard on successful login', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ role: 'Employee' }),
      })
    );

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByLabelText(/Employee Number/i), {
      target: { value: '12345' },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'password' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    expect(window.location.href).toContain('/employee-dashboard');
  });
});
