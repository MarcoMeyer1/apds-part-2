import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Login from './Pages/Login';

function App() {
  return (
   <Router>
    <Routes>
    <Route path="/" element={<Login />} />
    </Routes>
   </Router>
  );
}

export default App;
