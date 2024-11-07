import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Login from './Pages/Login';
import EmployeeDashboard from './Pages/EmployeeDashboard';
import VerifyTransactions from './Pages/VerifyTransactions';

function App() {
  return (
   <Router>
    <Routes>
    <Route path="/" element={<Login />} />
    <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
    <Route path="/verify-transactions" element={<VerifyTransactions />} />
    </Routes>
   </Router>
  );
}

export default App;
