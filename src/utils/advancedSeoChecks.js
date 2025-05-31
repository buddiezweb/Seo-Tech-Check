import { STATUS } from './constants';

export async function runAdvancedChecks(data) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(data.html, 'text/html');

  return {
    // Core Web Vitals from Lighthouse
    performance: analyzePerformance(data),
    
    // Advanced content analysis
    content: analyzeContent(doc, data),
    
    // Technical SEO
    technical: analyzeTechnical(doc, data),
    
    // Structured Data validation
    structuredData: analyzeStructuredData(doc, data),
    
    // Security analysis
    security: analyzeSecurityHeaders(data),
    
    // Mobile-friendliness
    mobile: analyzeMobileFriendliness(doc, data),
    
    // Summary and recommendations
    summary: generateSummaryAndRecommendations(data)
  };
}

function analyzePerformance(data) {
  const lighthouse = data.lighthouse || {};
  const metrics = data.performanceData?.metrics || {};
  
  return [
    {
      name: 'Lighthouse Performance Score',
      status: lighthouse.performance >= 90 ? STATUS.PASS : lighthouse.performance >= 50 ? STATUS.WARN : STATUS.FAIL,
      message: `Performance score: ${lighthouse.performance || 0}/100`,
      details: lighthouse.audits ? [
        `First Contentful Paint: ${lighthouse.audits['first-contentful-paint']?.displayValue || 'N/A'}`,
        `Largest Contentful Paint: ${lighthouse.audits['largest-contentful-paint']?.displayValue || 'N/A'}`,
        `Total Blocking Time: ${lighthouse.audits['total-blocking-time']?.displayValue || 'N/A'}`,
        `Cumulative Layout Shift: ${lighthouse.audits['cumulative-layout-shift']?.displayValue || 'N/A'}`,
        `Speed Index: ${lighthouse.audits['speed-index']?.displayValue || 'N/A'}`
      ] : ['Lighthouse data not available']
    },
    {
      name: 'Page Load Time',
      status: data.loadTime < 3000 ? STATUS.PASS : data.loadTime < 6000 ? STATUS.WARN : STATUS.FAIL,
      message: `Page loaded in ${(data.loadTime / 1000).toFixed(2)}s`,
      details: `Target: Under 3 seconds for optimal user experience`
    }
  ];
}

function analyzeContent(doc, data) {
  const bodyText = doc.body?.textContent || '';
  const wordCount = bodyText.split(/\s+/).filter(word => word.length > 0).length;
  const paragraphs = doc.querySelectorAll('p');
  const sentences = bodyText.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  // Calculate readability score (simplified Flesch Reading Ease)
  const avgWordsPerSentence = sentences.length > 0 ? wordCount / sentences.length : 0;
  const avgSyllablesPerWord = 1.5; // Simplified estimation
  const readabilityScore = 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;
  
  return [
    {
      name: 'Content Length',
      status: wordCount > 300 ? STATUS.PASS : wordCount > 150 ? STATUS.WARN : STATUS.FAIL,
      message: `${wordCount} words found`,
      details: [
        `Paragraphs: ${paragraphs.length}`,
        `Sentences: ${sentences.length}`,
        `Average words per sentence: ${avgWordsPerSentence.toFixed(1)}`
      ]
    },
    {
      name: 'Readability Score',
      status: readabilityScore > 60 ? STATUS.PASS : readabilityScore > 30 ? STATUS.WARN : STATUS.FAIL,
      message: `Flesch Reading Ease: ${readabilityScore.toFixed(1)}/100`,
      details: [
        'Score interpretation:',
        '90-100: Very easy to read',
        '60-70: Easy to read',
        '30-50: Fairly difficult',
        '0-30: Very difficult'
      ]
    }
  ];
}

