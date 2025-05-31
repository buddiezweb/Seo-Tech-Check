import { useState, useCallback } from 'react';
import { runAllChecks } from '../utils/seoChecks';

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

      // Fetch page HTML content via a free CORS proxy (allorigins)
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch the webpage. Please check the URL and try again.');
      }

      const data = await response.json();
      const html = data.contents;

      // Parse the HTML content
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Placeholder empty data arrays and objects for checks that require additional data:
      const linksFromBackend = [];        // Links with HTTP status for broken link detection
      const resourcesFromBackend = [];    // Resources info including headers for security checks
      const sitemapData = null;            // Sitemap info; null means no sitemap data
      const robotsData = null;             // Robots.txt data and crawl permission info
      const allPagesData = [];             // Metadata for duplicate content detection

      // Run all SEO checks with available data
      const checkResults = await runAllChecks(
        doc,
        url,
        linksFromBackend,
        resourcesFromBackend,
        sitemapData,
        robotsData,
        allPagesData
      );

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
