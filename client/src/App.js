import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Payment from './pages/Payment'; 
import TransactionSummary from './pages/TransactionSummary';

import './App.css'; 

function Home() {
    return (
        <div className="home-container">
            <h2>Welcome to the Homepage!</h2>
            
            <div className="home-form">
            <p>Please login or register if you don't already have an account!</p>
                <div className="home-buttons">
                    <Link to="/login">
                        <button>Login</button>
                    </Link>
                    <Link to="/register">
                        <button>Register</button>
                    </Link>
                    <Link to="/payment">
                        <button>Payment</button>
                    </Link>
                    <Link to="/transactionSummary">
                        <button>Transaction Summary</button>
                    </Link>
                 
                        

                </div>
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
                    <Route path="/payment" element={<Payment />} />
                   
                    <Route path="/transactionSummary" element={<TransactionSummary />} /> {/* Transaction Summary */}
                
                </Routes>
            </div>
        </Router>
    );
}

export default App;