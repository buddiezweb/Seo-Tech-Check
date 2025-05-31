// src/hooks/useAdvancedSEOAnalysis.js
import { useState, useCallback } from 'react';
import { runAdvancedChecks } from '../utils/advancedSeoChecks';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function useAdvancedSEOAnalysis() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ step: '', percentage: 0 });
  const [error, setError] = useState(null);

  const analyze = useCallback(async (url) => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      // Step 1: Basic page analysis
      setProgress({ step: 'Fetching page content...', percentage: 20 });
      
      const pageResponse = await axios.post(`${API_BASE}/api/analyze`, { url });
      
      if (!pageResponse.data || !pageResponse.data.success) {
        throw new Error(pageResponse.data?.error || 'Failed to analyze page');
      }
      
      const pageData = pageResponse.data.data;

      // Step 2: Check robots.txt
      setProgress({ step: 'Checking robots.txt...', percentage: 40 });
      const robotsResponse = await axios.get(`${API_BASE}/api/robots?url=${encodeURIComponent(url)}`);
      const robotsData = robotsResponse.data;

      // Step 3: Check sitemap
      setProgress({ step: 'Looking for sitemap...', percentage: 60 });
      const sitemapResponse = await axios.get(`${API_BASE}/api/sitemap?url=${encodeURIComponent(url)}`);
      const sitemapData = sitemapResponse.data;

      // Step 4: Check links (only if available in plan)
      let linksData = [];
      if (pageData.links && pageData.links.length > 0) {
        setProgress({ step: 'Validating links...', percentage: 80 });
        try {
          const linksResponse = await axios.post(`${API_BASE}/api/check-links`, {
            links: pageData.links.slice(0, 20)
          });
          linksData = linksResponse.data.data || linksResponse.data || [];
        } catch (linkError) {
          console.log('Link checking error:', linkError);
          linksData = [];
        }
      }

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
        lighthouse: pageData.lighthouse || {}
      });

      setProgress({ step: 'Analysis complete!', percentage: 100 });
      setResults(comprehensiveResults);
      
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

  return { analyze, results, loading, progress, error };
}

export default useAdvancedSEOAnalysis;
