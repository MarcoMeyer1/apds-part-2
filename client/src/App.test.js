import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from './pages/Login';

describe('Login Component', () => {
  test('renders login form', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    // Check for the "Login" heading
    const headingElement = screen.getByRole('heading', { name: /login/i });
    expect(headingElement).toBeInTheDocument();

    // Check for the submit button specifically
    const submitButton = screen.getByRole('button', { name: /login/i });
    expect(submitButton).toBeInTheDocument();

    // Check for username input
    const usernameInput = screen.getByLabelText(/Username/i);
    expect(usernameInput).toBeInTheDocument();

    // Check for account number input
    const accountNumberInput = screen.getByLabelText(/Account Number/i);
    expect(accountNumberInput).toBeInTheDocument();

    // Check for password input
    const passwordInput = screen.getByLabelText(/Password/i);
    expect(passwordInput).toBeInTheDocument();
  });

  test('displays error message on failed login', async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    // Mock fetch to simulate a failed login response
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        text: () => Promise.resolve('Login Failed'),
      })
    );

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByLabelText(/Account Number/i), {
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

  test('displays App.js content after successful login', async () => {
    // Mock fetch to simulate a successful login response
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ role: 'Employee' }), // Adjust based on expected response
      })
    );

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByLabelText(/Account Number/i), {
      target: { value: '12345' },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'password' },
    });

    // Simulate form submission
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    // Check that the main content of App.js is displayed
    // Adjust this selector based on unique text or element present in App.js
    const mainAppContent = await screen.findByText(/Welcome to the App/i);  // Replace with text actually rendered in App.js
    expect(mainAppContent).toBeInTheDocument();
  });
});
