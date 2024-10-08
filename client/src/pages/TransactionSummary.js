import React, { useEffect, useState } from 'react';
import './TransactionSummary.css'; 

const TransactionSummary = () => {
    const [transactions, setTransactions] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const response = await fetch('https://localhost:5000/transactions', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include', // Include cookies in the request
                });

                const data = await response.json();
                if (response.ok) {
                    setTransactions(data);
                } else {
                    setError('Failed to fetch transactions.');
                }
            } catch (err) {
                setError('An error occurred while fetching transactions.');
            }
        };

        fetchTransactions();
    }, []);

    return (
        <div>
            <h2 className="page-title">Transaction Summary</h2>
            <div className="transaction-summary-container">
                {error && <p style={{ color: 'red' }}>{error}</p>}

                {transactions.length === 0 ? (
                    <p>No transactions to display.</p>
                ) : (
                    <form className="transaction-form">
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
                    </form>
                )}
            </div>
        </div>
    );
};

export default TransactionSummary;
