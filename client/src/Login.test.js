import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from './pages/Login';

describe('Login Component', () => {
    beforeEach(() => {
        jest.spyOn(window, 'alert').mockImplementation(() => {});
        jest.spyOn(global, 'fetch').mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue({ role: 'User' }),
        });
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

    test('allows user to fill and submit the form', async () => {
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'testUser' } });
        fireEvent.change(screen.getByLabelText('Account Number'), { target: { value: '123456' } });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });

        fireEvent.click(screen.getByRole('button', { name: /Login/i }));

        await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Login Successful'));
    });
});
