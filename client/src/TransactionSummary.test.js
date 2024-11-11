// src/pages/TransactionSummary.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import TransactionSummary from './pages/TransactionSummary';

describe('TransactionSummary Component', () => {
    test('renders transaction summary', () => {
        render(<TransactionSummary />);
        expect(screen.getByText(/Transaction Summary/i)).toBeInTheDocument();
    });

    test('displays message if no transactions', () => {
        render(<TransactionSummary />);
        expect(screen.getByText(/No transactions to display/i)).toBeInTheDocument();
    });
});
