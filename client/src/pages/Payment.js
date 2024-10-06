import React, { useState } from 'react';
import './Payment.css';

const Payment = () => {
    const [amount, setAmount] = useState('');
    const [currency, setCurrency] = useState('');
    const [provider, setProvider] = useState('');
    const [swiftCode, setSwiftCode] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // Ensure handleSubmit is defined correctly
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage(''); // Clear any previous error messages

        console.log('Submitting payment:', { amount, currency, provider, swiftCode });

        try {
            const response = await fetch('http://localhost:5000/payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Ensure cookies are included in the request
                body: JSON.stringify({ amount, currency, provider, swiftCode }),
            });

            if (response.ok) {
                alert('Payment Processed Successfully');
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

                {/* Display error message if any */}
                {errorMessage && <div className="error-message">{errorMessage}</div>}

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
