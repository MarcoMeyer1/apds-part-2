import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import "./Login.css";

const Login = () => {
    const [username, setUsername] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [captchaVerified, setCaptchaVerified] = useState(false); 

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        if (!captchaVerified) {
            setErrorMessage('Please complete the CAPTCHA before logging in.');
            return;
        }
    
        try {
            const response = await fetch('https://localhost:5000/employee-login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ username, accountNumber, password }),
            });
    
            if (response.ok) {
                const data = await response.json();
                alert('Login Successful');
                if (data.role === 'Employee') {
                    window.location.href = '/employee-dashboard';
                }
            } else {
                const errorData = await response.text();
                setErrorMessage(errorData || 'Login Failed');
            }
        } catch (error) {
            setErrorMessage('An error occurred. Please try again later.');
        }
    };

    const handleCaptchaChange = (value) => {
        setCaptchaVerified(!!value); 
        setErrorMessage(''); 
    };

    return (
        <div className="login-page">
            {/* Blue Gradient Background */}
            <div className="gradient-background"></div>

            {/* Login Form */}
            <div className="login-container">
                <form className="login-form" onSubmit={handleSubmit}>
                    <h2>Login</h2>

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
                        <label>Employee Number</label>
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
                        <ReCAPTCHA
                            sitekey="6LfxHHoqAAAAAF8x9aq_SRF1R2DZi7qfztobKRXc"
                            onChange={handleCaptchaChange}
                        />
                    </div>

                    <button type="submit" disabled={!captchaVerified}>Login</button>
                </form>
            </div>
        </div>
    );
};

export default Login;
