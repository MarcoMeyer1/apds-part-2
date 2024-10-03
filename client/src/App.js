import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';

function Home() {
    return (
        <div>
            <h2>Welcome to the Homepage!</h2>
            <p>This is a simple homepage for navigating to the Register and Login pages.</p>
            <div>
                <Link to="/login">
                    <button>Go to Login</button>
                </Link>
                <Link to="/register" style={{ marginLeft: '10px' }}>
                    <button>Go to Register</button>
                </Link>
            </div>
        </div>
    );
}

function App() {
    return (
        <Router>
            <div>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
