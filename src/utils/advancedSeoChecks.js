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
    hreflang: analyzeHreflangTags(doc),
    mixedContent: analyzeMixedContent(doc),
    socialMeta: analyzeSocialMetaTags(doc),
    excessiveRedirects: analyzeExcessiveRedirects(data.redirectChains),
    blockedResources: analyzeBlockedResources(resources),
    urlParameters: analyzeUrlParameters(url),
    trailingSlash: analyzeTrailingSlashDuplication(data.allPages),
    robotsMeta: analyzeRobotsMetaTags(doc),
    amp: analyzeAmpTags(doc),
    sitemapEntries: analyzeSitemapEntries(sitemap),
    structuredDataTypes: analyzeStructuredDataTypes(doc),
    hreflangXDefault: analyzeHreflangXDefault(doc),
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

// New function to detect orphan pages and pages with no incoming internal links
function analyzeOrphanPages(allPages = [], internalLinks = []) {
  const results = [];

  if (allPages.length === 0) {
    results.push({
      name: 'Orphan Pages',
      status: STATUS.INFO,
      message: 'No pages data available to analyze orphan pages',
    });
    return results;
  }

  // Map URLs to count incoming internal links
  const incomingLinksCount = {};
  allPages.forEach(page => {
    incomingLinksCount[page.url] = 0;
  });

  internalLinks.forEach(link => {
    if (incomingLinksCount.hasOwnProperty(link.target)) {
      incomingLinksCount[link.target]++;
    }
  });

  // Find orphan pages (no incoming internal links)
  const orphanPages = Object.entries(incomingLinksCount)
    .filter(([url, count]) => count === 0)
    .map(([url]) => url);

  if (orphanPages.length === 0) {
    results.push({
      name: 'Orphan Pages',
      status: STATUS.PASS,
      message: 'No orphan pages detected',
    });
  } else {
    results.push({
      name: 'Orphan Pages',
      status: STATUS.WARN,
      message: `${orphanPages.length} orphan pages detected`,
      details: orphanPages.slice(0, 10)
    });
  }

  return results;
}

// New function to detect duplicate content groups
function analyzeDuplicateContent(allPages = []) {
  const results = [];

  if (allPages.length === 0) {
    results.push({
      name: 'Duplicate Content',
      status: STATUS.INFO,
      message: 'No pages data available to analyze duplicate content',
    });
    return results;
  }

  const duplicatesMap = {};
  allPages.forEach(p => {
    if (!p.contentDigest) return;
    if (!duplicatesMap[p.contentDigest]) {
      duplicatesMap[p.contentDigest] = [];
    }
    duplicatesMap[p.contentDigest].push(p.url);
  });

  const duplicates = Object.entries(duplicatesMap)
    .filter(([, urls]) => urls.length > 1)
    .map(([digest, urls]) => ({
      contentDigest: digest,
      urls
    }));

  if (duplicates.length === 0) {
    results.push({
      name: 'Duplicate Content',
      status: STATUS.PASS,
      message: 'No duplicate content detected'
    });
  } else {
    duplicates.forEach((dup, index) => {
      results.push({
        name: `Duplicate Content Group ${index + 1}`,
        status: STATUS.FAIL,
        message: `Same content found on ${dup.urls.length} pages`,
        details: dup.urls
      });
    });
  }

  return results;
}

// New function to analyze pagination and crawl depth issues
function analyzePaginationAndCrawlDepth(doc, allPages = []) {
  const results = [];

  // Pagination rel tags check
  const relPrev = doc.querySelector('link[rel="prev"]');
  const relNext = doc.querySelector('link[rel="next"]');

  if (!relPrev && !relNext) {
    results.push({
      name: 'Pagination Tags',
      status: STATUS.WARN,
      message: 'No pagination rel tags found',
      details: 'Add rel="prev" and rel="next" link tags for paginated content'
    });
  } else {
    results.push({
      name: 'Pagination Tags',
      status: STATUS.PASS,
      message: 'Pagination rel tags found',
      details: {
        prev: relPrev ? relPrev.getAttribute('href') : null,
        next: relNext ? relNext.getAttribute('href') : null
      }
    });
  }

  // Crawl depth analysis (simple heuristic based on URL path depth)
  if (allPages.length > 0) {
    const maxDepth = Math.max(...allPages.map(p => (new URL(p.url).pathname.split('/').filter(Boolean).length)));
    results.push({
      name: 'Crawl Depth',
      status: maxDepth <= 5 ? STATUS.PASS : STATUS.WARN,
      message: `Maximum crawl depth is ${maxDepth}`,
      details: 'Recommended crawl depth is 5 or less for better SEO'
    });
  } else {
    results.push({
      name: 'Crawl Depth',
      status: STATUS.INFO,
      message: 'No pages data available to analyze crawl depth'
    });
  }

  return results;
}

