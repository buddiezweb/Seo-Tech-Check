import { SEO_RULES, STATUS } from './constants';
import * as parser from './parser';

/**
 * Enhanced technical SEO checks inspired by Screaming Frog's common issues.
 * Includes checks for meta tags, redirects, broken links, security headers,
 * duplicate content, canonicalization, URL structure, images, sitemaps, and more.
 */

// ---------- META TAGS CHECKS ----------

function checkTitle(doc, allPages = []) {
  const title = doc.querySelector('title');
  const titleText = title ? title.textContent.trim() : '';
  
  // Check duplicate titles if allPages provided
  let duplicateTitles = [];
  if (allPages.length > 0) {
    duplicateTitles = allPages.filter(p => p.title && p.title === titleText);
  }
  
  if (!title || !titleText) {
    return {
      name: 'Page Title',
      status: STATUS.FAIL,
      message: 'No title tag found',
    };
  }
  
  if (duplicateTitles.length > 1) {
    return {
      name: 'Page Title',
      status: STATUS.FAIL,
      message: `Duplicate title found on ${duplicateTitles.length} pages`,
      details: duplicateTitles.map(p => p.url)
    };
  }
  
  if (titleText.length < SEO_RULES.TITLE_MIN_LENGTH) {
    return {
      name: 'Page Title',
      status: STATUS.WARN,
      message: `Title too short (${titleText.length} chars, recommended: ${SEO_RULES.TITLE_MIN_LENGTH}-${SEO_RULES.TITLE_MAX_LENGTH})`,
      details: `Current title: "${titleText}"`
    };
  }
  
  if (titleText.length > SEO_RULES.TITLE_MAX_LENGTH) {
    return {
      name: 'Page Title',
      status: STATUS.WARN,
      message: `Title too long (${titleText.length} chars, recommended: ${SEO_RULES.TITLE_MIN_LENGTH}-${SEO_RULES.TITLE_MAX_LENGTH})`,
      details: `Current title: "${titleText}"`
    };
  }
  
  return {
    name: 'Page Title',
    status: STATUS.PASS,
    message: `Title is optimized (${titleText.length} chars)`,
    details: `Current title: "${titleText}"`
  };
}

function checkMetaDescription(doc, allPages = []) {
  const description = parser.extractMetaContent(doc, 'description');
  
  // Check duplicates in other pages
  let duplicateDescriptions = [];
  if (allPages.length > 0 && description) {
    duplicateDescriptions = allPages.filter(p => p.description === description);
  }

  if (!description) {
    return {
      name: 'Meta Description',
      status: STATUS.FAIL,
      message: 'No meta description found',
    };
  }
  
  if (duplicateDescriptions.length > 1) {
    return {
      name: 'Meta Description',
      status: STATUS.FAIL,
      message: `Duplicate meta description found on ${duplicateDescriptions.length} pages`,
      details: duplicateDescriptions.map(p => p.url)
    };
  }
  
  if (description.length < SEO_RULES.DESCRIPTION_MIN_LENGTH) {
    return {
      name: 'Meta Description',
      status: STATUS.WARN,
      message: `Description too short (${description.length} chars, recommended: ${SEO_RULES.DESCRIPTION_MIN_LENGTH}-${SEO_RULES.DESCRIPTION_MAX_LENGTH})`,
      details: `Current description: "${description}"`
    };
  }
  
  if (description.length > SEO_RULES.DESCRIPTION_MAX_LENGTH) {
    return {
      name: 'Meta Description',
      status: STATUS.WARN,
      message: `Description too long (${description.length} chars, recommended: ${SEO_RULES.DESCRIPTION_MIN_LENGTH}-${SEO_RULES.DESCRIPTION_MAX_LENGTH})`,
      details: `Current description: "${description}"`
    };
  }
  
  return {
    name: 'Meta Description',
    status: STATUS.PASS,
    message: `Description is optimized (${description.length} chars)`,
    details: `Current description: "${description}"`
  };
}

