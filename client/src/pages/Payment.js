// src/pages/Payment.js
import React, { useState } from 'react';
import './Payment.css';

const Payment = () => {
    const [amount, setAmount] = useState('');
    const [currency, setCurrency] = useState('');
    const [provider, setProvider] = useState('');
    const [swiftCode, setSwiftCode] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await fetch('http://localhost:5000/payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ amount, currency, provider, swiftCode }),
        });

        if (response.ok) {
            alert('Payment Processed Successfully');
        } else {
            alert('Payment Failed');
        }
    };

    return (
        <div className="payment-container">
            <form className="payment-form" onSubmit={handleSubmit}>
                <h2>Make a Payment</h2>
                <div className="form-group">
                    <label>Amount</label>
                    <input 
                        type="number" 
                        value={amount} 
                        onChange={(e) => setAmount(e.target.value)} 
                        required 
                    />
                </div>
                <div className="form-group">
                    <label>Currency</label>
                    <input 
                        type="text" 
                        value={currency} 
                        onChange={(e) => setCurrency(e.target.value)} 
                        required 
                    />
                </div>
                <div className="form-group">
                    <label>Provider</label>
                    <input 
                        type="text" 
                        value={provider} 
                        onChange={(e) => setProvider(e.target.value)} 
                        required 
                    />
                </div>
                <div className="form-group">
                    <label>SWIFT Code</label>
                    <input 
                        type="text" 
                        value={swiftCode} 
                        onChange={(e) => setSwiftCode(e.target.value)} 
                        required 
                    />
                </div>
                <button type="submit">Submit Payment</button>
            </form>
        </div>
    );
};

export default Payment;
