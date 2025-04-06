import React from 'react';
import { useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('token'); // Remove auth token
    localStorage.removeItem('firstName'); // Remove user data
    navigate('/login'); // Redirect to login page
  };

  return (
    <nav className="navbar">
      <div className="logo" onClick={() => navigate('/dashboard')}>
        <img src="/SOLZ.png" alt="Logo" />
      </div>
      <div className="nav-buttons">
        <button onClick={() => navigate('/profile')}>Profile</button>
        <button onClick={() => navigate('/medical-history')}>Medical History</button>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </div>
    </nav>
  );
}

export default Navbar;