const helmet = require('helmet');
const compression = require('compression');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const puppeteer = require('puppeteer');
const axios = require('axios');
const robots = require('robots-parser');
const { URL } = require('url');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, 'mongodb.env') });

// Import middleware
const { protect } = require('./middleware/auth');
const User = require('./models/User');
const Analysis = require('./models/Analysis');

// Import routes
const authRoutes = require('./routes/auth');

const app = express();

// Enable mongoose debugging
mongoose.set('debug', true);

const allowedOrigins = [
  'http://localhost:3000',
  'https://seo-tech-check-01-x44ae.ondigitalocean.app/'
];

// CORS Configuration - Allow only specific origins with credentials
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));
app.use(express.json());
app.use(cookieParser());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

if (process.env.NODE_ENV === 'production') {
  app.use(helmet());
  app.use(compression());
}

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ MongoDB connected successfully');
  console.log('📍 Database:', mongoose.connection.name);
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
  console.error('Make sure MongoDB is running on your system or your MONGODB_URI is correct');
  console.error('To install MongoDB:');
  console.error('- macOS: brew install mongodb-community');
  console.error('- Ubuntu: sudo apt-get install mongodb');
  console.error('- Or use MongoDB Atlas: https://www.mongodb.com/cloud/atlas');
  process.exit(1);
});

// Auth routes - these should be before protected routes
app.use('/api/auth', authRoutes);

// Cache for performance
const cache = new Map();

