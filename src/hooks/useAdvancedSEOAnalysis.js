// src/hooks/useAdvancedSEOAnalysis.js
import { useState, useCallback } from 'react';
import { runAdvancedChecks } from '../utils/advancedSeoChecks';
import axios from 'axios';
import API_URL from '../config';
// Score calculation helper functions
const calculateCategoryScore = (results = []) => {
  if (!Array.isArray(results) || results.length === 0) return 0;
  
  const scoreMap = {
    pass: 100,
    warn: 50,
    fail: 0,
    info: 50
  };
  
  const total = results.reduce((sum, result) => {
    const score = scoreMap[result?.status?.toLowerCase()] || 0;
    return sum + score;
  }, 0);
  
  return Math.round(total / results.length);
};

  const validateResults = (results) => {
  if (!results || typeof results !== 'object') return false;
  
  // Check required properties
  const requiredProps = ['url', 'timestamp', 'summary', 'scores', 'data', 'overallScore'];
  if (!requiredProps.every(prop => prop in results)) return false;
  
  // Define all expected metrics
  const expectedMetrics = [
    'performance', 'content', 'technical', 'mobile', 'security', 'structuredData',
    'hreflang', 'mixedContent', 'socialMeta', 'excessiveRedirects', 'blockedResources',
    'urlParameters', 'trailingSlash', 'robotsMeta', 'amp', 'sitemapEntries',
    'structuredDataTypes', 'hreflangXDefault'
  ];
  
  // Validate scores
  const scores = results.scores;
  if (!scores || typeof scores !== 'object') return false;
  if (!expectedMetrics.every(metric => 
    typeof scores[metric] === 'number' && scores[metric] >= 0 && scores[metric] <= 100
  )) return false;
  
  // Validate summary sections
  const summary = results.summary;
  if (!summary || typeof summary !== 'object') return false;
  if (!expectedMetrics.every(section => 
    Array.isArray(summary[section])
  )) return false;
  
  return true;
};

// Create configured axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Enable sending cookies
  headers: {
    'Content-Type': 'application/json'
  }
});

