import React, { useEffect, useState } from 'react';
import './VerifyTransactions.css';

const VerifyTransactions = () => {
    const [pendingTransactions, setPendingTransactions] = useState([]);
    const [verifiedTransactions, setVerifiedTransactions] = useState([]);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const response = await fetch('https://localhost:5000/api/employee/transactions', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                });

                const data = await response.json();
                if (response.ok) {
                    const pending = data.filter(transaction => !transaction.Verified);
                    const verified = data.filter(transaction => transaction.Verified);
                    setPendingTransactions(pending);
                    setVerifiedTransactions(verified);
                } else {
                    setError('Failed to fetch transactions.');
                }
            } catch (err) {
                setError('An error occurred while fetching transactions.');
            }
        };

        fetchTransactions();
    }, []);

    const handleVerify = async (transactionId, swiftCode) => {
        setError('');
        setSuccessMessage('');

        try {
            const response = await fetch(`https://localhost:5000/api/employee/transaction/verify/${transactionId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ swiftCode }),
            });

            if (response.ok) {
                setSuccessMessage(`Transaction ${transactionId} verified successfully.`);
                setPendingTransactions(pendingTransactions.filter(transaction => transaction.ID !== transactionId));
                const verifiedTransaction = pendingTransactions.find(transaction => transaction.ID === transactionId);
                setVerifiedTransactions([...verifiedTransactions, { ...verifiedTransaction, Verified: true }]);
            } else {
                const errorData = await response.text();
                setError(errorData || 'Verification failed.');
            }
        } catch (err) {
            setError('An error occurred during verification.');
        }
    };

    const handleUnverify = async (transactionId) => {
        setError('');
        setSuccessMessage('');

        try {
            const response = await fetch(`https://localhost:5000/api/employee/transaction/unverify/${transactionId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            if (response.ok) {
                setSuccessMessage(`Transaction ${transactionId} unverified successfully.`);
                setVerifiedTransactions(verifiedTransactions.filter(transaction => transaction.ID !== transactionId));
                const unverifiedTransaction = verifiedTransactions.find(transaction => transaction.ID === transactionId);
                setPendingTransactions([...pendingTransactions, { ...unverifiedTransaction, Verified: false }]);
            } else {
                const errorData = await response.text();
                setError(errorData || 'Unverification failed.');
            }
        } catch (err) {
            setError('An error occurred during unverification.');
        }
    };

    return (
        
        <div>
            <div className="gradient-background"></div>
            <h2 className="page-title">Verify Transactions</h2>

{/* Success message positioned above the tables */}
{successMessage && (
    <div className="success-message">
        <p>{successMessage}</p>
    </div>
)}

<div className="verify-transactions-container">
    {error && <p style={{ color: 'red' }}>{error}</p>}

    <div className="transactions-column">
        <h3>Pending Verification</h3>
        {pendingTransactions.length === 0 ? (
            <p>No pending transactions to display.</p>
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
                    {pendingTransactions.map((transaction) => (
                        <tr key={transaction.ID}>
                            <td>{transaction.Amount}</td>
                            <td>{transaction.Currency}</td>
                            <td>{transaction.Provider}</td>
                            <td>{transaction.SWIFTCode}</td>
                            <td>{new Date(transaction.CreatedAt).toLocaleDateString()}</td>
                            <td>
                                <button 
                                    onClick={() => handleVerify(transaction.ID, transaction.SWIFTCode)}
                                    className="verify-button"
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

    <div className="transactions-column">
    <h3>Pending Verification</h3>
    {pendingTransactions.length === 0 ? (
        <p>No pending transactions to display.</p>
    ) : (
        <div className="table-container">
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
                    {pendingTransactions.map((transaction) => (
                        <tr key={transaction.ID}>
                            <td>{transaction.Amount}</td>
                            <td>{transaction.Currency}</td>
                            <td>{transaction.Provider}</td>
                            <td>{transaction.SWIFTCode}</td>
                            <td>{new Date(transaction.CreatedAt).toLocaleDateString()}</td>
                            <td>
                                <button 
                                    onClick={() => handleVerify(transaction.ID, transaction.SWIFTCode)}
                                    className="verify-button"
                                >
                                    Verify
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )}
</div>
</div>
</div>
    );
};

export default VerifyTransactions;
