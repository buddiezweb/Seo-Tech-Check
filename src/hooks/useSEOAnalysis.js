import { useState, useCallback } from 'react';
import { runAllChecks } from '../utils/seoChecks'; // Ensure this utility function is correctly implemented

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

      // Fetch page HTML content via scrape.do API to bypass Cloudflare
      const scrapeDoUrl = `http://api.scrape.do?token=1048c4342ada4e9ca4f82c0288bff93c37902a5dff4&url=${encodeURIComponent(url)}`;
      const response = await fetch(scrapeDoUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch the webpage via scrape.do. Please check the URL and try again.');
      }

      const html = await response.text();

      // Parse the HTML content
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Run all SEO checks with available data
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
