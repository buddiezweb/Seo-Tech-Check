// src/utils/advancedSeoChecks.js
import { STATUS } from './constants';

export async function runAdvancedChecks(data) {
  const { doc, url, pageData, robots, sitemap, linkValidation, resources, performanceData, lighthouse } = data;

  return {
    performance: analyzePerformance(performanceData, lighthouse),
    content: analyzeContent(doc, pageData),
    technical: analyzeTechnical(doc, url),
    structuredData: analyzeStructuredData(doc),
    security: analyzeSecurityHeaders(url),
    mobile: analyzeMobileFriendliness(doc),
    links: analyzeLinks(linkValidation),
    crawlability: analyzeCrawlability(robots, sitemap),
    summary: generateSummary(data)
  };
}

function analyzePerformance(performanceData, lighthouse) {
  const results = [];

  if (lighthouse && lighthouse.performance !== undefined) {
    results.push({
      name: 'Lighthouse Performance Score',
      status: lighthouse.performance >= 90 ? STATUS.PASS : lighthouse.performance >= 50 ? STATUS.WARN : STATUS.FAIL,
      message: `Performance score: ${lighthouse.performance}/100`,
      details: lighthouse.audits ? [
        `First Contentful Paint: ${lighthouse.audits['first-contentful-paint']?.displayValue || 'N/A'}`,
        `Largest Contentful Paint: ${lighthouse.audits['largest-contentful-paint']?.displayValue || 'N/A'}`,
        `Total Blocking Time: ${lighthouse.audits['total-blocking-time']?.displayValue || 'N/A'}`,
        `Cumulative Layout Shift: ${lighthouse.audits['cumulative-layout-shift']?.displayValue || 'N/A'}`,
        `Speed Index: ${lighthouse.audits['speed-index']?.displayValue || 'N/A'}`
      ] : ['Lighthouse data not available']
    });
  }

  if (performanceData.loadTime) {
    results.push({
      name: 'Page Load Time',
      status: performanceData.loadTime < 3000 ? STATUS.PASS : performanceData.loadTime < 6000 ? STATUS.WARN : STATUS.FAIL,
      message: `Page loaded in ${(performanceData.loadTime / 1000).toFixed(2)}s`,
      details: `Target: Under 3 seconds for optimal user experience`
    });
  }

  return results.length > 0 ? results : [{
    name: 'Performance Analysis',
    status: STATUS.WARN,
    message: 'Performance data not available',
    details: 'Unable to collect performance metrics'
  }];
}

function analyzeContent(doc, pageData) {
  const results = [];

  // Title check
  const title = doc.querySelector('title');
  const titleText = title ? title.textContent.trim() : '';

  if (!titleText) {
    results.push({
      name: 'Page Title',
      status: STATUS.FAIL,
      message: 'No title tag found',
      details: 'Add a descriptive title tag to your page'
    });
  } else if (titleText.length < 30) {
    results.push({
      name: 'Page Title',
      status: STATUS.WARN,
      message: `Title too short (${titleText.length} chars)`,
      details: `Current: "${titleText}". Recommended: 30-60 characters`
    });
  } else if (titleText.length > 60) {
    results.push({
      name: 'Page Title',
      status: STATUS.WARN,
      message: `Title too long (${titleText.length} chars)`,
      details: `Current: "${titleText}". Recommended: 30-60 characters`
    });
  } else {
    results.push({
      name: 'Page Title',
      status: STATUS.PASS,
      message: `Title is optimized (${titleText.length} chars)`,
      details: `"${titleText}"`
    });
  }

  // Meta description check
  const metaDesc = doc.querySelector('meta[name="description"]');
  const descContent = metaDesc ? metaDesc.getAttribute('content') : '';

  if (!descContent) {
    results.push({
      name: 'Meta Description',
      status: STATUS.FAIL,
      message: 'No meta description found',
      details: 'Add a meta description to improve click-through rates'
    });
  } else if (descContent.length < 120) {
    results.push({
      name: 'Meta Description',
      status: STATUS.WARN,
      message: `Description too short (${descContent.length} chars)`,
      details: `Recommended: 120-160 characters`
    });
  } else if (descContent.length > 160) {
    results.push({
      name: 'Meta Description',
      status: STATUS.WARN,
      message: `Description too long (${descContent.length} chars)`,
      details: `Recommended: 120-160 characters`
    });
  } else {
    results.push({
      name: 'Meta Description',
      status: STATUS.PASS,
      message: `Description is optimized (${descContent.length} chars)`,
      details: descContent
    });
  }

  // Content analysis
  const bodyText = doc.body?.textContent || '';
  const wordCount = bodyText.split(/\s+/).filter(word => word.length > 0).length;

  results.push({
    name: 'Content Length',
    status: wordCount > 300 ? STATUS.PASS : wordCount > 150 ? STATUS.WARN : STATUS.FAIL,
    message: `${wordCount} words found`,
    details: wordCount < 300 ? 'Consider adding more content for better SEO' : 'Good content length'
  });

  // Heading structure
  const h1s = doc.querySelectorAll('h1');
  if (h1s.length === 0) {
    results.push({
      name: 'H1 Heading',
      status: STATUS.FAIL,
      message: 'No H1 tag found',
      details: 'Add an H1 tag to define the main topic of your page'
    });
  } else if (h1s.length > 1) {
    results.push({
      name: 'H1 Heading',
      status: STATUS.WARN,
      message: `Multiple H1 tags found (${h1s.length})`,
      details: 'Use only one H1 tag per page'
    });
  } else {
    results.push({
      name: 'H1 Heading',
      status: STATUS.PASS,
      message: 'Single H1 tag found',
      details: h1s[0].textContent.trim()
    });
  }

  return results;
}

