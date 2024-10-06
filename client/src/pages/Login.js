import React, { useState } from 'react';
import './Register.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage(''); // Clear any previous error messages

        const response = await fetch('http://localhost:5000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // Important to send cookies with the request
            body: JSON.stringify({ username, accountNumber, password }),
        });

        if (response.ok) {
            const data = await response.json();
            // Optionally store role in localStorage
            localStorage.setItem('role', data.role);
            alert('Login Successful');

            if (data.role === 'Admin' || data.role === 'Employee') {
                window.location.href = '/admin-dashboard';
            } else {
                window.location.href = '/';
            }
        } else {
            // Get and display the specific error message from the server response
            const errorData = await response.text();
            setErrorMessage(errorData || 'Login Failed');
        }
    };

    return (
        <div className="register-container">
            <form className="register-form" onSubmit={handleSubmit}>
                <h2>Login</h2>

                {/* Display error message if any */}
                {errorMessage && <div className="error-message">{errorMessage}</div>}

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
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default Login;
