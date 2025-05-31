const axios = require('axios');

async function testServer() {
  const API_URL = 'http://localhost:3001';
  
  console.log('Testing server endpoints...\n');
  
  // 1. Test health endpoint
  try {
    console.log('1. Testing health endpoint...');
    const health = await axios.get(`${API_URL}/api/health`);
    console.log('✅ Health check:', health.data);
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
  }
  
  // 2. Test registration endpoint
  try {
    console.log('\n2. Testing registration endpoint...');
    const testUser = {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'password123'
    };
    
    console.log('Sending:', testUser);
    
    const response = await axios.post(`${API_URL}/api/auth/register`, testUser);
    console.log('✅ Registration successful:', response.data);
  } catch (error) {
    console.log('❌ Registration failed:', error.response?.data || error.message);
  }
}

testServer();
