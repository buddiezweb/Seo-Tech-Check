import React, { useState } from 'react';
import styled from 'styled-components';
import useSEOAnalysis from '../hooks/useSEOAnalysis';
import useAdvancedSEOAnalysis from '../hooks/useAdvancedSEOAnalysis';
import ResultsDisplay from './ResultsDisplay';
import AdvancedResultsDisplay from './AdvancedResultsDisplay';
import LoadingSpinner from './LoadingSpinner';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const InputSection = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const InputGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Input = styled.input`
  flex: 1;
  padding: 1rem 1.5rem;
  font-size: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const Button = styled.button`
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorMessage = styled.div`
  background: #fed7d7;
  color: #c53030;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
`;

const InfoMessage = styled.div`
  background: #e6f7ff;
  color: #0050b3;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
  font-size: 0.9rem;
  line-height: 1.5;
`;

const ExampleLinks = styled.div`
  margin-top: 1rem;
  font-size: 0.9rem;
  color: #718096;
`;

const ExampleLink = styled.button`
  background: none;
  border: none;
  color: #667eea;
  cursor: pointer;
  text-decoration: underline;
  margin: 0 0.5rem;
  
  &:hover {
    color: #764ba2;
  }
`;

const ModeToggle = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  align-items: center;
`;

const ModeButton = styled.button`
  padding: 0.5rem 1rem;
  border: 2px solid ${props => props.active ? '#667eea' : '#e2e8f0'};
  background: ${props => props.active ? '#667eea' : 'white'};
  color: ${props => props.active ? 'white' : '#718096'};
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #667eea;
  }
`;

function SEOChecker() {
  const [url, setUrl] = useState('');
  const [mode, setMode] = useState('basic'); // 'basic' or 'advanced'
  
  // Basic analysis hook
  const basicAnalysis = useSEOAnalysis();
  
  // Advanced analysis hook
  const advancedAnalysis = useAdvancedSEOAnalysis();
  
  // Choose which hook to use based on mode
  const { analyze, results, loading, error, progress } = 
    mode === 'basic' ? basicAnalysis : advancedAnalysis;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url.trim()) {
      analyze(url);
    }
  };

  const handleExampleClick = (exampleUrl) => {
    setUrl(exampleUrl);
  };

  return (
    <Container>
      <InputSection>
        <ModeToggle>
          <span>Analysis Mode:</span>
          <ModeButton 
            active={mode === 'basic'} 
            onClick={() => setMode('basic')}
          >
            Basic
          </ModeButton>
          <ModeButton 
            active={mode === 'advanced'} 
            onClick={() => setMode('advanced')}
          >
            Advanced (Requires Backend)
          </ModeButton>
        </ModeToggle>
        
        <form onSubmit={handleSubmit}>
          <InputGroup>
            <Input
              type="url"
              placeholder="Enter URL to analyze (e.g., https://example.com)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
            <Button type="submit" disabled={loading}>
              {loading ? 'Analyzing...' : 'Check SEO'}
            </Button>
          </InputGroup>
        </form>
        
        <ExampleLinks>
          Try examples:
          <ExampleLink onClick={() => handleExampleClick('https://example.com')}>
            example.com
          </ExampleLink>
          <ExampleLink onClick={() => handleExampleClick('https://www.wikipedia.org')}>
            wikipedia.org
          </ExampleLink>
        </ExampleLinks>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <InfoMessage>
          <strong>Note:</strong> 
          {mode === 'basic' 
            ? ' Basic mode uses client-side analysis with demo data due to CORS restrictions.'
            : ' Advanced mode requires the backend server running on localhost:3001 for full analysis.'
          }
        </InfoMessage>
      </InputSection>

      {loading && mode === 'basic' && <LoadingSpinner />}
      
      {mode === 'advanced' && (loading || results) && (
        <AdvancedResultsDisplay 
          results={results} 
          url={url} 
          progress={progress}
        />
      )}
      
      {mode === 'basic' && results && !loading && (
        <ResultsDisplay results={results} url={url} />
      )}
    </Container>
  );
}

export default SEOChecker;