function checkRobotsMeta(doc) {
  const robots = parser.extractMetaContent(doc, 'robots');
  
  if (!robots) {
    return {
      name: 'Robots Meta Tag',
      status: STATUS.PASS,
      message: 'No robots meta tag found (page is indexable by default)',
    };
  }
  
  const noindex = robots.toLowerCase().includes('noindex');
  const nofollow = robots.toLowerCase().includes('nofollow');
  
  if (noindex || nofollow) {
    return {
      name: 'Robots Meta Tag',
      status: STATUS.WARN,
      message: `Page has restrictions: ${robots}`,
      details: [
        noindex && 'Page is set to noindex (not indexed by search engines)',
        nofollow && 'Links on this page have nofollow attribute'
      ].filter(Boolean)
    };
  }
  
  return {
    name: 'Robots Meta Tag',
    status: STATUS.PASS,
    message: 'Page is fully indexable',
    details: `Current robots value: "${robots}"`
  };
}

function checkCanonical(doc, allPages = [], url = '') {
  const canonical = doc.querySelector('link[rel="canonical"]');
  
  if (!canonical) {
    return {
      name: 'Canonical URL',
      status: STATUS.WARN,
      message: 'No canonical URL specified',
      details: 'Consider adding a canonical tag to prevent duplicate content issues'
    };
  }
  
  const href = canonical.getAttribute('href');
  if(url && href === url) {
    return {
      name: 'Canonical URL',
      status: STATUS.PASS,
      message: 'Canonical URL properly set to current page',
      details: `Canonical URL: ${href}`
    };
  }

  if(allPages.length > 0) {
    const conflicting = allPages.filter(p => p.canonical === href);
    if(conflicting.length > 1) {
      return {
        name: 'Canonical URL',
        status: STATUS.FAIL,
        message: `Canonical URL is duplicated on ${conflicting.length} pages`,
        details: conflicting.map(p => p.url)
      };
    }
  }
  
  return {
    name: 'Canonical URL',
    status: STATUS.WARN,
    message: 'Canonical URL points to a different page',
    details: `Canonical URL: ${href}`
  };
}

// ---------- HEADING CHECKS ----------

function checkHeadings(doc) {
  const headings = parser.extractHeadings(doc);
  const results = [];
  
  if (headings.h1.length === 0) {
    results.push({
      name: 'H1 Tag',
      status: STATUS.FAIL,
      message: 'No H1 tag found',
      details: 'Every page should have exactly one H1 tag'
    });
  } else if (headings.h1.length > 1) {
    results.push({
      name: 'H1 Tag',
      status: STATUS.WARN,
      message: `Multiple (${headings.h1.length}) H1 tags found`,
      details: headings.h1
    });
  } else {
    results.push({
      name: 'H1 Tag',
      status: STATUS.PASS,
      message: 'Single H1 tag found',
      details: `H1: "${headings.h1[0]}"`
    });
  }
  
  // Check heading hierarchy for gaps
  let hierarchyIssue = false;
  for (let i = 1; i < 6; i++) {
    if (headings[`h${i}`].length === 0 && headings[`h${i+1}`].length > 0) {
      hierarchyIssue = true;
      break;
    }
  }
  results.push({
    name: 'Heading Hierarchy',
    status: hierarchyIssue ? STATUS.WARN : STATUS.PASS,
    message: hierarchyIssue ? 'Gaps found in heading hierarchy' : 'Proper heading hierarchy',
    details: Object.entries(headings)
      .filter(([, arr]) => arr.length > 0)
      .map(([tag, arr]) => `${tag.toUpperCase()}: ${arr.length} found`)
  });
  return results;
}

// ---------- BROKEN LINKS & REDIRECTS ----------

// We assume broken links are detected by backend with actual HTTP status checks.
// Here we show an example check of invalid hrefs and anchors.
function checkBrokenLinks(links) {
  if (!links || links.length === 0) {
    return [{
      name: 'Broken Links',
      status: STATUS.PASS,
      message: 'No links found on the page',
    }];
  }
  
  // Using link.valid indicates broken or not from backend check
  const broken = links.filter(link => link.valid === false);
  
  if (broken.length === 0) {
    return [{
      name: 'Broken Links',
      status: STATUS.PASS,
      message: 'No broken links detected',
    }];
  }
  
  return [{
    name: 'Broken Links',
    status: STATUS.FAIL,
    message: `${broken.length} broken/internal error links detected`,
    details: broken.slice(0, 10).map(l => `${l.href} (status: ${l.status || 'unknown'})`)
  }];
}