// Enhanced redirect chains and loops detection with additional warnings and info
function analyzeRedirectChains(redirectChains) {
  const results = [];
  if (!Array.isArray(redirectChains) || redirectChains.length === 0) {
    results.push({
      name: 'Redirect Chains',
      status: STATUS.PASS,
      message: 'No redirect chains detected',
      details: 'No redirects found during page load'
    });
    return results;
  }

  let hasLongChain = false;
  let hasLoop = false;
  const loopChains = [];

  redirectChains.forEach((chain, index) => {
    if (chain.length > 3) {
      hasLongChain = true;
      results.push({
        name: `Redirect Chain #${index + 1}`,
        status: STATUS.WARN,
        message: `Long redirect chain detected (${chain.length} redirects)`,
        details: chain.join(' -> ')
      });
    } else if (chain.length > 1) {
      results.push({
        name: `Redirect Chain #${index + 1}`,
        status: STATUS.INFO,
        message: `Redirect chain detected (${chain.length} redirects)`,
        details: chain.join(' -> ')
      });
    }

    // Check for loops (repeated URLs)
    const uniqueUrls = new Set(chain);
    if (uniqueUrls.size !== chain.length) {
      hasLoop = true;
      loopChains.push(chain);
      results.push({
        name: `Redirect Loop #${index + 1}`,
        status: STATUS.FAIL,
        message: 'Redirect loop detected',
        details: chain.join(' -> ')
      });
    }
  });

  if (!hasLongChain && !hasLoop) {
    results.push({
      name: 'Redirect Chains',
      status: STATUS.PASS,
      message: 'No problematic redirect chains or loops detected',
      details: `Total redirect chains checked: ${redirectChains.length}`
    });
  }

  return results;
}

