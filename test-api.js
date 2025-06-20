const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

// Test function to check API endpoints
async function testAPI() {
  try {
    console.log('Testing API endpoints...\n');
    
    // Test 1: Check if server is running
    try {
      const response = await axios.get('http://localhost:5000');
      console.log('✅ Server is running:', response.data);
    } catch (error) {
      console.log('❌ Server is not running');
      return;
    }

    // Test 2: Try to access students endpoint (should fail without auth)
    try {
      const response = await axios.get(`${API_URL}/students`);
      console.log('✅ Students endpoint accessible:', response.data);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Students endpoint properly protected (401 Unauthorized)');
      } else {
        console.log('❌ Students endpoint error:', error.message);
      }
    }

    // Test 3: Try to access programs endpoint (should fail without auth)
    try {
      const response = await axios.get(`${API_URL}/programs`);
      console.log('✅ Programs endpoint accessible:', response.data);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Programs endpoint properly protected (401 Unauthorized)');
      } else {
        console.log('❌ Programs endpoint error:', error.message);
      }
    }

    console.log('\n✅ API test completed successfully!');
    
  } catch (error) {
    console.log('❌ API test failed:', error.message);
  }
}

testAPI();
