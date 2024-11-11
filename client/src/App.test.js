import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Login from './pages/Login';
import App from './App';
import { BrowserRouter as Router } from 'react-router-dom';

describe('Client Portal - Login Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    test('renders login form', () => {
        render(
            <Router>
                <Login />
            </Router>
        );
        const headingElement = screen.getByRole('heading', { name: /login/i });
        expect(headingElement).toBeInTheDocument();
    });

    test('displays error message on failed login', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: false,
                text: () => Promise.resolve('Invalid login credentials'),
            })
        );

        render(
            <Router>
                <Login />
            </Router>
        );

        fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'testuser' } });
        fireEvent.change(screen.getByLabelText(/Account Number/i), { target: { value: '12345' } });
        fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'wrongpassword' } });
        fireEvent.click(screen.getByRole('button', { name: /login/i }));

        const errorMessage = await screen.findByText(/Invalid login credentials/i);
        expect(errorMessage).toBeInTheDocument();
    });

    test('redirects to homepage after successful login', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ role: 'User' }),
            })
        );

        render(
            <Router>
                <App />
            </Router>
        );

        fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'correctuser' } });
        fireEvent.change(screen.getByLabelText(/Account Number/i), { target: { value: '12345' } });
        fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'correctpassword' } });
        fireEvent.click(screen.getByRole('button', { name: /login/i }));

        await waitFor(() => {
            const homeHeading = screen.getByRole('heading', { name: /Welcome to the Homepage!/i });
            expect(homeHeading).toBeInTheDocument();
        });
    });
});
