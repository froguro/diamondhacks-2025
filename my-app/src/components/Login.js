const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const response = await fetch('http://localhost:3001/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    if (response.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('firstName', data.firstName);
      localStorage.setItem('username', username); // Add this line to store username
      navigate('/dashboard');
    } else {
      setError(data.message);
    }
  } catch (error) {
    setError('Error logging in');
  }
};