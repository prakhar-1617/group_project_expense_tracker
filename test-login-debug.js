const axios = require('axios');

async function testLogin() {
  try {
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'prakharkumarcse@gmail.com',
      password: '12345678'
    });
    console.log('Login Success:', response.data);
  } catch (error) {
    console.error('Login Failed:', error.response ? error.response.data : error.message);
  }
}

testLogin();
