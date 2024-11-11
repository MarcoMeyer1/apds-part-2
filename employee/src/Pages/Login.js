import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import "./Login.css";

const Login = () => {
    const [username, setUsername] = useState('');
    const [employeeNumber, setEmployeeNumber] = useState(''); // renamed from accountNumber
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
                body: JSON.stringify({ username, employeeNumber, password }),
            });

            if (response.ok) {
                const data = await response.json();
                alert('Login Successful');
                if (data.role === 'Employee') {
                    localStorage.setItem('username', username); 
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

    const handleButtonClick = (e) => {
        const button = e.currentTarget;

        const existingRipple = button.querySelector(".ripple");

        if (existingRipple) {
            existingRipple.remove();
        }

        const ripple = document.createElement("span");
        ripple.classList.add("ripple");

        const rect = button.getBoundingClientRect();
        const rippleSize = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - rippleSize / 2;
        const y = e.clientY - rect.top - rippleSize / 2;

        ripple.style.width = ripple.style.height = `${rippleSize}px`;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;

        button.appendChild(ripple);

        ripple.addEventListener("animationend", () => {
            ripple.remove();
        });
    };

    return (
        <div className="login-page">
            <div className="gradient-background"></div>

            <div className="login-container">
                <form className="login-form" onSubmit={handleSubmit}>
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
                        <label htmlFor="employeeNumber">Employee Number</label>
                        <input 
                            id="employeeNumber"
                            type="text" 
                            value={employeeNumber} 
                            onChange={(e) => setEmployeeNumber(e.target.value)} 
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
                        <ReCAPTCHA
                            sitekey="6LfxHHoqAAAAAF8x9aq_SRF1R2DZi7qfztobKRXc"
                            onChange={handleCaptchaChange}
                        />
                    </div>

                    <button type="submit" disabled={!captchaVerified} onClick={handleButtonClick}>
                       <span className="ripple"></span>
                       <span>Login</span>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
