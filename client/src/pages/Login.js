import React, { useState } from 'react';
import { Link } from 'react-router-dom'; 
import './Register.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');  // Clear any previous error messages

        try {
            const response = await fetch('https://localhost:5000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',  // Important to send cookies with the request
                body: JSON.stringify({ username, accountNumber, password }),
            });

            if (response.ok) {
                const data = await response.json();

                // Store role in localStorage
                localStorage.setItem('role', data.role);

                // Notify user of successful login
                alert('Login Successful');

                // Redirect based on user role
                if (data.role === 'Employee') {
                    window.location.href = '/employee-dashboard';
                } else {
                    window.location.href = '/home';
                }
            } else {
                // Handle errors
                const errorData = await response.text();
                setErrorMessage(errorData || 'Login Failed');
            }
        } catch (error) {
            // Handle network or fetch errors
            setErrorMessage('An error occurred. Please try again later.');
            console.error('Error during login:', error);
        }
    };

    return (
        <div className="register-container">
            <form className="register-form" onSubmit={handleSubmit}>
                <h2>Login</h2>

                {errorMessage && <div className="error-message">{errorMessage}</div>}

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
                    <p>Don't have an account? <Link to="/register">Register here!</Link></p>
                </div>

                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default Login;
