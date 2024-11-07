import React from 'react';
import { useNavigate } from 'react-router-dom';
import './EmployeeDashboard.css';

const EmployeeDashboard = () => {
    const navigate = useNavigate();

    const handleVerifyTransactions = () => {
        // Redirect to the transaction verification page
        navigate('/verify-transactions');
    };

    return (
        <div className="dashboard-container">
            <button onClick={handleVerifyTransactions} className="verify-button">
                Verify Transactions
            </button>
        </div>
    );
};

export default EmployeeDashboard;
