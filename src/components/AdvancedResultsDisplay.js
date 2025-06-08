import React, { useState } from 'react';
import styled from 'styled-components';
import CheckItem from './CheckItem';

const ResultsContainer = styled.div`
  display: grid;
  gap: 2rem;
`;

const SummaryCard = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
`;

const MetricGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
`;

const MetricCard = styled.div`
  text-align: center;
  padding: 1.5rem;
  background: ${props => props.background || '#f7fafc'};
  border-radius: 12px;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }
`;

const MetricValue = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: ${props => props.color || '#2d3748'};
  margin-bottom: 0.5rem;
`;

const MetricLabel = styled.div`
  font-size: 0.9rem;
  color: #718096;
`;

const TabContainer = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const TabList = styled.div`
  display: flex;
  background: #f7fafc;
  overflow-x: auto;
`;

const Tab = styled.button`
  padding: 1rem 2rem;
  background: ${props => props.active ? 'white' : 'transparent'};
  border: none;
  font-weight: ${props => props.active ? '600' : '500'};
  color: ${props => props.active ? '#667eea' : '#718096'};
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;

  &:hover {
    background: ${props => props.active ? 'white' : '#e6f2ff'};
  }
`;

const TabContent = styled.div`
  padding: 2rem;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 1rem;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  width: ${props => props.percentage}%;
  transition: width 0.3s ease;
`;

const ProgressText = styled.div`
  text-align: center;
  color: #718096;
  font-size: 0.9rem;
`;

import React, { useState } from 'react';
import styled from 'styled-components';
import CheckItem from './CheckItem';

const ResultsContainer = styled.div`
  display: grid;
  gap: 2rem;
`;

const SummaryCard = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
`;

const MetricGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
`;

const MetricCard = styled.div`
  text-align: center;
  padding: 1.5rem;
  background: ${props => props.background || '#f7fafc'};
  border-radius: 12px;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }
`;

const MetricValue = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: ${props => props.color || '#2d3748'};
  margin-bottom: 0.5rem;
`;

const MetricLabel = styled.div`
  font-size: 0.9rem;
  color: #718096;
`;

const TabContainer = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const TabList = styled.div`
  display: flex;
  background: #f7fafc;
  overflow-x: auto;
`;

const Tab = styled.button`
  padding: 1rem 2rem;
  background: ${props => props.active ? 'white' : 'transparent'};
  border: none;
  font-weight: ${props => props.active ? '600' : '500'};
  color: ${props => props.active ? '#667eea' : '#718096'};
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;

  &:hover {
    background: ${props => props.active ? 'white' : '#e6f2ff'};
  }
`;

const TabContent = styled.div`
  padding: 2rem;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 1rem;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  width: ${props => props.percentage}%;
  transition: width 0.3s ease;
`;

const ProgressText = styled.div`
  text-align: center;
  color: #718096;
  font-size: 0.9rem;
`;

function AdvancedResultsDisplay({ results, url, progress }) {
  const [activeTab, setActiveTab] = useState('summary');

  if (progress && progress.percentage < 100) {
    return (
      <SummaryCard>
        <h3>Analyzing {url}</h3>
        <ProgressBar>
          <ProgressFill percentage={progress.percentage} />
        </ProgressBar>
        <ProgressText>{progress.step}</ProgressText>
      </SummaryCard>
    );
  }

  if (!results) return null;

  const getScoreFromSummary = () => {
    const summaryMessage = results.summary?.[0]?.message || '';
    const match = summaryMessage.match(/(\d+)%/);
    return match ? parseInt(match[1]) : 0;
  };

  const score = getScoreFromSummary();

  const filteredResults = Object.fromEntries(
    Object.entries(results).filter(([key]) => !['crawlability', 'socialMedia', 'accessibility', 'other'].includes(key))
  );

  const renderSummary = () => (
    <>
      <h2>SEO Analysis Summary</h2>
      <MetricGrid>
        <MetricCard background="#e6fffa">
          <MetricValue color={score >= 80 ? '#48bb78' : score >= 60 ? '#ed8936' : '#e53e3e'}>
            {score}%
          </MetricValue>
          <MetricLabel>Overall Score</MetricLabel>
        </MetricCard>
        
        <MetricCard background="#f0fff4">
          <MetricValue color="#48bb78">
            {Object.values(filteredResults).flat().filter(c => c?.status === 'pass').length}
          </MetricValue>
          <MetricLabel>Passed Checks</MetricLabel>
        </MetricCard>
        
        <MetricCard background="#fef5e7">
          <MetricValue color="#f6ad55">
            {Object.values(filteredResults).flat().filter(c => c?.status === 'warn').length}
          </MetricValue>
          <MetricLabel>Warnings</MetricLabel>
        </MetricCard>
        
        <MetricCard background="#fed7e2">
          <MetricValue color="#e53e3e">
            {Object.values(filteredResults).flat().filter(c => c?.status === 'fail').length}
          </MetricValue>
          <MetricLabel>Failed Checks</MetricLabel>
        </MetricCard>
      </MetricGrid>

      <div style={{ marginTop: '2rem' }}>
        {filteredResults.summary?.map((item, index) => (
          <CheckItem key={index} check={item} />
        ))}
      </div>
    </>
  );

  const tabs = [
    { id: 'summary', label: 'Summary', content: renderSummary },
    { id: 'performance', label: 'Performance', content: () => renderChecks(filteredResults.performance) },
    { id: 'technical', label: 'Technical SEO', content: () => renderChecks(filteredResults.technical) },
    { id: 'content', label: 'Content', content: () => renderChecks(filteredResults.content) },
    { id: 'mobile', label: 'Mobile', content: () => renderChecks(filteredResults.mobile) },
    { id: 'security', label: 'Security', content: () => renderChecks(filteredResults.security) },
    { id: 'structured', label: 'Structured Data', content: () => renderChecks(filteredResults.structuredData) },
  ];

  const renderChecks = (checks) => (
    <div>
      {checks?.map((check, index) => (
        <CheckItem key={index} check={check} />
      ))}
    </div>
  );

  return (
    <ResultsContainer>
      <TabContainer>
        <TabList>
          {tabs.map(tab => (
            <Tab 
              key={tab.id}
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </Tab>
          ))}
        </TabList>
        
        <TabContent>
          {tabs.find(tab => tab.id === activeTab)?.content()}
        </TabContent>
      </TabContainer>
    </ResultsContainer>
  );
}


export default AdvancedResultsDisplay;
