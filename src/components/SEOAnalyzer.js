import React, { useState } from 'react';
import useSEOAnalysis from '../hooks/useSEOAnalysis';

const SEOAnalyzer = () => {
  const [url, setUrl] = useState('');
  const { analyze, results, loading, error } = useSEOAnalysis();

  const handleSubmit = (e) => {
    e.preventDefault();
    analyze(url);
  };

  return (
    <div>
      <h1>SEO Analyzer</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter URL"
          required
        />
        <button type="submit" disabled={loading}>
          Analyze
        </button>
      </form>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {results && (
        <div>
          <h2>Analysis Results</h2>
          <pre>{JSON.stringify(results, null, 2)}</pre> {/* Display results as JSON for debugging */}
          {/* You can replace the above line with your custom rendering logic */}
        </div>
      )}
    </div>
  );
};

export default SEOAnalyzer;
