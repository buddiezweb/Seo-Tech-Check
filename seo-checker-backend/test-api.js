const axios = require('axios');

const API_URL = 'http://localhost:3001';

async function testAPI() {
  try {
    // Test health check
    console.log('Testing health check...');
    const health = await axios.get(`${API_URL}/api/health`);
    console.log('Health:', health.data);

    // Test analyze endpoint
    console.log('\nTesting analyze endpoint...');
    const analyzeResult = await axios.post(`${API_URL}/api/analyze`, {
      url: 'https://example.com'
    });
    console.log('Analyze result:', {
      url: analyzeResult.data.url,
      title: analyzeResult.data.pageTitle,
      loadTime: analyzeResult.data.loadTime,
      performanceScore: analyzeResult.data.lighthouse.performance
    });

    // Test robots.txt
    console.log('\nTesting robots.txt...');
    const robotsResult = await axios.get(`${API_URL}/api/robots?url=https://example.com`);
    console.log('Robots.txt:', robotsResult.data);

    // Test sitemap
    console.log('\nTesting sitemap...');
    const sitemapResult = await axios.get(`${API_URL}/api/sitemap?url=https://example.com`);
    console.log('Sitemap:', sitemapResult.data);

    console.log('\nAll tests passed!');
  } catch (error) {
    console.error('Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testAPI();
