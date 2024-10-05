
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Clear any previous errors

        try {
            const response = await fetch('http://localhost:5000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();
            if (data.token && (data.role === 'Admin' || data.role === 'Employee')) {
                // Store token and role
                localStorage.setItem('token', data.token);
                localStorage.setItem('role', data.role);

                // Redirect to Admin Dashboard
                alert('Admin Login Successful');
                navigate('/admin-dashboard');
            } else {
                setError('Login failed. You are not an admin/employee.');
            }
        } catch (err) {
            setError('An error occurred while trying to log in.');
        }
    };

    return (
        <div className="admin-login-container">
            <h2>Admin Login</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form className="admin-login-form" onSubmit={handleSubmit}>
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

export default AdminLogin;