function analyzeTechnical(doc, url, redirectChains = []) {
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

  // Redirect chains analysis
  const redirectResults = analyzeRedirectChains(redirectChains);
  results.push(...redirectResults);

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

// New function to validate hreflang tags
function analyzeHreflangTags(doc) {
  const results = [];
  const hreflangLinks = doc.querySelectorAll('link[rel="alternate"][hreflang]');
  if (hreflangLinks.length === 0) {
    results.push({
      name: 'Hreflang Tags',
      status: STATUS.WARN,
      message: 'No hreflang tags found',
      details: 'Add hreflang tags to specify language and regional targeting'
    });
  } else {
    const hreflangValues = Array.from(hreflangLinks).map(link => link.getAttribute('hreflang'));
    const duplicates = hreflangValues.filter((item, index) => hreflangValues.indexOf(item) !== index);
    if (duplicates.length > 0) {
      results.push({
        name: 'Hreflang Tags',
        status: STATUS.FAIL,
        message: 'Duplicate hreflang values found',
        details: duplicates
      });
    } else {
      results.push({
        name: 'Hreflang Tags',
        status: STATUS.PASS,
        message: 'Valid hreflang tags found',
        details: hreflangValues
      });
    }
  }
  return results;
}

// New function to detect mixed content warnings
function analyzeMixedContent(doc) {
  const results = [];
  const mixedContentElements = Array.from(doc.querySelectorAll('img[src^="http://"], script[src^="http://"], link[href^="http://"]'));
  if (mixedContentElements.length === 0) {
    results.push({
      name: 'Mixed Content',
      status: STATUS.PASS,
      message: 'No mixed content detected',
      details: 'All resources are loaded over HTTPS'
    });
  } else {
    results.push({
      name: 'Mixed Content',
      status: STATUS.FAIL,
      message: `${mixedContentElements.length} mixed content elements detected`,
      details: mixedContentElements.map(el => el.outerHTML).slice(0, 10)
    });
  }
  return results;
}

// New function to validate Open Graph and Twitter Card tags
function analyzeSocialMetaTags(doc) {
  const results = [];
  const ogTitle = doc.querySelector('meta[property="og:title"]');
  const ogDescription = doc.querySelector('meta[property="og:description"]');
  const twitterCard = doc.querySelector('meta[name="twitter:card"]');

  if (!ogTitle) {
    results.push({
      name: 'Open Graph Title',
      status: STATUS.WARN,
      message: 'Missing Open Graph title tag'
    });
  } else {
    results.push({
      name: 'Open Graph Title',
      status: STATUS.PASS,
      message: 'Open Graph title tag found',
      details: ogTitle.getAttribute('content')
    });
  }

  if (!ogDescription) {
    results.push({
      name: 'Open Graph Description',
      status: STATUS.WARN,
      message: 'Missing Open Graph description tag'
    });
  } else {
    results.push({
      name: 'Open Graph Description',
      status: STATUS.PASS,
      message: 'Open Graph description tag found',
      details: ogDescription.getAttribute('content')
    });
  }

  if (!twitterCard) {
    results.push({
      name: 'Twitter Card',
      status: STATUS.WARN,
      message: 'Missing Twitter Card tag'
    });
  } else {
    results.push({
      name: 'Twitter Card',
      status: STATUS.PASS,
      message: 'Twitter Card tag found',
      details: twitterCard.getAttribute('content')
    });
  }

  return results;
}

// New function to detect excessive redirects
function analyzeExcessiveRedirects(redirectChains) {
  const results = [];
  if (!Array.isArray(redirectChains) || redirectChains.length === 0) {
    results.push({
      name: 'Excessive Redirects',
      status: STATUS.PASS,
      message: 'No redirects detected'
    });
    return results;
  }

  const excessiveRedirects = redirectChains.filter(chain => chain.length > 5);
  if (excessiveRedirects.length === 0) {
    results.push({
      name: 'Excessive Redirects',
      status: STATUS.PASS,
      message: 'No excessive redirects detected'
    });
  } else {
    results.push({
      name: 'Excessive Redirects',
      status: STATUS.WARN,
      message: `${excessiveRedirects.length} excessive redirect chains detected`,
      details: excessiveRedirects.map(chain => chain.join(' -> ')).slice(0, 10)
    });
  }
  return results;
}

// New function to detect blocked JavaScript or CSS
function analyzeBlockedResources(resources) {
  const results = [];
  const blockedResources = resources.filter(r => r.status === 403 || r.status === 404);
  if (blockedResources.length === 0) {
    results.push({
      name: 'Blocked Resources',
      status: STATUS.PASS,
      message: 'No blocked JavaScript or CSS detected'
    });
  } else {
    results.push({
      name: 'Blocked Resources',
      status: STATUS.FAIL,
      message: `${blockedResources.length} blocked JavaScript or CSS resources detected`,
      details: blockedResources.map(r => r.url).slice(0, 10)
    });
  }
  return results;
}

// New function to detect URL parameters and session IDs
function analyzeUrlParameters(url) {
  const results = [];
  const urlObj = new URL(url);
  const params = Array.from(urlObj.searchParams.keys());
  const sessionParams = ['sessionid', 'phpsessid', 'jsessionid', 'sid', 'ssid'];
  const foundSessionParams = params.filter(p => sessionParams.includes(p.toLowerCase()));

  if (foundSessionParams.length === 0) {
    results.push({
      name: 'URL Parameters',
      status: STATUS.PASS,
      message: 'No session ID parameters found in URL'
    });
  } else {
    results.push({
      name: 'URL Parameters',
      status: STATUS.WARN,
      message: `Session ID parameters found: ${foundSessionParams.join(', ')}`,
      details: 'Session IDs in URLs can cause duplicate content issues'
    });
  }
  return results;
}

// New function to detect trailing slash URL duplication
function analyzeTrailingSlashDuplication(allPages = []) {
  const results = [];
  if (allPages.length === 0) {
    results.push({
      name: 'Trailing Slash Duplication',
      status: STATUS.INFO,
      message: 'No pages data available to analyze trailing slash duplication'
    });
    return results;
  }

  const urlSet = new Set();
  const duplicates = [];

  allPages.forEach(page => {
    const urlNoSlash = page.url.endsWith('/') ? page.url.slice(0, -1) : page.url;
    if (urlSet.has(urlNoSlash)) {
      duplicates.push(urlNoSlash);
    } else {
      urlSet.add(urlNoSlash);
    }
  });

  if (duplicates.length === 0) {
    results.push({
      name: 'Trailing Slash Duplication',
      status: STATUS.PASS,
      message: 'No trailing slash duplication detected'
    });
  } else {
    results.push({
      name: 'Trailing Slash Duplication',
      status: STATUS.WARN,
      message: `${duplicates.length} URLs with trailing slash duplication detected`,
      details: duplicates.slice(0, 10)
    });
  }
  return results;
}

// New function to validate robots meta tags
function analyzeRobotsMetaTags(doc) {
  const results = [];
  const metaRobots = doc.querySelector('meta[name="robots"]');
  if (!metaRobots) {
    results.push({
      name: 'Robots Meta Tags',
      status: STATUS.PASS,
      message: 'No robots meta tag found (page is indexable by default)'
    });
    return results;
  }

  const content = metaRobots.getAttribute('content').toLowerCase();
  const checks = [
    { name: 'nofollow', label: 'Meta Robots Nofollow' },
    { name: 'noindex', label: 'Meta Robots Noindex' },
    { name: 'noarchive', label: 'Meta Robots Noarchive' },
    { name: 'nosnippet', label: 'Meta Robots Nosnippet' },
    { name: 'noodp', label: 'Meta Robots Noodp' },
    { name: 'noimageindex', label: 'Meta Robots Noimageindex' }
  ];

  checks.forEach(check => {
    if (content.includes(check.name)) {
      results.push({
        name: check.label,
        status: STATUS.WARN,
        message: `Page has ${check.name} directive in robots meta tag`
      });
    } else {
      results.push({
        name: check.label,
        status: STATUS.PASS,
        message: `Page does not have ${check.name} directive in robots meta tag`
      });
    }
  });

  return results;
}

// New function to validate AMP tags
function analyzeAmpTags(doc) {
  const results = [];
  const ampHtml = doc.querySelector('link[rel="amphtml"]');
  if (!ampHtml) {
    results.push({
      name: 'AMP Tag',
      status: STATUS.WARN,
      message: 'No AMP tag found',
      details: 'Add AMP tags to improve mobile performance'
    });
  } else {
    results.push({
      name: 'AMP Tag',
      status: STATUS.PASS,
      message: 'AMP tag found',
      details: ampHtml.getAttribute('href')
    });
  }
  return results;
}

// New function to validate sitemap entries
function analyzeSitemapEntries(sitemap) {
  const results = [];
  if (!sitemap || !sitemap.exists) {
    results.push({
      name: 'Sitemap Entries',
      status: STATUS.WARN,
      message: 'No sitemap.xml found',
      details: 'Adding a sitemap improves crawlability'
    });
  } else {
    results.push({
      name: 'Sitemap Entries',
      status: STATUS.PASS,
      message: 'Sitemap.xml detected',
      details: `Location: ${sitemap.url || 'unknown'}`
    });
  }
  return results;
}

// New function to validate structured data types
function analyzeStructuredDataTypes(doc) {
  const results = [];
  const scripts = doc.querySelectorAll('script[type="application/ld+json"]');
  if (scripts.length === 0) {
    results.push({
      name: 'Structured Data Types',
      status: STATUS.WARN,
      message: 'No structured data found',
      details: 'Consider adding JSON-LD, Microdata, or RDFa schemas to improve SEO'
    });
  } else {
    scripts.forEach((script, index) => {
      try {
        const jsonData = JSON.parse(script.textContent);
        const schemaType = jsonData['@type'] || 'Unknown';
        results.push({
          name: `Structured Data Type: ${schemaType}`,
          status: STATUS.PASS,
          message: `Valid structured data type found: ${schemaType}`
        });
      } catch (e) {
        results.push({
          name: `Structured Data Type #${index + 1}`,
          status: STATUS.FAIL,
          message: 'Invalid JSON-LD syntax',
          details: `Error: ${e.message}`
        });
      }
    });
  }
  return results;
}

// New function to analyze Core Web Vitals metrics
function analyzeCoreWebVitals(performanceData) {
  const results = [];

  if (!performanceData || !performanceData.metrics) {
    results.push({
      name: 'Core Web Vitals',
      status: STATUS.INFO,
      message: 'Performance metrics not available',
      details: 'Unable to analyze Core Web Vitals'
    });
    return results;
  }

  const { metrics } = performanceData;

  // First Contentful Paint (FCP)
  if (metrics.FirstContentfulPaint) {
    const fcp = metrics.FirstContentfulPaint;
    results.push({
      name: 'First Contentful Paint (FCP)',
      status: fcp <= 2000 ? STATUS.PASS : fcp <= 4000 ? STATUS.WARN : STATUS.FAIL,
      message: `FCP: ${fcp} ms`,
      details: 'Measures time to first contentful paint'
    });
  }

  // Largest Contentful Paint (LCP)
  if (metrics.LargestContentfulPaint) {
    const lcp = metrics.LargestContentfulPaint;
    results.push({
      name: 'Largest Contentful Paint (LCP)',
      status: lcp <= 2500 ? STATUS.PASS : lcp <= 4000 ? STATUS.WARN : STATUS.FAIL,
      message: `LCP: ${lcp} ms`,
      details: 'Measures time to largest contentful paint'
    });
  }

  // Cumulative Layout Shift (CLS)
  if (metrics.CumulativeLayoutShift) {
    const cls = metrics.CumulativeLayoutShift;
    results.push({
      name: 'Cumulative Layout Shift (CLS)',
      status: cls <= 0.1 ? STATUS.PASS : cls <= 0.25 ? STATUS.WARN : STATUS.FAIL,
      message: `CLS: ${cls}`,
      details: 'Measures visual stability'
    });
  }

  // Total Blocking Time (TBT)
  if (metrics.TotalBlockingTime) {
    const tbt = metrics.TotalBlockingTime;
    results.push({
      name: 'Total Blocking Time (TBT)',
      status: tbt <= 200 ? STATUS.PASS : tbt <= 600 ? STATUS.WARN : STATUS.FAIL,
      message: `TBT: ${tbt} ms`,
      details: 'Measures time blocked by scripts'
    });
  }

  return results;
}

// New function to check image optimization
function analyzeImageOptimization(doc) {
  const results = [];
  const images = Array.from(doc.querySelectorAll('img'));
  if (images.length === 0) {
    results.push({
      name: 'Image Optimization',
      status: STATUS.INFO,
      message: 'No images found on page',
      details: 'No images to analyze'
    });
    return results;
  }

  const missingSrcset = images.filter(img => !img.hasAttribute('srcset'));
  const largeImages = images.filter(img => {
    const width = img.naturalWidth || 0;
    const height = img.naturalHeight || 0;
    return width * height > 1000000; // >1MP
  });

  if (missingSrcset.length === 0) {
    results.push({
      name: 'Image Srcset',
      status: STATUS.PASS,
      message: 'All images have srcset attribute',
      details: `${images.length} images checked`
    });
  } else {
    results.push({
      name: 'Image Srcset',
      status: STATUS.WARN,
      message: `${missingSrcset.length} images missing srcset attribute`,
      details: missingSrcset.map(img => img.src).slice(0, 10)
    });
  }

  if (largeImages.length === 0) {
    results.push({
      name: 'Large Images',
      status: STATUS.PASS,
      message: 'No large images detected',
      details: `${images.length} images checked`
    });
  } else {
    results.push({
      name: 'Large Images',
      status: STATUS.WARN,
      message: `${largeImages.length} large images detected`,
      details: largeImages.map(img => img.src).slice(0, 10)
    });
  }

  return results;
}

// New function to check JS and CSS minification
function analyzeMinification(resources) {
  const results = [];
  if (!resources || resources.length === 0) {
    results.push({
      name: 'Minification',
      status: STATUS.INFO,
      message: 'No resources to analyze',
      details: 'No JS or CSS resources found'
    });
    return results;
  }

  const jsFiles = resources.filter(r => r.type && r.type.includes('javascript'));
  const cssFiles = resources.filter(r => r.type && r.type.includes('css'));

  const unminifiedJs = jsFiles.filter(r => r.size && r.size > 100000 && !r.url.includes('.min.'));
  const unminifiedCss = cssFiles.filter(r => r.size && r.size > 50000 && !r.url.includes('.min.'));

  if (unminifiedJs.length === 0) {
    results.push({
      name: 'JavaScript Minification',
      status: STATUS.PASS,
      message: 'All JS files appear minified',
      details: `${jsFiles.length} JS files checked`
    });
  } else {
    results.push({
      name: 'JavaScript Minification',
      status: STATUS.WARN,
      message: `${unminifiedJs.length} large JS files not minified`,
      details: unminifiedJs.map(r => r.url).slice(0, 10)
    });
  }

  if (unminifiedCss.length === 0) {
    results.push({
      name: 'CSS Minification',
      status: STATUS.PASS,
      message: 'All CSS files appear minified',
      details: `${cssFiles.length} CSS files checked`
    });
  } else {
    results.push({
      name: 'CSS Minification',
      status: STATUS.WARN,
      message: `${unminifiedCss.length} large CSS files not minified`,
      details: unminifiedCss.map(r => r.url).slice(0, 10)
    });
  }

  return results;
}

// New function to check accessibility basics
function analyzeAccessibility(doc) {
  const results = [];

  // Check for lang attribute
  const htmlLang = doc.documentElement.getAttribute('lang');
  if (!htmlLang) {
    results.push({
      name: 'HTML lang attribute',
      status: STATUS.WARN,
      message: 'No lang attribute on <html> tag',
      details: 'Add lang attribute to specify page language'
    });
  } else {
    results.push({
      name: 'HTML lang attribute',
      status: STATUS.PASS,
      message: `Page language set to ${htmlLang}`
    });
  }

  // Check for alt attributes on images
  const images = Array.from(doc.querySelectorAll('img'));
  const imagesWithoutAlt = images.filter(img => !img.hasAttribute('alt') || img.getAttribute('alt').trim() === '');
  if (imagesWithoutAlt.length > 0) {
    results.push({
      name: 'Image alt attributes',
      status: STATUS.WARN,
      message: `${imagesWithoutAlt.length} images missing alt attributes`,
      details: imagesWithoutAlt.map(img => img.src).slice(0, 10)
    });
  } else {
    results.push({
      name: 'Image alt attributes',
      status: STATUS.PASS,
      message: 'All images have alt attributes'
    });
  }

  // Check for ARIA roles
  const ariaElements = Array.from(doc.querySelectorAll('[role]'));
  if (ariaElements.length === 0) {
    results.push({
      name: 'ARIA roles',
      status: STATUS.WARN,
      message: 'No ARIA roles found',
      details: 'Consider adding ARIA roles for accessibility'
    });
  } else {
    results.push({
      name: 'ARIA roles',
      status: STATUS.PASS,
      message: `${ariaElements.length} ARIA roles found`
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
  // Calculate overall scores
  const performanceScore = calculateScore(analyzePerformance(data.performanceData, data.lighthouse));
  const contentScore = calculateScore(analyzeContent(data.doc, data.pageData));
  const technicalScore = calculateScore(analyzeTechnical(data.doc, data.url));
  const mobileScore = calculateScore(analyzeMobileFriendliness(data.doc));
  
  return {
    overallScore: Math.round((performanceScore + contentScore + technicalScore + mobileScore) / 4),
    scores: {
      performance: performanceScore,
      content: contentScore,
      technical: technicalScore,
      mobile: mobileScore
    },
    timestamp: new Date().toISOString()
  };
}

function calculateScore(results) {
  if (!Array.isArray(results) || results.length === 0) return 0;
  
  const scoreMap = {
    PASS: 100,
    WARN: 50,
    FAIL: 0,
    INFO: 50
  };
  
  const total = results.reduce((sum, result) => sum + (scoreMap[result.status] || 0), 0);
  return Math.round(total / results.length);
}

// New function to analyze page size and DOM size
function analyzePageSizeAndDOM(resources, doc) {
  const results = [];

  // Page size calculation (sum of resource sizes)
  const totalSizeBytes = resources.reduce((sum, r) => sum + (r.size || 0), 0);
  const totalSizeKB = (totalSizeBytes / 1024).toFixed(2);

  results.push({
    name: 'Page Size',
    status: totalSizeBytes < 2000000 ? STATUS.PASS : totalSizeBytes < 5000000 ? STATUS.WARN : STATUS.FAIL,
    message: `Total page size: ${totalSizeKB} KB`,
    details: 'Recommended size under 2MB for optimal performance'
  });

  // DOM size check (number of elements)
  const domElementsCount = doc.getElementsByTagName('*').length;
  results.push({
    name: 'DOM Size',
    status: domElementsCount < 1500 ? STATUS.PASS : domElementsCount < 3000 ? STATUS.WARN : STATUS.FAIL,
    message: `DOM contains ${domElementsCount} elements`,
    details: 'Large DOM size can impact page performance and SEO'
  });

  return results;
}
