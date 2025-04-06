import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function SignUpPage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: '',
    country: '',
    stateProvince: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Input validation
    if (!username.trim() || !password.trim() || !firstName.trim() || !lastName.trim()) {
      setError('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, firstName, lastName }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        navigate('/dashboard');
      } else {
        switch (response.status) {
          case 400:
            setError(data.message || 'Invalid input data');
            break;
          case 409:
            setError('Username already exists');
            break;
          case 422:
            setError('Invalid username or password format');
            break;
          case 500:
            setError('Server error. Please try again later');
            break;
          default:
            setError(data.message || 'Registration failed');
        }
      }
    } catch (error) {
      if (!navigator.onLine) {
        setError('No internet connection. Please check your network');
      } else if (error.name === 'TypeError') {
        setError('Unable to connect to server. Please try again later');
      } else {
        console.error('Signup error:', error);
        setError('An unexpected error occurred. Please try again');
      }
    }
  };

  if (success) {
    return (
      <div className="signup-success">
        <h2>Account Successfully Created!</h2>
        <p>Redirecting to login page...</p>
      </div>
    );
  }

  return (
    <div className="signup-page">
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username:</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>First Name:</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Last Name:</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Date of Birth:</label>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Country:</label>
          <input
            type="text"
            name="country"
            value={formData.country}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>State/Province:</label>
          <input
            type="text"
            name="stateProvince"
            value={formData.stateProvince}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Sign Up</button>
        <button type="button" onClick={() => navigate('/')}>Back to Home</button>
      </form>
    </div>
  );
}

export default SignUpPage;