// Protected analysis endpoint
app.post('/api/analyze', protect, async (req, res) => {
  const { url } = req.body;
  
  if (!url) {
    return res.status(400).json({ 
      success: false,
      error: 'URL is required' 
    });
  }

  console.log(`User ${req.user.email} analyzing URL:`, url);

  try {
    // Validate URL format
    let validUrl;
    try {
      validUrl = new URL(url);
      if (!['http:', 'https:'].includes(validUrl.protocol)) {
        throw new Error('Invalid protocol');
      }
    } catch (urlError) {
      return res.status(400).json({ 
        success: false,
        error: 'Please enter a valid URL starting with http:// or https://' 
      });
    }

    // Check cache
    const cacheKey = `${url}_${Date.now() - (Date.now() % 300000)}`; // 5-min cache
    if (cache.has(cacheKey)) {
      console.log('Returning cached result');
      
      // Removed usage increment
      // await req.user.incrementUsage();
      
      const cachedResult = cache.get(cacheKey);
      return res.json({
        success: true,
        data: cachedResult
      });
    }

    // Launch Puppeteer
    console.log('Launching Puppeteer...');
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: 'new',
        executablePath: process.env.CHROME_BIN || undefined,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-extensions',
          '--disable-software-rasterizer'
        ],
        ignoreDefaultArgs: ['--disable-extensions'],
      });
    } catch (puppeteerError) {
      console.error('Puppeteer launch error:', puppeteerError);
      return res.status(500).json({ 
        success: false,
        error: 'Failed to launch browser. Please try again later.' 
      });
    }

    const page = await browser.newPage();
    
    // Set realistic viewport
    await page.setViewport({ width: 1366, height: 768 });
    
    // Set user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 SEOChecker/1.0');

    // Set timeout
    page.setDefaultTimeout(30000);

    // Collect performance metrics
    const performanceData = {
      metrics: {},
      resources: []
    };
    
    // Monitor network requests and track redirect chains
    const redirectChains = new Map();

    page.on('response', response => {
      performanceData.resources.push({
        url: response.url(),
        status: response.status(),
        type: response.headers()['content-type'] || 'unknown'
      });

      // Track redirects
      const request = response.request();
      const redirectChain = request.redirectChain();
      if (redirectChain.length > 0) {
        const chainUrls = redirectChain.map(r => r.url());
        chainUrls.push(request.url());
        redirectChains.set(request.url(), chainUrls);
      }
    });

    // Navigate to the URL
    console.log('Navigating to URL...');
    const startTime = Date.now();
    
    try {
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });
    } catch (navError) {
      console.error('Navigation error:', navError);
      await browser.close();
      return res.status(400).json({ 
        success: false,
        error: 'Failed to load the webpage. Please check the URL and try again.' 
      });
    }

    const loadTime = Date.now() - startTime;

    // Get rendered HTML
    console.log('Getting page content...');
    const html = await page.content();
    
    // Get page title
    const pageTitle = await page.title();

    // Take screenshot (only for pro and enterprise users)
    let screenshot = null;
    if (req.user.plan !== 'free') {
      console.log('Taking screenshot...');
      try {
        screenshot = await page.screenshot({ 
          encoding: 'base64',
          fullPage: false,
          type: 'jpeg',
          quality: 80
        });
      } catch (screenshotError) {
        console.error('Screenshot error:', screenshotError);
      }
    }

    // Extract all links
    const links = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a[href]')).map(a => ({
        href: a.href,
        text: a.textContent.trim(),
        rel: a.rel,
        target: a.target
      }));
    });

    // Get page metrics
    const metrics = await page.metrics();
    performanceData.metrics = metrics;

    // Close browser
    await browser.close();
    console.log('Browser closed');

    // Create simplified Lighthouse-like scores
    const lighthouseData = {
      performance: loadTime < 3000 ? 90 : loadTime < 6000 ? 70 : 50,
      accessibility: 85, // Simplified score
      seo: 80, // Simplified score
      audits: {
        'first-contentful-paint': { 
          displayValue: `${(loadTime * 0.3 / 1000).toFixed(1)}s`, 
          score: loadTime < 3000 ? 0.9 : 0.5 
        },
        'largest-contentful-paint': { 
          displayValue: `${(loadTime * 0.8 / 1000).toFixed(1)}s`, 
          score: loadTime < 5000 ? 0.8 : 0.4 
        },
        'total-blocking-time': { 
          displayValue: `${Math.round(loadTime * 0.1)}ms`, 
          score: 0.7 
        },
        'cumulative-layout-shift': { 
          displayValue: '0.1', 
          score: 0.9 
        },
        'speed-index': { 
          displayValue: `${(loadTime * 0.7 / 1000).toFixed(1)}s`, 
          score: loadTime < 4000 ? 0.8 : 0.5 
        }
      }
    };

    // Calculate overall score from different metrics
    const overallScore = Math.round(
      (lighthouseData.performance +
       lighthouseData.accessibility +
       lighthouseData.seo +
       (loadTime < 3000 ? 90 : loadTime < 6000 ? 70 : 50)) / 4
    );

    const result = {
      url,
      html,
      screenshot,
      pageTitle,
      loadTime,
      performanceData,
      resources: performanceData.resources.slice(0, 100), // Limit resources
      links: links.slice(0, 50), // Limit links
      redirectChains: Array.from(redirectChains.values()), // Add redirect chains info
      jsErrors: [],
      consoleMessages: [],
      lighthouse: lighthouseData,
      summary: [
        {
          name: 'Overall SEO Score',
          status: 'info',
          message: `${overallScore}%`
        }
      ],
      timestamp: new Date().toISOString(),
      userPlan: req.user.plan
    };

    // Save analysis to database
    try {
      await Analysis.create({
        user: req.user._id,
        url,
        results: result,
        score: overallScore,
        screenshot
      });
    } catch (dbError) {
      console.error('Error saving analysis:', dbError);
      // Continue even if saving fails
    }

    // Removed usage increment
    // await req.user.incrementUsage();

    // Cache the result
    cache.set(cacheKey, result);
    
    console.log('Analysis complete');
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'An error occurred during analysis' 
    });
  }
});

