import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import AdvancedSEOAnalyzer from './AdvancedSEOAnalyzer';

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

function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  useEffect(() => {
    // Check if user is authenticated
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <Container>
      <Header>
        <HeaderContent>
          <Logo>SEO Tech Check</Logo>
          <UserSection>
            <UsageInfo>
              {user?.usage?.checksToday ?? 0} / {user?.plan === 'free' ? 5 : user?.plan === 'pro' ? 100 : 'Unlimited'} checks today
            </UsageInfo>
            <UserInfo>
              <UserName>{user?.name ?? 'User'}</UserName>
              <UserPlan>{user?.plan ? user.plan.charAt(0).toUpperCase() + user.plan.slice(1) : 'Free'} Plan</UserPlan>
            </UserInfo>
            <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
          </UserSection>
        </HeaderContent>
      </Header>

      <MainContent>
        <WelcomeCard>
          <WelcomeTitle>Welcome back, {user?.name ?? 'User'}!</WelcomeTitle>
          <WelcomeText>
            Ready to analyze your website&apos;s SEO? Enter a URL below to get started.
            {user?.plan === 'free' && ' Upgrade to Pro for unlimited checks and advanced features.'}
          </WelcomeText>
        </WelcomeCard>

        <AdvancedSEOAnalyzer />

        <Footer>
          <FooterContent>
            <p>© 2025 SEO Tech Check. All rights reserved.</p>
          </FooterContent>
        </Footer>
      </MainContent>
    </Container>
  );
}

const Footer = styled.footer`
  background: #1a202c;
  color: #cbd5e0;
  padding: 1.5rem 0;
  text-align: center;
  margin-top: 3rem;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

export default Dashboard;
