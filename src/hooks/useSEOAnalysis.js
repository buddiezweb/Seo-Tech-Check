import { useState, useCallback } from 'react';
import axios from 'axios';
import { runAllChecks } from '../utils/seoChecks'; // Ensure this utility function is correctly implemented
import API_URL from '../config';

function useSEOAnalysis() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyze = useCallback(async (inputUrl) => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      let urlString = inputUrl.trim();

      // If protocol is missing, add https:// by default
      if (!/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(urlString)) {
        urlString = 'https://' + urlString;
      }

      // Validate URL format with try/catch
      let urlObj;
      try {
        urlObj = new URL(urlString);
      } catch (_) {
        throw new Error('Please enter a valid URL including protocol (http:// or https://)');
      }

      const url = urlObj.href;

      // Call backend API analyze endpoint instead of external scrape.do API
      const response = await axios.post(`${API_URL}/api/analyze`, { url });

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to analyze the webpage. Please check the URL and try again.');
      }

      const analysisData = response.data.data;

      // Run all SEO checks with available data (assuming analysisData.html contains the HTML content)
      const parser = new DOMParser();
      const doc = parser.parseFromString(analysisData.html, 'text/html');

      const checkResults = await runAllChecks(doc, url);
      console.log("Fetched Results:", checkResults); // Log the results for debugging
      setResults(checkResults);
    } catch (err) {
      setError(err.message || 'An error occurred while analyzing the URL');
      console.error('SEO Analysis Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { analyze, results, loading, error };
}

export default useSEOAnalysis;
