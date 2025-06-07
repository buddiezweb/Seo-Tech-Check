import React, { useState } from 'react';
import styled from 'styled-components';
import useSEOAnalysis from '../hooks/useSEOAnalysis';
import ResultsDisplay from './ResultsDisplay';

const Container = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 6px 18px rgba(0,0,0,0.1);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const Form = styled.form`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  justify-content: center;
`;

const Input = styled.input`
  flex: 1;
  max-width: 400px;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border: 2px solid #cbd5e0;
  border-radius: 8px;
  outline: none;
  transition: border-color 0.3s ease;

  &:focus {
    border-color: #667eea;
    box-shadow: 0 0 8px rgba(102, 126, 234, 0.6);
  }
`;

const Button = styled.button`
  padding: 0.75rem 2rem;
  font-size: 1rem;
  font-weight: 700;
  color: white;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s ease;

  &:disabled {
    background: #a0aec0;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
  }
`;

const Loading = styled.p`
  text-align: center;
  color: #4a5568;
  font-weight: 600;
`;

const ErrorMessage = styled.p`
  text-align: center;
  color: #e53e3e;
  font-weight: 700;
`;

const SEOAnalyzer = () => {
  const [url, setUrl] = useState('');
  const { analyze, results, loading, error } = useSEOAnalysis();

  const handleSubmit = (e) => {
    e.preventDefault();
    analyze(url);
  };

  return (
    <Container>
      <Title>SEO Analyzer</Title>
      <Form onSubmit={handleSubmit}>
        <Input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter URL"
          required
          aria-label="URL to analyze"
          disabled={loading}
        />
        <Button type="submit" disabled={loading} aria-label="Analyze SEO">
          {loading ? 'Analyzing...' : 'Analyze'}
        </Button>
      </Form>
      {loading && <Loading>Loading...</Loading>}
      {error && <ErrorMessage>Error: {error}</ErrorMessage>}
      {results && (
        <ResultsDisplay results={results} url={url} />
      )}
    </Container>
  );
};

export default SEOAnalyzer;
