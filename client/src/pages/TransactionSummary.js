// src/pages/TransactionSummary.js
import React, { useEffect, useState } from 'react';

const TransactionSummary = () => {
    const [transactions, setTransactions] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTransactions = async () => {
            const token = localStorage.getItem('token');

            try {
                const response = await fetch('http://localhost:5000/transactions', {  // Use the new /transactions route
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,  // Pass token in Authorization header
                    },
                });

                const data = await response.json();
                if (response.ok) {
                    setTransactions(data);  // Set the transactions
                } else {
                    setError('Failed to fetch transactions.');
                }
            } catch (err) {
                setError('An error occurred while fetching transactions.');
            }
        };

        fetchTransactions();  // Fetch the transactions for the logged-in user
    }, []);

    return (
        <div className="transaction-summary-container">
            <h2>Transaction Summary</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {transactions.length === 0 ? (
                <p>No transactions to display.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Amount</th>
                            <th>Currency</th>
                            <th>Provider</th>
                            <th>SWIFT Code</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((transaction) => (
                            <tr key={transaction.ID}>
                                <td>{transaction.Amount}</td>
                                <td>{transaction.Currency}</td>
                                <td>{transaction.Provider}</td>
                                <td>{transaction.SWIFTCode}</td>
                                <td>{new Date(transaction.CreatedAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default TransactionSummary;