// Redirect chains - must be detected server side; here we check just reported data.
function checkRedirects(links) {
  if (!links || links.length === 0) {
    return [{
      name: 'Redirect Chains',
      status: STATUS.PASS,
      message: 'No redirects detected',
    }];
  }
  
  const redirects = links.filter(link => link.status >= 300 && link.status < 400);
  
  if (redirects.length === 0) {
    return [{
      name: 'Redirect Chains',
      status: STATUS.PASS,
      message: 'No redirect chains detected',
    }];
  }
  
  return [{
    name: 'Redirect Chains',
    status: STATUS.WARN,
    message: `${redirects.length} redirect(s) detected`,
    details: redirects.slice(0, 10).map(l => `${l.href} (status: ${l.status})`)
  }];
}

// ---------- DUPLICATE CONTENT CHECKS ----------

// Deduplicate pages by content hash or metadata
// Requires allPages containing URL and contentDigest (MD5 or hash).
function checkDuplicateContent(allPages = []) {
  if (allPages.length === 0) {
    return [];
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
    return [{
      name: 'Duplicate Content',
      status: STATUS.PASS,
      message: 'No duplicate content detected'
    }];
  }
  
  return duplicates.map((dup, index) => ({
    name: `Duplicate Content Group ${index+1}`,
    status: STATUS.FAIL,
    message: `Same content found on ${dup.urls.length} pages`,
    details: dup.urls
  }));
}

// ---------- URL STRUCTURE CHECKS ----------

function checkUrlStructure(url) {
  const urlObj = new URL(url);
  let status = STATUS.PASS;
  let messages = [];
  
  // Check underscores usage (prefer hyphens)
  if (urlObj.pathname.indexOf('_') !== -1) {
    status = STATUS.WARN;
    messages.push('URL contains underscores (_) - prefer hyphens (-)');
  }
  
  // Check length
  if (url.length > 115) {
    status = STATUS.WARN;
    messages.push(`URL length is long (${url.length} characters). Recommended length <= 115.`);
  }
  
  // Check query strings for tracking params
  const forbiddenParams = ['utm_source', 'utm_medium', 'utm_campaign', 'fbclid', 'gclid'];
  const searchParams = urlObj.searchParams;
  forbiddenParams.forEach(param => {
    if (searchParams.has(param)) {
      status = STATUS.WARN;
      messages.push(`URL contains tracking parameter: ${param}`);
    }
  });
  
  if (messages.length === 0) {
    messages.push('URL structure looks good');
  }
  
  return {
    name: 'URL Structure',
    status,
    message: messages.join('; ')
  };
}

// ---------- SECURITY CHECKS ----------

function checkHttps(url) {
  if (url.startsWith('https://')) {
    return {
      name: 'HTTPS',
      status: STATUS.PASS,
      message: 'Site uses HTTPS',
      details: 'SSL certificate protects user data and improves search ranking'
    };
  }
  return {
    name: 'HTTPS',
    status: STATUS.FAIL,
    message: 'Site does not use HTTPS',
    details: 'Use SSL/TLS certificates to secure your site'
  };
}

function checkSecurityHeaders(headers = {}) {
  const requiredHeaders = [
    { name: 'Strict-Transport-Security', required: true },
    { name: 'Content-Security-Policy', required: false },
    { name: 'X-Content-Type-Options', required: true },
    { name: 'X-Frame-Options', required: true },
    { name: 'Referrer-Policy', required: false },
    { name: 'Permissions-Policy', required: false }
  ];

  const missingHeaders = requiredHeaders.filter(h => h.required && !headers[h.name.toLowerCase()]);
  
  if (missingHeaders.length === 0) {
    return [{
      name: 'Security Headers',
      status: STATUS.PASS,
      message: 'All important security headers are present'
    }];
  }
  
  return [{
    name: 'Security Headers',
    status: STATUS.WARN,
    message: `Missing important security headers: ${missingHeaders.map(h => h.name).join(', ')}`,
    details: missingHeaders.map(h => `Add the HTTP header: ${h.name}`)
  }];
}

// ---------- IMAGE OPTIMIZATION CHECKS ----------

function checkImageAlts(doc) {
  const images = parser.extractImages(doc);
  const missingAlt = images.filter(img => !img.alt || img.alt.trim().length === 0);
  
  if (images.length === 0) {
    return {
      name: 'Image Alt Attributes',
      status: STATUS.PASS,
      message: 'No images found on the page',
    };
  }
  
  if (missingAlt.length === 0) {
    return {
      name: 'Image Alt Attributes',
      status: STATUS.PASS,
      message: `All ${images.length} images have alt attributes`,
    };
  }
  
  return {
    name: 'Image Alt Attributes',
    status: STATUS.WARN,
    message: `${missingAlt.length} of ${images.length} images missing alt attributes`,
    details: missingAlt.slice(0, 10).map(img => img.src || 'unknown source')
  };
}