function analyzeTechnical(doc, data) {
  const results = [];
  
  // Validate and normalize URL
  let urlObj;
  try {
    // Add protocol if missing
    let normalizedUrl = data.url;
    if (normalizedUrl && !normalizedUrl.match(/^https?:\/\//i)) {
      normalizedUrl = 'https://' + normalizedUrl;
    }
    
    urlObj = new URL(normalizedUrl);
    
    // Check SSL
    const isHttps = urlObj.protocol === 'https:';
    results.push({
      name: 'SSL Certificate',
      status: isHttps ? STATUS.PASS : STATUS.FAIL,
      message: isHttps ? 'Site uses HTTPS' : 'Site is not using HTTPS',
      details: isHttps ? 'SSL encryption protects user data and improves SEO rankings' : 'Google prioritizes HTTPS sites in search results'
    });

    // Check for www/non-www consistency
    const hasWww = urlObj.hostname.startsWith('www.');
    results.push({
      name: 'URL Consistency',
      status: STATUS.PASS,
      message: hasWww ? 'Using www version' : 'Using non-www version',
      details: 'Ensure consistent use of www or non-www across your site'
    });
  } catch (error) {
    results.push({
      name: 'URL Analysis',
      status: STATUS.FAIL,
      message: 'Invalid URL format',
      details: 'Please ensure the URL is properly formatted (e.g., https://example.com)'
    });
  }

  return results;
}

function analyzeStructuredData(doc, data) {
  const results = [];
  const scripts = doc.querySelectorAll('script[type="application/ld+json"]');
  
  if (scripts.length === 0) {
    results.push({
      name: 'Structured Data',
      status: STATUS.WARN,
      message: 'No structured data found',
      details: 'Add Schema.org markup to help search engines understand your content'
    });
  } else {
    scripts.forEach((script, index) => {
      try {
        const jsonData = JSON.parse(script.textContent);
        const schemaType = jsonData['@type'];
        
        results.push({
          name: `Schema.org ${schemaType || 'Unknown'}`,
          status: STATUS.PASS,
          message: `Valid ${schemaType || 'Unknown'} schema found`,
          details: [`Schema type: ${schemaType || 'Unknown'}`]
        });
      } catch (e) {
        results.push({
          name: `Structured Data #${index + 1}`,
          status: STATUS.FAIL,
          message: 'Invalid JSON-LD syntax',
          details: `Error: ${e.message}`
        });
      }
    });
  }

  return results;
}

function analyzeSecurityHeaders(data) {
  // In real implementation, you'd check response headers
  return [
    {
      name: 'Security Headers',
      status: STATUS.WARN,
      message: 'Security headers check requires server response analysis',
      details: [
        'Recommended headers:',
        'X-Content-Type-Options: nosniff',
        'X-Frame-Options: SAMEORIGIN',
        'Content-Security-Policy',
        'Strict-Transport-Security'
      ]
    }
  ];
}

function analyzeMobileFriendliness(doc, data) {
  const results = [];
  
  // Check mobile viewport
  const viewport = doc.querySelector('meta[name="viewport"]');
  const hasProperViewport = viewport && viewport.content.includes('width=device-width');
  
  results.push({
    name: 'Mobile Viewport',
    status: hasProperViewport ? STATUS.PASS : STATUS.FAIL,
    message: hasProperViewport ? 'Proper mobile viewport set' : 'Missing or incorrect viewport meta tag',
    details: viewport ? `Current: ${viewport.content}` : 'Add <meta name="viewport" content="width=device-width, initial-scale=1">'
  });

  return results;
}

function generateSummaryAndRecommendations(data) {
  const allChecks = Object.values(data).flat().filter(item => item && item.status);
  const passCount = allChecks.filter(check => check.status === STATUS.PASS).length;
  const warnCount = allChecks.filter(check => check.status === STATUS.WARN).length;
  const failCount = allChecks.filter(check => check.status === STATUS.FAIL).length;
  
  const score = allChecks.length > 0 ? Math.round((passCount / allChecks.length) * 100) : 0;
  
  const recommendations = [];
  
  if (failCount > 0) {
    recommendations.push(`Fix ${failCount} critical issues for better SEO`);
  }
  
  if (!data.isHttps) {
    recommendations.push('Implement HTTPS for security and SEO benefits');
  }
  
  return [{
    name: 'Overall SEO Score',
    status: score >= 80 ? STATUS.PASS : score >= 60 ? STATUS.WARN : STATUS.FAIL,
    message: `${score}% - ${passCount} passed, ${warnCount} warnings, ${failCount} failed`,
    details: [
      'Top recommendations:',
      ...recommendations
    ]
  }];
}
