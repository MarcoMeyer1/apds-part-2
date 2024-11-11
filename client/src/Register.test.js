import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Register from './pages/Register';

describe('Register Component', () => {
    beforeEach(() => {
        jest.spyOn(window, 'alert').mockImplementation(() => {});
        jest.spyOn(global, 'fetch').mockResolvedValue({
            status: 201,
            text: jest.fn().mockResolvedValue(''),
        });
    });

    afterEach(() => {
        window.alert.mockRestore();
        global.fetch.mockRestore();
    });

    test('renders registration form title and button', () => {
        render(<Register />);
        
        expect(screen.getByRole('heading', { name: /Register/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Register/i })).toBeInTheDocument();
    });

    test('displays error if passwords do not match', () => {
        render(<Register />);

        fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: 'password123' } });
        fireEvent.change(screen.getByLabelText(/^Confirm Password$/i), { target: { value: 'differentPassword' } });

        fireEvent.click(screen.getByRole('button', { name: /Register/i }));

        expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
    });

    test('allows user to fill and submit the registration form', async () => {
        render(<Register />);

        fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Test User' } });
        fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'testuser' } });
        fireEvent.change(screen.getByLabelText(/ID Number/i), { target: { value: '12345678' } });
        fireEvent.change(screen.getByLabelText(/Account Number/i), { target: { value: '87654321' } });
        fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: 'password123' } });
        fireEvent.change(screen.getByLabelText(/^Confirm Password$/i), { target: { value: 'password123' } });

        fireEvent.click(screen.getByRole('button', { name: /Register/i }));

        await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Registration Successful'));
    });
});
