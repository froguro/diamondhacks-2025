import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [username, setUsername] = useState('');  // Changed from email
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    // Input validation
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    try {
      const response = await fetch('https://diamondhacks-2025.onrender.com/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),  // Changed from email
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        navigate('/dashboard');
      } else {
        // Handle specific error cases
        switch (response.status) {
          case 400:
            setError(data.message || 'Invalid username or password');
            break;
          case 401:
            setError('Unauthorized access');
            break;
          case 429:
            setError('Too many login attempts. Please try again later');
            break;
          case 500:
            setError('Server error. Please try again later');
            break;
          default:
            setError(data.message || 'Login failed');
        }
      }
    } catch (error) {
      // Handle network and connection errors
      if (!navigator.onLine) {
        setError('No internet connection. Please check your network');
      } else if (error.name === 'TypeError') {
        setError('Unable to connect to server. Please try again later');
      } else {
        console.error('Login error:', error);
        setError('An unexpected error occurred. Please try again');
      }
    }
  };

  return (
    <div className="login-page">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        {error && <p className="error-message">{error}</p>}
        <div>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
        <button type="button" onClick={() => navigate('/')}>Back to Home</button>
        <p>
          <a href="/forgot-password">Forgot Password?</a>
        </p>
      </form>
    </div>
  );
}

export default LoginPage;