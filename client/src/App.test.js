// Client Portal - App.test.js
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

describe('Client Portal - Login Component', () => {
  test('renders login form', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    const headingElement = screen.getByRole('heading', { name: /login/i });
    expect(headingElement).toBeInTheDocument();

    const usernameInput = screen.getByLabelText(/Username/i);
    expect(usernameInput).toBeInTheDocument();

    const accountNumberInput = screen.getByLabelText(/Employee Number/i);
    expect(accountNumberInput).toBeInTheDocument();

    const passwordInput = screen.getByLabelText(/Password/i);
    expect(passwordInput).toBeInTheDocument();

    const loginButton = screen.getByRole('button', { name: /Login/i });
    expect(loginButton).toBeInTheDocument();
  });

  test('displays error message on failed login', async () => {
    render(
      <MemoryRouter>
        <App />
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

  test('redirects to home after successful login', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ role: 'User' }),
      })
    );

    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
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

    const homePageContent = await screen.findByText(/Welcome to the Homepage!/i);
    expect(homePageContent).toBeInTheDocument();
  });
});
