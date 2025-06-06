import React, { useState } from 'react';
import styled from 'styled-components';
import { FaCheckCircle, FaExclamationTriangle, FaTimesCircle } from 'react-icons/fa';
import useAdvancedSEOAnalysis from '../hooks/useAdvancedSEOAnalysis';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const Title = styled.h1`
  font-size: 2.75rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 2rem;
  border-bottom: 2px solid #667eea;
  padding-bottom: 0.5rem;
  text-align: center;
`;

const Form = styled.form`
  max-width: 700px;
  display: flex;
  gap: 1rem;
  margin: 0 auto 2.5rem;
  justify-content: center;
`;

const Input = styled.input`
  flex: 1;
  padding: 0.85rem 1.25rem;
  font-size: 1.125rem;
  border: 2px solid #cbd5e0;
  border-radius: 10px;
  outline: none;
  transition: border-color 0.3s ease;

  &:focus {
    border-color: #667eea;
    box-shadow: 0 0 8px rgba(102, 126, 234, 0.6);
  }
`;

const Button = styled.button`
  padding: 0.85rem 2.5rem;
  font-size: 1.125rem;
  font-weight: 700;
  color: white;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 10px;
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

const ProgressContainer = styled.div`
  max-width: 700px;
  margin: 1rem 0 2rem;
`;

const ProgressBarBackground = styled.div`
  width: 100%;
  height: 14px;
  background: #e2e8f0;
  border-radius: 12px;
`;

const ProgressBarFill = styled.div`
  height: 14px;
  background: #667eea;
  border-radius: 12px;
  width: ${props => props.width}%;
  transition: width 0.5s ease;
`;

const ProgressText = styled.div`
  display: flex;
  justify-content: center;
  font-size: 0.95rem;
  color: #4a5568;
  margin-bottom: 0.5rem;
  font-weight: 600;
  gap: 1rem;
`;

const ErrorMessage = styled.div`
  max-width: 700px;
  background: #fed7d7;
  border: 1px solid #feb2b2;
  color: #c53030;
  padding: 1rem 1.5rem;
  border-radius: 10px;
  margin-bottom: 2rem;
  font-weight: 600;
`;

const ResultsContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
  font-size: 1rem;
  color: #2d3748;
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 1.25rem;
  border-bottom: 2px solid #667eea;
  padding-bottom: 0.5rem;
`;

const ScoreCard = styled.div`
  background: #f7fafc;
  padding: 2rem;
  border-radius: 14px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
  text-align: center;
`;

const ScoreValue = styled.div`
  font-size: 4rem;
  font-weight: 800;
  color: #667eea;
  margin-top: 0.5rem;
`;

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
`;

const CategoryCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 14px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.15);
  }
`;

const CategoryTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: #4a5568;
  margin-bottom: 0.75rem;
  text-transform: capitalize;
`;

const CategoryScore = styled.div`
  font-size: 2.5rem;
  font-weight: 800;
  color: #667eea;
`;

const DetailSection = styled.div`
  margin-bottom: 3rem;
`;

const DetailTitle = styled.h3`
  font-size: 1.75rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 1rem;
  text-transform: capitalize;
  border-bottom: 2px solid #667eea;
  padding-bottom: 0.3rem;
`;

const DetailItem = styled.div`
  background: ${props => 
    props.status === 'PASS' ? '#f0fff4' :
    props.status === 'WARN' ? '#fffaf0' :
    props.status === 'FAIL' ? '#fff5f5' : '#f7fafc'};
  border-left: 8px solid ${props => 
    props.status === 'PASS' ? '#48bb78' :
    props.status === 'WARN' ? '#ed8936' :
    props.status === 'FAIL' ? '#e53e3e' : '#cbd5e0'};
  padding: 1.25rem 1.5rem;
  border-radius: 10px;
  margin-bottom: 1.25rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
`;

const DetailHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
`;

const StatusIcon = styled.div`
  color: ${props => 
    props.status === 'PASS' ? '#48bb78' :
    props.status === 'WARN' ? '#ed8936' :
    props.status === 'FAIL' ? '#e53e3e' : '#a0aec0'};
  font-size: 1.5rem;
`;

const DetailName = styled.h4`
  font-weight: 700;
  color: #2d3748;
  margin: 0;
`;

const DetailMessage = styled.p`
  color: #4a5568;
  margin: 0.25rem 0 0 2.25rem;
  line-height: 1.4;
`;

const DetailList = styled.ul`
  margin-top: 0.5rem;
  padding-left: 2.5rem;
  color: #4a5568;
  list-style-type: disc;
`;

const DetailListItem = styled.li`
  margin-bottom: 0.3rem;
`;

const NoDataMessage = styled.div`
  background: #f7fafc;
  padding: 1rem;
  border-radius: 10px;
  color: #718096;
  font-style: italic;
`;