function useAdvancedSEOAnalysis() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ step: '', percentage: 0 });
  const [error, setError] = useState(null);

  const analyze = useCallback(async (url) => {
    if (!url) {
      setError('Please provide a valid URL');
      return;
    }

    // Ensure URL has protocol
    let validUrl = url;
    if (!/^https?:\/\//i.test(url)) {
      validUrl = `https://${url}`;
    }

    try {
      // Test if URL is valid
      new URL(validUrl);
    } catch (e) {
      setError('Please enter a valid URL');
      return;
    }

    try {
      // Reset states
      setLoading(true);
      setError(null);
      setResults(null);
      setProgress({ step: 'Starting analysis...', percentage: 0 });

      // Step 1: Basic page analysis
      setProgress({ step: 'Fetching page content...', percentage: 20 });
      
      const pageResponse = await api.post('/api/analyze', { url: validUrl });
      
      if (!pageResponse.data || !pageResponse.data.success) {
        throw new Error(pageResponse.data?.error || 'Failed to analyze page');
      }
      
      const pageData = pageResponse.data.data;

      // Step 2: Check robots.txt
      setProgress({ step: 'Checking robots.txt...', percentage: 40 });
      const robotsResponse = await api.get(`/api/robots?url=${encodeURIComponent(validUrl)}`);
      const robotsData = robotsResponse.data;

      // Step 3: Check sitemap
      setProgress({ step: 'Looking for sitemap...', percentage: 60 });
      const sitemapResponse = await api.get(`/api/sitemap?url=${encodeURIComponent(validUrl)}`);
      const sitemapData = sitemapResponse.data;

      // Step 4: Check links (only if available in plan)
      let linksData = [];
      if (pageData.links && pageData.links.length > 0) {
        setProgress({ step: 'Validating links...', percentage: 80 });
        try {
          const linksResponse = await api.post('/api/check-links', {
            links: pageData.links.slice(0, 20)
          });
          linksData = linksResponse.data.data || linksResponse.data || [];
        } catch (linkError) {
          console.log('Link checking error:', linkError);
          linksData = [];
        }
      }

      try {
        // Step 5: Run comprehensive analysis
        setProgress({ step: 'Running comprehensive analysis...', percentage: 90 });
        
        // Parse the HTML to get a DOM document
        const parser = new DOMParser();
        const doc = parser.parseFromString(pageData.html, 'text/html');
        
        const comprehensiveResults = await runAdvancedChecks({
          doc,
          url,
          pageData,
          robots: robotsData,
          sitemap: sitemapData,
          linkValidation: linksData,
          resources: pageData.resources || [],
          performanceData: pageData.performanceData || {},
          lighthouse: pageData.lighthouse || {},
          redirectChains: pageData.redirectChains || []
        });

        setProgress({ step: 'Analysis complete!', percentage: 100 });
        
        // Process the results
        const processedResults = {
          url,
          timestamp: new Date().toISOString(),
          summary: {
            performance: comprehensiveResults?.performance || [],
            content: comprehensiveResults?.content || [],
            technical: comprehensiveResults?.technical || [],
            mobile: comprehensiveResults?.mobile || [],
            security: comprehensiveResults?.security || [],
            structuredData: comprehensiveResults?.structuredData || [],
            hreflang: comprehensiveResults?.hreflang || [],
            mixedContent: comprehensiveResults?.mixedContent || [],
            socialMeta: comprehensiveResults?.socialMeta || [],
            excessiveRedirects: comprehensiveResults?.excessiveRedirects || [],
            blockedResources: comprehensiveResults?.blockedResources || [],
            urlParameters: comprehensiveResults?.urlParameters || [],
            trailingSlash: comprehensiveResults?.trailingSlash || [],
            robotsMeta: comprehensiveResults?.robotsMeta || [],
            amp: comprehensiveResults?.amp || [],
            sitemapEntries: comprehensiveResults?.sitemapEntries || [],
            structuredDataTypes: comprehensiveResults?.structuredDataTypes || [],
            hreflangXDefault: comprehensiveResults?.hreflangXDefault || [],
            duplicateTitles: comprehensiveResults?.duplicateTitles || [],
            duplicateMetaDescriptions: comprehensiveResults?.duplicateMetaDescriptions || [],
            noindexPages: comprehensiveResults?.noindexPages || []
          },
          scores: {
            performance: calculateCategoryScore(comprehensiveResults?.performance),
            content: calculateCategoryScore(comprehensiveResults?.content),
            technical: calculateCategoryScore(comprehensiveResults?.technical),
            mobile: calculateCategoryScore(comprehensiveResults?.mobile),
            security: calculateCategoryScore(comprehensiveResults?.security),
            structuredData: calculateCategoryScore(comprehensiveResults?.structuredData),
            hreflang: calculateCategoryScore(comprehensiveResults?.hreflang),
            mixedContent: calculateCategoryScore(comprehensiveResults?.mixedContent),
            socialMeta: calculateCategoryScore(comprehensiveResults?.socialMeta),
            excessiveRedirects: calculateCategoryScore(comprehensiveResults?.excessiveRedirects),
            blockedResources: calculateCategoryScore(comprehensiveResults?.blockedResources),
            urlParameters: calculateCategoryScore(comprehensiveResults?.urlParameters),
            trailingSlash: calculateCategoryScore(comprehensiveResults?.trailingSlash),
            robotsMeta: calculateCategoryScore(comprehensiveResults?.robotsMeta),
            amp: calculateCategoryScore(comprehensiveResults?.amp),
            sitemapEntries: calculateCategoryScore(comprehensiveResults?.sitemapEntries),
            structuredDataTypes: calculateCategoryScore(comprehensiveResults?.structuredDataTypes),
            hreflangXDefault: calculateCategoryScore(comprehensiveResults?.hreflangXDefault),
            duplicateTitles: calculateCategoryScore(comprehensiveResults?.duplicateTitles),
            duplicateMetaDescriptions: calculateCategoryScore(comprehensiveResults?.duplicateMetaDescriptions),
            noindexPages: calculateCategoryScore(comprehensiveResults?.noindexPages)
          },
          data: {
            pageData: pageData || {},
            robots: robotsData || {},
            sitemap: sitemapData || {},
            linkValidation: linksData || []
          }
        };

        // Calculate overall score including all categories
        const scoreSum = Object.values(processedResults.scores).reduce((sum, score) => sum + score, 0);
        processedResults.overallScore = Math.round(scoreSum / Object.keys(processedResults.scores).length);

        // Validate the processed results
        if (!validateResults(processedResults)) {
          throw new Error('Invalid analysis results structure');
        }

        console.log('Analysis completed successfully:', {
          url: processedResults.url,
          overallScore: processedResults.overallScore,
          scores: processedResults.scores
        });
        
        setResults(processedResults);
  } catch (analysisError) {
    console.error('Error in comprehensive analysis:', analysisError);
    setError('Error processing analysis results. Please try again.');
    setResults(null);
    setLoading(false);
        setProgress({ step: 'Analysis failed', percentage: 0 });
      }
      
    } catch (err) {
      console.error('Analysis error:', err);
      if (err.response?.status === 403) {
        setError(err.response.data.error || 'Usage limit reached');
      } else if (err.response?.status === 401) {
        setError('Please login to use this feature');
      } else {
        setError(err.message || 'An error occurred during analysis');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const analyzeWithCallback = useCallback(async (url, onComplete) => {
    await analyze(url);
    if (onComplete && typeof onComplete === 'function') {
      onComplete();
    }
  }, [analyze]);

  return { analyze: analyzeWithCallback, results, loading, progress, error };
}

export default useAdvancedSEOAnalysis;
