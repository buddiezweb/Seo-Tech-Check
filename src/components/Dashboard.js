import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import SEOChecker from './SEOChecker';

const Container = styled.div`
  min-height: 100vh;
  background: #f5f7fa;
`;

const Header = styled.header`
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1rem 2rem;
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled.h1`
  font-size: 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

const UserInfo = styled.div`
  text-align: right;
`;

const UserName = styled.div`
  font-weight: 600;
  color: #2d3748;
`;

const UserPlan = styled.div`
  font-size: 0.9rem;
  color: #718096;
`;

const UsageInfo = styled.div`
  background: #e6f7ff;
  color: #0050b3;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
`;

const LogoutButton = styled.button`
  padding: 0.5rem 1rem;
  background: transparent;
  color: #e53e3e;
  border: 2px solid #e53e3e;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #e53e3e;
    color: white;
  }
`;

const MainContent = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const WelcomeCard = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const WelcomeTitle = styled.h2`
  color: #2d3748;
  margin-bottom: 1rem;
`;

const WelcomeText = styled.p`
  color: #718096;
  line-height: 1.6;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border-left: 4px solid ${props => props.color || '#667eea'};
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: ${props => props.color || '#667eea'};
`;

const StatLabel = styled.div`
  color: #718096;
  font-size: 0.9rem;
  margin-top: 0.5rem;
`;

const HistorySection = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  margin-top: 2rem;
`;

const HistoryTitle = styled.h3`
  color: #2d3748;
  margin-bottom: 1.5rem;
`;

const HistoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const HistoryItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f7fafc;
  border-radius: 8px;
  transition: all 0.3s ease;

  &:hover {
    background: #e2e8f0;
  }
`;

const HistoryUrl = styled.div`
  font-weight: 500;
  color: #2d3748;
`;

const HistoryDate = styled.div`
  font-size: 0.9rem;
  color: #718096;
`;

const HistoryScore = styled.div`
  font-weight: 600;
  color: ${props => {
    if (props.score >= 80) return '#48bb78';
    if (props.score >= 60) return '#ed8936';
    return '#e53e3e';
  }};
`;

function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [analyses, setAnalyses] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    fetchAnalysisHistory();
  }, []);

  const fetchAnalysisHistory = async () => {
    try {
      const response = await axios.get('/api/analyses');
      setAnalyses(response.data.data);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getDailyLimit = () => {
    const limits = {
      free: 5,
      pro: 100,
      enterprise: 'Unlimited'
    };
    return limits[user.plan];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Container>
      <Header>
        <HeaderContent>
          <Logo>SEO Checker Pro</Logo>
          
          <UserSection>
            <UsageInfo>
              {user.usage.checksToday} / {getDailyLimit()} checks today
            </UsageInfo>
            
            <UserInfo>
              <UserName>{user.name}</UserName>
              <UserPlan>{user.plan.charAt(0).toUpperCase() + user.plan.slice(1)} Plan</UserPlan>
            </UserInfo>
            
            <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
          </UserSection>
        </HeaderContent>
      </Header>

      <MainContent>
        <WelcomeCard>
          <WelcomeTitle>Welcome back, {user.name}!</WelcomeTitle>
          <WelcomeText>
            Ready to analyze your website's SEO? Enter a URL below to get started.
            {user.plan === 'free' && ' Upgrade to Pro for unlimited checks and advanced features.'}
          </WelcomeText>
        </WelcomeCard>

        <StatsGrid>
          <StatCard color="#667eea">
            <StatValue color="#667eea">{user.usage.totalChecks}</StatValue>
            <StatLabel>Total Analyses</StatLabel>
          </StatCard>
          
          <StatCard color="#48bb78">
            <StatValue color="#48bb78">{user.usage.checksToday}</StatValue>
            <StatLabel>Today's Checks</StatLabel>
          </StatCard>
          
          <StatCard color="#ed8936">
            <StatValue color="#ed8936">
              {getDailyLimit() === 'Unlimited' ? '∞' : getDailyLimit() - user.usage.checksToday}
            </StatValue>
            <StatLabel>Remaining Today</StatLabel>
          </StatCard>
        </StatsGrid>

        <SEOChecker onAnalysisComplete={fetchAnalysisHistory} />

        {analyses.length > 0 && (
          <HistorySection>
            <HistoryTitle>Recent Analyses</HistoryTitle>
            <HistoryList>
              {analyses.map(analysis => (
                <HistoryItem key={analysis._id}>
                  <div>
                    <HistoryUrl>{analysis.url}</HistoryUrl>
                    <HistoryDate>{formatDate(analysis.createdAt)}</HistoryDate>
                  </div>
                  <HistoryScore score={analysis.score}>
                    {analysis.score}%
                  </HistoryScore>
                </HistoryItem>
              ))}
            </HistoryList>
          </HistorySection>
        )}
      </MainContent>
    </Container>
  );
}

export default Dashboard;
