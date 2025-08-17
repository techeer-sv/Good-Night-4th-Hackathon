// Test the login API endpoint manually
async function testLoginEndpoint() {
  try {
    console.log('Testing login endpoint...');
    
    // Test valid credentials
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password'
      }),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('Success response:', data);
    } else {
      const error = await response.text();
      console.log('Error response:', error);
    }

    // Test invalid credentials
    console.log('\nTesting invalid credentials...');
    const invalidResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'wrongpassword'
      }),
    });

    console.log('Invalid response status:', invalidResponse.status);
    if (!invalidResponse.ok) {
      const errorData = await invalidResponse.json();
      console.log('Invalid response error:', errorData);
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
}

if (typeof window === 'undefined') {
  // Node.js environment
  testLoginEndpoint();
} else {
  // Browser environment - attach to window for manual testing
  window.testLoginEndpoint = testLoginEndpoint;
  console.log('Test function attached to window.testLoginEndpoint');
}
