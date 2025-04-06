import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './components/MainPage';
import LoginPage from './components/LoginPage';
import SignUpPage from './components/SignUpPage';
import ForgotPassword from './components/ForgotPassword';
import Dashboard from './components/Dashboard';  // Add this import
import './App.css';  // Add this import statement
import Profile from './components/Profile';  // Add this import
import MedicalHistory from './components/MedicalHistory';  // Add this import


function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/dashboard" element={<Dashboard />} />  {/* Add this route */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/medical-history" element={<MedicalHistory />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;