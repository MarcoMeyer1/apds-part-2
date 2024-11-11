import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Payment from './pages/Payment';

describe('Payment Component', () => {
    beforeEach(() => {
        jest.spyOn(window, 'alert').mockImplementation(() => {});
        jest.spyOn(global, 'fetch').mockResolvedValue({
            ok: true,
            text: jest.fn().mockResolvedValue(''),
        });
    });

    afterEach(() => {
        window.alert.mockRestore();
        global.fetch.mockRestore();
    });

    test('renders payment form title and button', () => {
        render(<Payment />);
        
        expect(screen.getByRole('heading', { name: /Make a Payment/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Submit Payment/i })).toBeInTheDocument();
    });

    test('allows user to fill and submit the payment form', async () => {
        render(<Payment />);

        fireEvent.change(screen.getByLabelText(/Amount/i), { target: { value: '100' } });
        fireEvent.change(screen.getByLabelText(/Currency/i), { target: { value: 'USD' } });
        fireEvent.change(screen.getByLabelText(/Provider/i), { target: { value: 'Bank' } });
        fireEvent.change(screen.getByLabelText(/SWIFT Code/i), { target: { value: 'ABC12345' } });

        fireEvent.click(screen.getByRole('button', { name: /Submit Payment/i }));

        await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Payment Processed Successfully'));
    });
});
