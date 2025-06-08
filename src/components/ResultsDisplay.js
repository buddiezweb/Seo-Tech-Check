import React from 'react';
import styled from 'styled-components';
import CheckItem from './CheckItem';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const ResultsContainer = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  color: #2d3748;
`;

const ScoreCard = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
`;

const Score = styled.div`
  text-align: center;
`;

const ScoreValue = styled.div`
  font-size: 3rem;
  font-weight: 700;
  color: ${props => {
    if (props.score >= 80) return '#48bb78';
    if (props.score >= 60) return '#ed8936';
    return '#e53e3e';
  }};
`;

const ScoreLabel = styled.div`
  font-size: 0.9rem;
  color: #718096;
`;

const ExportButtons = styled.div`
  display: flex;
  gap: 1rem;
`;

const ExportButton = styled.button`
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: #667eea;
  background: white;
  border: 2px solid #667eea;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #667eea;
    color: white;
  }
`;

const Section = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.2rem;
  color: #2d3748;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e2e8f0;
`;

const ChecksList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

function ResultsDisplay({ results, url }) {
  const calculateScore = () => {
    const totalChecks = Object.values(results).flat().length;
    const passedChecks = Object.values(results).flat().filter(check => check.status === 'pass').length;
    return Math.round((passedChecks / totalChecks) * 100);
  };

  const exportJSON = () => {
    const dataStr = JSON.stringify({ url, results, score: calculateScore() }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `seo-report-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.text('SEO Analysis Report', 14, 22);
    
    // URL and Score
    doc.setFontSize(12);
    doc.text(`URL: ${url}`, 14, 35);
    doc.text(`Overall Score: ${calculateScore()}%`, 14, 42);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 49);
    
    // Results table
    const tableData = [];
    Object.entries(results).forEach(([category, checks]) => {
      if (['crawlability', 'socialMedia', 'accessibility', 'other'].includes(category)) {
        return; // Skip these categories
      }
      checks.forEach(check => {
        tableData.push([
          category.charAt(0).toUpperCase() + category.slice(1),
          check.name,
          check.status.toUpperCase(),
          check.message
        ]);
      });
    });
    
    doc.autoTable({
      head: [['Category', 'Check', 'Status', 'Details']],
      body: tableData,
      startY: 60,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [102, 126, 234] }
    });
    
    doc.save(`seo-report-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const score = calculateScore();

  const filteredResults = Object.fromEntries(
    Object.entries(results).filter(([key]) => !['crawlability', 'socialMedia', 'accessibility', 'other', 'indexability', 'performance', 'mobile'].includes(key))
  );

  return (
    <ResultsContainer>
      <Header>
        <Title>SEO Analysis Results</Title>
        <ScoreCard>
          <Score>
            <ScoreValue score={score}>{score}%</ScoreValue>
            <ScoreLabel>Overall Score</ScoreLabel>
          </Score>
          <ExportButtons>
            <ExportButton onClick={exportJSON}>Export JSON</ExportButton>
            <ExportButton onClick={exportPDF}>Export PDF</ExportButton>
          </ExportButtons>
        </ScoreCard>
      </Header>

      <Section>
        <SectionTitle>Meta Tags</SectionTitle>
        <ChecksList>
          {filteredResults.metaTags?.map((check, index) => (
            <CheckItem key={index} check={check} />
          ))}
        </ChecksList>
      </Section>

      <Section>
        <SectionTitle>Content Structure</SectionTitle>
        <ChecksList>
          {results.contentStructure?.map((check, index) => (
            <CheckItem key={index} check={check} />
          ))}
        </ChecksList>
      </Section>

      {/* Removed Social Media section as per user request */}

      {/* <Section>
        <SectionTitle>Indexability</SectionTitle>
        <ChecksList>
          {results.indexability?.map((check, index) => (
            <CheckItem key={index} check={check} />
          ))}
        </ChecksList>
      </Section> */}
      <Section>
        <SectionTitle>Structured Data</SectionTitle>
        <ChecksList>
          {results.structuredData?.map((check, index) => (
            <CheckItem key={index} check={check} />
          ))}
        </ChecksList>
      </Section>
      {/* <Section>
        <SectionTitle>Performance</SectionTitle>
        <ChecksList>
          {results.performance?.map((check, index) => (
            <CheckItem key={index} check={check} />
          ))}
        </ChecksList>
      </Section> */}
      {/* <Section>
        <SectionTitle>Mobile Friendliness</SectionTitle>
        <ChecksList>
          {results.mobile?.map((check, index) => (
            <CheckItem key={index} check={check} />
          ))}
        </ChecksList>
      </Section> */}
      <Section>
        <SectionTitle>Images</SectionTitle>
        <ChecksList>
          {results.images?.map((check, index) => (
            <CheckItem key={index} check={check} />
          ))}
        </ChecksList>
      </Section>
      <Section>
        <SectionTitle>Links</SectionTitle>
        <ChecksList>
          {results.links?.map((check, index) => (
            <CheckItem key={index} check={check} />
          ))}
        </ChecksList>
      </Section>
    </ResultsContainer>
  );
}

export default ResultsDisplay;