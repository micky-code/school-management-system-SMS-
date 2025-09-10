import axios from 'axios';

// Test the authentication API directly
const testAuth = async () => {
  try {
    console.log('Testing login with srdvp/4747...');
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      username: 'srdvp',
      password: '4747'
    });
    
    console.log('Login successful!');
    console.log('Response:', response.data);
    
    // Store token in localStorage
    localStorage.setItem('token', response.data.token);
    console.log('Token stored in localStorage');
    
    // Set default auth header for future requests
    axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
    console.log('Default auth header set');
    
    return response.data;
  } catch (error) {
    console.error('Login failed:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// Export the test function
export default testAuth;
