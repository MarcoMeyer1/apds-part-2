import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react'; // Import act from react
import Login from './Pages/Login'; // Updated path
import { MemoryRouter } from 'react-router-dom';

// Mock the ReCAPTCHA component
jest.mock('react-google-recaptcha', () => {
  return function ReCAPTCHA(props) {
    return (
      <div data-testid="recaptcha" onClick={() => props.onChange('mock-token')}>
        Mocked ReCAPTCHA
      </div>
    );
  };
});

// Suppress React Router future flag warnings in tests
beforeAll(() => {
  jest.spyOn(console, 'warn').mockImplementation((message) => {
    if (
      message.includes('React Router Future Flag Warning') ||
      message.includes('ReactDOMTestUtils.act is deprecated')
    ) {
      return;
    }
    console.warn(message);
  });
});

afterAll(() => {
  console.warn.mockRestore();
});

describe('Employee Login Component', () => {
  beforeEach(() => {
    jest.spyOn(window, 'alert').mockImplementation(() => {});
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ role: 'Employee', username: 'johndoe' }),
      text: jest.fn().mockResolvedValue(''),
    });
    delete window.location;
    window.location = { href: '' };
  });

  afterEach(() => {
    window.alert.mockRestore();
    global.fetch.mockRestore();
  });

  test('renders login form title and button', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /Login/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
  });

  test('shows error when CAPTCHA is not completed', async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'testUser' } });
    fireEvent.change(screen.getByLabelText('Employee Number'), { target: { value: 'EMP123' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });

    // Enable the button manually since it's disabled when CAPTCHA is not completed
    const loginButton = screen.getByRole('button', { name: /Login/i });
    loginButton.disabled = false;

    fireEvent.click(loginButton);

    expect(
      screen.getByText(/Please complete the CAPTCHA before logging in./i)
    ).toBeInTheDocument();
  });

  test('allows user to fill and submit the form', async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'testUser' } });
    fireEvent.change(screen.getByLabelText('Employee Number'), { target: { value: 'EMP123' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });

    // Simulate completing the CAPTCHA
    fireEvent.click(screen.getByTestId('recaptcha'));

    // Click the login button
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    // Wait for the alert to be called
    await waitFor(() =>
      expect(window.alert).toHaveBeenCalledWith('Login Successful')
    );

    expect(window.location.href).toBe('/employee-dashboard');
  });
});
