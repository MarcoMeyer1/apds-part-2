import React, { useState } from 'react';
import './Register.css';

const Register = () => {
    const [fullName, setFullName] = useState('');
    const [username, setUsername] = useState('');
    const [idNumber, setIdNumber] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage(''); // Clear any previous error messages

        if (password !== confirmPassword) {
            setErrorMessage('Passwords do not match');
            return;
        }

        const response = await fetch('http://localhost:5000/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ fullName, username, idNumber, accountNumber, password }),
        });

        if (response.status === 201) {
            alert('Registration Successful');
        } else {
            // Try to get the specific error message from the response
            const errorData = await response.text(); // Use .text() to get the raw error message from the server
            setErrorMessage(errorData || 'Registration Failed');
        }
    };

    return (
        <div className="register-container">
            <form className="register-form" onSubmit={handleSubmit}>
                <h2>Register</h2>

                {/* Display error message if any */}
                {errorMessage && <div className="error-message">{errorMessage}</div>}


                <div className="form-group">
                    <label>Full Name</label>
                    <input 
                        type="text" 
                        value={fullName} 
                        onChange={(e) => setFullName(e.target.value)} 
                        required 
                    />
                </div>
                <div className="form-group">
                    <label>Username</label>
                    <input 
                        type="text" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                        required 
                    />
                </div>
                <div className="form-group">
                    <label>ID Number</label>
                    <input 
                        type="text" 
                        value={idNumber} 
                        onChange={(e) => setIdNumber(e.target.value)} 
                        required 
                    />
                </div>
                <div className="form-group">
                    <label>Account Number</label>
                    <input 
                        type="text" 
                        value={accountNumber} 
                        onChange={(e) => setAccountNumber(e.target.value)} 
                        required 
                    />
                </div>
                <div className="form-group">
                    <label>Password</label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                    />
                </div>
                <div className="form-group">
                    <label>Confirm Password</label>
                    <input 
                        type="password" 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                        required 
                    />
                </div>
                <button type="submit">Register</button>
            </form>
        </div>
    );
};

export default Register;
