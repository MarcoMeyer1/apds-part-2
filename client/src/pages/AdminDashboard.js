// src/pages/AdminDashboard.js
import React, { useEffect, useState } from 'react';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        const fetchTransactions = async () => {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/admin/transactions', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            const data = await response.json();
            setTransactions(data);
        };
        fetchTransactions();
    }, []);

    const handleVerify = async (transactionId, swiftCode) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/verify-transaction/${transactionId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ swiftCode }),
        });

        if (response.ok) {
            alert('Transaction Verified');
            setTransactions(transactions.filter(t => t.ID !== transactionId));
        } else {
            alert('Verification Failed');
        }
    };

    return (
        <div className="admin-dashboard-container">
            <h2>Admin Dashboard</h2>
            {transactions.length === 0 ? (
                <p>No transactions to verify.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Amount</th>
                            <th>Currency</th>
                            <th>Provider</th>
                            <th>SWIFT Code</th>
                            <th>Date</th>
                            <th>Action</th>
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
                                <td>
                                    <button 
                                        onClick={() => handleVerify(transaction.ID, transaction.SWIFTCode)}
                                    >
                                        Verify
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default AdminDashboard;
