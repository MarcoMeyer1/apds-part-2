import React, { useState } from 'react';
import './Payment.css';

const Payment = () => {
    const [amount, setAmount] = useState('');
    const [currency, setCurrency] = useState('');
    const [provider, setProvider] = useState('');
    const [swiftCode, setSwiftCode] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage(''); // Clear any previous error messages
    
        try {
            const response = await fetch('https://localhost:5000/payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Include cookies with the request
                body: JSON.stringify({ amount, currency, provider, swiftCode }),
            });
    
            if (response.ok) {
                alert('Payment Processed Successfully');
                window.location.href = '/home';
            } else {
                const errorData = await response.text();
                setErrorMessage(errorData || 'Payment Failed');
            }
        } catch (error) {
            console.error('Error during payment processing:', error);
            setErrorMessage('Payment failed due to an error. Please try again later.');
        }
    };
    

    return (
        <div className="payment-container">
            <form className="payment-form" onSubmit={handleSubmit}>
                <h2>Make a Payment</h2>

                {errorMessage && <div className="error-message">{errorMessage}</div>}

                <div className="form-group">
                    <label htmlFor="amount">Amount</label>
                    <input 
                        id="amount"
                        type="number" 
                        value={amount} 
                        onChange={(e) => setAmount(e.target.value)} 
                        required 
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="currency">Currency</label>
                    <input 
                        id="currency"
                        type="text" 
                        value={currency} 
                        onChange={(e) => setCurrency(e.target.value)} 
                        required 
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="provider">Provider</label>
                    <input 
                        id="provider"
                        type="text" 
                        value={provider} 
                        onChange={(e) => setProvider(e.target.value)} 
                        required 
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="swiftCode">SWIFT Code</label>
                    <input 
                        id="swiftCode"
                        type="text" 
                        value={swiftCode} 
                        onChange={(e) => setSwiftCode(e.target.value.toUpperCase())} 
                        required 
                    />
                </div>
                <button type="submit">Submit Payment</button>
            </form>
        </div>
    );
};

export default Payment;