const AdvancedSEOAnalyzer = ({ onAnalysisComplete }) => {
  const [url, setUrl] = useState('');
  const { analyze, results, loading, progress, error } = useAdvancedSEOAnalysis();

  const handleSubmit = (e) => {
    e.preventDefault();
    analyze(url, onAnalysisComplete);
  };

  // Group categories into 8 categories for top cards
  const groupedCategories = {
    Performance: ['performance', 'mobile'],
    Content: ['content', 'structuredData', 'duplicateTitles', 'duplicateMetaDescriptions'],
    'Technical SEO': [
      'technical', 'hreflang', 'mixedContent', 'excessiveRedirects', 'blockedResources',
      'urlParameters', 'trailingSlash', 'robotsMeta', 'amp', 'sitemapEntries',
      'structuredDataTypes', 'hreflangXDefault', 'noindexPages'
    ],
    Security: ['security'],
    Crawlability: ['crawlability'],
    'Social Media': ['socialMeta'],
    Accessibility: [], // Add accessibility categories if any
    Other: [] // Add any other categories if needed
  };

  // Flatten all categories for detailed sections
  const allCategories = Object.values(groupedCategories).flat();

  const renderResults = () => {
    if (!results) return null;

    // Prepare scores for all categories with placeholders
    const scores = {};
    allCategories.forEach(cat => {
      scores[cat] = results.scores && results.scores[cat] !== undefined ? results.scores[cat] : 'N/A';
    });

    // Prepare summary for all categories with placeholders
    const summary = {};
    allCategories.forEach(cat => {
      summary[cat] = results.summary && results.summary[cat] ? results.summary[cat] : null;
    });

    // Calculate aggregated scores for grouped categories
    const aggregatedScores = {};
    Object.entries(groupedCategories).forEach(([groupName, cats]) => {
      const validScores = cats
        .map(cat => (typeof scores[cat] === 'number' ? scores[cat] : null))
        .filter(score => score !== null);
      const avgScore = validScores.length > 0
        ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
        : 'N/A';
      aggregatedScores[groupName] = avgScore;
    });

    return (
      <ResultsContainer>
        <SectionTitle>Analysis Results</SectionTitle>

        <ScoreCard>
          <h3>Overall Score</h3>
          <ScoreValue>{results.overallScore}/100</ScoreValue>
        </ScoreCard>

        <CategoryGrid>
          {Object.entries(aggregatedScores).map(([groupName, score]) => (
            <CategoryCard key={groupName}>
              <CategoryTitle>{groupName}</CategoryTitle>
              <CategoryScore>{score}</CategoryScore>
            </CategoryCard>
          ))}
        </CategoryGrid>

        {allCategories.map(category => (
          <DetailSection key={category}>
            <DetailTitle>{category} Analysis</DetailTitle>
            {summary[category] && Array.isArray(summary[category]) ? (
              summary[category].map((item, index) => (
                <DetailItem key={index} status={item.status}>
                  <DetailHeader>
                    <StatusIcon status={item.status}>
                      {item.status === 'PASS' && <FaCheckCircle />}
                      {item.status === 'WARN' && <FaExclamationTriangle />}
                      {item.status === 'FAIL' && <FaTimesCircle />}
                    </StatusIcon>
                    <DetailName>{item.name}</DetailName>
                  </DetailHeader>
                  <DetailMessage>{item.message}</DetailMessage>
                  {Array.isArray(item.details) ? (
                    <DetailList>
                      {item.details.map((detail, i) => (
                        <DetailListItem key={i}>{detail}</DetailListItem>
                      ))}
                    </DetailList>
                  ) : (
                    <DetailMessage>{item.details}</DetailMessage>
                  )}
                </DetailItem>
              ))
            ) : (
              <NoDataMessage>No {category} analysis data available</NoDataMessage>
            )}
          </DetailSection>
        ))}
      </ResultsContainer>
    );
  };

  return (
    <Container>
      <Title>Advanced SEO Analyzer</Title>

      <Form onSubmit={handleSubmit}>
        <Input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter URL (e.g., https://example.com)"
          required
          aria-label="URL to analyze"
          disabled={loading}
        />
        <Button type="submit" disabled={loading} aria-label="Analyze SEO">
          {loading ? 'Analyzing...' : 'Analyze'}
        </Button>
      </Form>

      {loading && progress && (
        <ProgressContainer>
          <ProgressText>
            <span>{progress.step}</span>
            <span>{progress.percentage}%</span>
          </ProgressText>
          <ProgressBarBackground>
            <ProgressBarFill width={progress.percentage} />
          </ProgressBarBackground>
        </ProgressContainer>
      )}

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {renderResults()}
    </Container>
  );
};

export default AdvancedSEOAnalyzer;
