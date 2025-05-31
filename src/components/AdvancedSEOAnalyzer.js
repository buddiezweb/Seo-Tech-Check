import React, { useState } from 'react';
import useAdvancedSEOAnalysis from '../hooks/useAdvancedSEOAnalysis';

const AdvancedSEOAnalyzer = () => {
  const [url, setUrl] = useState('');
  const { analyze, results, loading, error } = useAdvancedSEOAnalysis();

  const handleSubmit = (e) => {
    e.preventDefault();
    analyze(url);
  };

  return (
    <div>
      <h1>Advanced SEO Analyzer</h1>
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
          <pre>{JSON.stringify(results, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default AdvancedSEOAnalyzer;
