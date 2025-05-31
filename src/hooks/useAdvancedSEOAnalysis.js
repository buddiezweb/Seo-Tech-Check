import { useState, useCallback } from 'react';
import { runAdvancedChecks } from '../utils/advancedSeoChecks';
import axios from 'axios';

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
      const pageResponse = await axios.post('/api/analyze', { url });

      if (!pageResponse.data) {
        throw new Error('Failed to analyze page');
      }
      
      const pageData = pageResponse.data;

      // Check if user has reached their limit
      if (pageResponse.status === 403) {
        throw new Error(pageData.error);
      }

      // Step 2: Check robots.txt
      setProgress({ step: 'Checking robots.txt...', percentage: 40 });
      const robotsResponse = await axios.get(`/api/robots?url=${encodeURIComponent(url)}`);
      const robotsData = robotsResponse.data;

      // Step 3: Check sitemap
      setProgress({ step: 'Looking for sitemap...', percentage: 60 });
      const sitemapResponse = await axios.get(`/api/sitemap?url=${encodeURIComponent(url)}`);
      const sitemapData = sitemapResponse.data;

      // Step 4: Check links (only if available in plan)
      let linksData = [];
      if (pageData.userPlan !== 'free' && pageData.links && pageData.links.length > 0) {
        setProgress({ step: 'Validating links...', percentage: 80 });
        try {
          const linksResponse = await axios.post('/api/check-links', {
            links: pageData.links.slice(0, 20)
          });
          linksData = linksResponse.data;
        } catch (linkError) {
          console.log('Link checking not available');
        }
      }

      // Step 5: Run comprehensive analysis
      setProgress({ step: 'Running comprehensive analysis...', percentage: 90 });
      const comprehensiveResults = await runAdvancedChecks({
        ...pageData,
        robots: robotsData,
        sitemap: sitemapData,
        linkValidation: linksData
      });

      setProgress({ step: 'Analysis complete!', percentage: 100 });
      setResults(comprehensiveResults);
    } catch (err) {
      if (err.response?.status === 403) {
        setError(err.response.data.error || 'Usage limit reached');
      } else if (err.response?.status === 401) {
        setError('Please login to use this feature');
      } else {
        setError(err.message || 'An error occurred during analysis');
      }
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { analyze, results, loading, progress, error };
}

export default useAdvancedSEOAnalysis;
