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
        setErrorMessage(''); 

        if (password !== confirmPassword) {
            setErrorMessage('Passwords do not match');
            return;
        }

        try {
            const response = await fetch('https://localhost:5000/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ fullName, username, idNumber, accountNumber, password }),
            });

            if (response.status === 201) {
                alert('Registration Successful');
                window.location.href = '/login';
            } else {
                const errorData = await response.text(); 
                setErrorMessage(errorData || 'Registration Failed');
            }
        } catch (error) {
            console.error('Error during registration:', error);
            setErrorMessage('An error occurred during registration. Please try again later.');
        }
    };

    return (
        <div className="register-container">
            <form className="register-form" onSubmit={handleSubmit}>
                <h2>Register</h2>

                {errorMessage && <div className="error-message">{errorMessage}</div>}


                <div className="form-group">
                    <label htmlFor="fullName">Full Name</label>
                    <input 
                        id="fullName"
                        type="text" 
                        value={fullName} 
                        onChange={(e) => setFullName(e.target.value)} 
                        required 
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input 
                        id="username"
                        type="text" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                        required 
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="idNumber">ID Number</label>
                    <input 
                        id="idNumber"
                        type="text" 
                        value={idNumber} 
                        onChange={(e) => setIdNumber(e.target.value)} 
                        required 
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="accountNumber">Account Number</label>
                    <input 
                        id="accountNumber"
                        type="text" 
                        value={accountNumber} 
                        onChange={(e) => setAccountNumber(e.target.value)} 
                        required 
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input 
                        id="password"
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input 
                        id="confirmPassword"
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