function analyzeTechnical(doc, url) {
  const results = [];

  // SSL check
  const isHttps = url?.startsWith('https://');
  results.push({
    name: 'SSL Certificate',
    status: isHttps ? STATUS.PASS : STATUS.FAIL,
    message: isHttps ? 'Site uses HTTPS' : 'Site is not using HTTPS',
    details: isHttps ? 'SSL encryption protects user data and improves SEO rankings' : 'Google prioritizes HTTPS sites in search results'
  });

  // Canonical URL
  const canonical = doc.querySelector('link[rel="canonical"]');
  if (canonical) {
    results.push({
      name: 'Canonical URL',
      status: STATUS.PASS,
      message: 'Canonical URL is set',
      details: canonical.getAttribute('href')
    });
  } else {
    results.push({
      name: 'Canonical URL',
      status: STATUS.WARN,
      message: 'No canonical URL found',
      details: 'Add a canonical URL to prevent duplicate content issues'
    });
  }

  // Language declaration
  const htmlLang = doc.documentElement.getAttribute('lang');
  if (htmlLang) {
    results.push({
      name: 'Language Declaration',
      status: STATUS.PASS,
      message: `Language set to "${htmlLang}"`,
      details: 'Helps search engines understand the content language'
    });
  } else {
    results.push({
      name: 'Language Declaration',
      status: STATUS.WARN,
      message: 'No language attribute found',
      details: 'Add lang attribute to the html tag'
    });
  }

  return results;
}

function analyzeStructuredData(doc) {
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
        const schemaType = jsonData['@type'] || 'Unknown';

        results.push({
          name: `Schema.org ${schemaType}`,
          status: STATUS.PASS,
          message: `Valid ${schemaType} schema found`,
          details: `Schema type: ${schemaType}`
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

function analyzeSecurityHeaders(url) {
  const results = [];

  // Basic HTTPS check
  if (url?.startsWith('https://')) {
    results.push({
      name: 'HTTPS Enabled',
      status: STATUS.PASS,
      message: 'Site is served over HTTPS',
      details: 'Secure connection established'
    });
  } else {
    results.push({
      name: 'HTTPS Enabled',
      status: STATUS.FAIL,
      message: 'Site is not using HTTPS',
      details: 'Implement SSL/TLS certificate for security'
    });
  }

  // Note about security headers
  results.push({
    name: 'Security Headers',
    status: STATUS.INFO,
    message: 'Security headers check requires server response analysis',
    details: [
      'Recommended headers:',
      '• X-Content-Type-Options: nosniff',
      '• X-Frame-Options: SAMEORIGIN',
      '• Content-Security-Policy',
      '• Strict-Transport-Security'
    ]
  });

  return results;
}

function analyzeMobileFriendliness(doc) {
  const results = [];

  // Check viewport meta tag
  const viewport = doc.querySelector('meta[name="viewport"]');
  if (viewport) {
    const content = viewport.getAttribute('content');
    const hasWidth = content.includes('width=device-width');
    const hasInitialScale = content.includes('initial-scale=1');

    results.push({
      name: 'Viewport Meta Tag',
      status: hasWidth && hasInitialScale ? STATUS.PASS : STATUS.FAIL,
      message: hasWidth && hasInitialScale ? 'Viewport is set correctly' : 'Viewport is not set correctly',
      details: hasWidth && hasInitialScale ? 'Good for mobile responsiveness' : 'Add width=device-width and initial-scale=1'
    });
  } else {
    results.push({
      name: 'Viewport Meta Tag',
      status: STATUS.FAIL,
      message: 'No viewport meta tag found',
      details: 'Add a viewport meta tag for mobile optimization'
    });
  }

  return results;
}

function analyzeLinks(linkValidation) {
  const results = [];

  if (linkValidation && linkValidation.length > 0) {
    linkValidation.forEach(link => {
      results.push({
        name: `Link: ${link.url}`,
        status: link.status === 'valid' ? STATUS.PASS : STATUS.FAIL,
        message: link.status === 'valid' ? 'Link is valid' : 'Link is broken',
        details: link.status === 'valid' ? 'Good link' : 'Check the link'
      });
    });
  } else {
    results.push({
      name: 'Links Validation',
      status: STATUS.WARN,
      message: 'No links to validate',
      details: 'Consider adding links for validation'
    });
  }

  return results;
}

function analyzeCrawlability(robots, sitemap) {
  const results = [];

  // Robots.txt analysis
  if (robots) {
    results.push({
      name: 'Robots.txt',
      status: STATUS.PASS,
      message: 'Robots.txt is accessible',
      details: 'Good for SEO'
    });
  } else {
    results.push({
      name: 'Robots.txt',
      status: STATUS.FAIL,
      message: 'Robots.txt is not accessible',
      details: 'Ensure robots.txt is present and accessible'
    });
  }

  // Sitemap analysis
  if (sitemap) {
    results.push({
      name: 'Sitemap',
      status: STATUS.PASS,
      message: 'Sitemap is accessible',
      details: 'Good for SEO'
    });
  } else {
    results.push({
      name: 'Sitemap',
      status: STATUS.FAIL,
      message: 'Sitemap is not accessible',
      details: 'Ensure sitemap is present and accessible'
    });
  }

  return results;
}

function generateSummary(data) {
  const summary = {
    performance: data.performance,
    content: data.content,
    technical: data.technical,
    structuredData: data.structuredData,
    security: data.security,
    mobile: data.mobile,
    links: data.links,
    crawlability: data.crawlability
  };

  return summary;
}