// Get user's analysis history
app.get('/api/analyses', protect, async (req, res) => {
  try {
    const analyses = await Analysis.find({ user: req.user._id })
      .sort('-createdAt')
      .limit(20)
      .select('-results.html -results.screenshot');
    
    res.json({
      success: true,
      count: analyses.length,
      data: analyses
    });
  } catch (error) {
    console.error('Error fetching analyses:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get single analysis
app.get('/api/analyses/:id', protect, async (req, res) => {
  try {
    const analysis = await Analysis.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: 'Analysis not found'
      });
    }
    
    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Error fetching analysis:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Check robots.txt (protected)
app.get('/api/robots', protect, async (req, res) => {
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ 
      success: false,
      error: 'URL is required' 
    });
  }

  try {
    const urlObj = new URL(url);
    const robotsUrl = `${urlObj.protocol}//${urlObj.hostname}/robots.txt`;
    
    console.log('Checking robots.txt:', robotsUrl);
    
    const response = await axios.get(robotsUrl, { 
      timeout: 5000,
      validateStatus: status => status < 500,
      headers: {
        'User-Agent': 'SEOChecker/1.0'
      }
    });
    
    if (response.status === 404) {
      return res.json({ 
        success: true,
        exists: false 
      });
    }
    
    const robotsParser = robots(robotsUrl, response.data);
    
    res.json({
      success: true,
      exists: true,
      content: response.data.substring(0, 5000), // Limit content size
      canCrawl: robotsParser.isAllowed(url, 'SEOChecker'),
      sitemaps: robotsParser.getSitemaps()
    });
  } catch (error) {
    console.error('Robots.txt error:', error.message);
    res.json({ 
      success: true,
      exists: false, 
      error: error.message 
    });
  }
});

// Check sitemap (protected)
app.get('/api/sitemap', protect, async (req, res) => {
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ 
      success: false,
      error: 'URL is required' 
    });
  }

  try {
    const urlObj = new URL(url);
    const sitemapUrls = [
      `${urlObj.protocol}//${urlObj.hostname}/sitemap.xml`,
      `${urlObj.protocol}//${urlObj.hostname}/sitemap_index.xml`,
      `${urlObj.protocol}//${urlObj.hostname}/sitemap`
    ];

    for (const sitemapUrl of sitemapUrls) {
      try {
        console.log('Checking sitemap:', sitemapUrl);
        const response = await axios.get(sitemapUrl, { 
          timeout: 5000,
          headers: {
            'User-Agent': 'SEOChecker/1.0'
          }
        });
        if (response.status === 200) {
          return res.json({
            success: true,
            exists: true,
            url: sitemapUrl,
            content: response.data.substring(0, 1000) // First 1000 chars
          });
        }
      } catch (e) {
        continue;
      }
    }
    
    res.json({ 
      success: true,
      exists: false 
    });
  } catch (error) {
    console.error('Sitemap error:', error.message);
    res.json({ 
      success: true,
      exists: false, 
      error: error.message 
    });
  }
});

// Check links status (protected, pro feature)
app.post('/api/check-links', protect, async (req, res) => {
  // Only available for pro and enterprise users
  if (req.user.plan === 'free') {
    return res.status(403).json({
      success: false,
      error: 'Link checking is a Pro feature',
      upgradeUrl: '/pricing'
    });
  }

  const { links } = req.body;
  
  if (!links || !Array.isArray(links)) {
    return res.status(400).json({ 
      success: false,
      error: 'Links array is required' 
    });
  }

  const results = [];
  const linksToCheck = links.slice(0, 20); // Limit to 20 links

  for (const link of linksToCheck) {
    try {
      console.log('Checking link:', link.href);
      const response = await axios.head(link.href, { 
        timeout: 5000,
        validateStatus: () => true,
        maxRedirects: 5,
        headers: {
          'User-Agent': 'SEOChecker/1.0'
        }
      });
      
      results.push({
        ...link,
        status: response.status,
        valid: response.status >= 200 && response.status < 400
      });
    } catch (error) {
      results.push({
        ...link,
        status: 0,
        valid: false,
        error: error.message
      });
    }
  }

  res.json({
    success: true,
    data: results
  });
});

// Health check endpoint (public)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'SEO Checker API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        logout: 'GET /api/auth/logout',
        me: 'GET /api/auth/me'
      },
      analysis: {
        analyze: 'POST /api/analyze (protected)',
        history: 'GET /api/analyses (protected)',
        single: 'GET /api/analyses/:id (protected)'
      }
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`\n🚀 SEO Checker API running on port ${PORT}`);
  console.log(`📍 Local: http://localhost:${PORT}`);
  console.log(`📍 Health Check: http://localhost:${PORT}/api/health`);
  console.log('\nMake sure MongoDB is running!');
  console.log('-------------------------\n');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Don't exit the process in development
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Shutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});