function checkImageSizes(resources = []) {
  // Check if images > 200kB exist
  const largeImages = resources.filter(r => 
    r.type && r.type.startsWith('image') && 
    r.size && Number(r.size) > 200000
  );
  
  if (largeImages.length === 0) {
    return {
      name: 'Image Sizes',
      status: STATUS.PASS,
      message: 'All images are reasonably sized'
    };
  }
  
  return {
    name: 'Image Sizes',
    status: STATUS.WARN,
    message: `${largeImages.length} large images (>200KB) detected`,
    details: largeImages.map(img => {
      const sizeKB = (Number(img.size) / 1024).toFixed(0);
      return `${img.url.split('/').pop() || img.url} (${sizeKB} KB)`;
    }).slice(0, 10)
  };
}

// ---------- STRUCTURED DATA CHECKS ----------

function checkStructuredData(doc) {
  const structuredData = parser.extractStructuredData(doc);
  
  if (structuredData.length === 0) {
    return [{
      name: 'Structured Data',
      status: STATUS.WARN,
      message: 'No structured data found',
      details: 'Consider adding JSON-LD, Microdata, or RDFa schemas to improve SEO'
    }];
  }
  
  return structuredData.map((data, index) => ({
    name: `Structured Data (${data.type})`,
    status: STATUS.PASS,
    message: `${data.type} structured data found`,
    details: data.type === 'JSON-LD' 
      ? `Schema type: ${data.data['@type'] || 'Unknown'}`
      : `Found ${data.count || 1} implementation(s)`
  }));
}

// ---------- SITEMAP & ROBOTS.TXT CHECKS ----------

function checkSitemap(sitemap) {
  if (!sitemap || !sitemap.exists) {
    return {
      name: 'Sitemap',
      status: STATUS.WARN,
      message: 'No sitemap.xml found',
      details: 'Adding a sitemap improves crawlability'
    };
  }
  return {
    name: 'Sitemap',
    status: STATUS.PASS,
    message: 'Sitemap.xml detected',
    details: `Location: ${sitemap.url || 'unknown'}`
  };
}

function checkRobotsTxt(robots) {
  if (!robots || !robots.exists) {
    return {
      name: 'Robots.txt',
      status: STATUS.WARN,
      message: 'No robots.txt found',
      details: 'Add a robots.txt file to guide search engine crawlers'
    };
  }
  
  if (!robots.canCrawl) {
    return {
      name: 'Robots.txt',
      status: STATUS.FAIL,
      message: 'Page is disallowed in robots.txt',
      details: 'Robots.txt is blocking this page from crawling'
    };
  }
  
  return {
    name: 'Robots.txt',
    status: STATUS.PASS,
    message: 'Robots.txt found and page is allowed',
  };
}

// ---------- MAIN FUNCTION TO RUN ALL CHECKS ----------

export async function runAllChecks(doc, url, links = [], resources = [], sitemap = null, robotsData = null, allPages = []) {
  const results = {
    metaTags: [
      checkTitle(doc, allPages),
      checkMetaDescription(doc, allPages),
      checkRobotsMeta(doc),
      checkCanonical(doc, allPages, url)
    ],
    contentStructure: [
      ...checkHeadings(doc)
    ],
    links: [
      ...checkBrokenLinks(links),
      ...checkRedirects(links)
    ],
    duplicates: [
      ...checkDuplicateContent(allPages)
    ],
    urlStructure: [
      checkUrlStructure(url)
    ],
    security: [
      checkHttps(url),
      ...checkSecurityHeaders(resources.reduce((acc, r) => {
        if (r.headers) {
          Object.entries(r.headers).forEach(([k,v]) => {
            acc[k.toLowerCase()] = v;
          });
        }
        return acc;
      }, {}))
    ],
    images: [
      checkImageAlts(doc),
      checkImageSizes(resources)
    ],
    structuredData: [
      ...checkStructuredData(doc)
    ],
    sitemapChecks: [
      checkSitemap(sitemap),
      checkRobotsTxt(robotsData)
    ],
  };
  
  return results;
}