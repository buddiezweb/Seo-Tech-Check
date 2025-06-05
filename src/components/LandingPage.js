import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const Header = styled.header`
  padding: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
`;

const Logo = styled.h1`
  color: white;
  font-size: 1.8rem;
`;

const Nav = styled.nav`
  display: flex;
  gap: 1rem;
`;

const NavButton = styled(Link)`
  padding: 0.5rem 1.5rem;
  background: ${props => props.primary ? 'white' : 'transparent'};
  color: ${props => props.primary ? '#667eea' : 'white'};
  border: 2px solid white;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  }
`;

const Hero = styled.section`
  text-align: center;
  padding: 4rem 2rem;
  max-width: 800px;
  margin: 0 auto;
`;

const HeroTitle = styled.h2`
  color: white;
  font-size: 3.5rem;
  margin-bottom: 1.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
`;

const HeroSubtitle = styled.p`
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.3rem;
  margin-bottom: 3rem;
  line-height: 1.8;
`;

const CTAButton = styled(Link)`
  display: inline-block;
  padding: 1rem 3rem;
  background: white;
  color: #667eea;
  font-size: 1.2rem;
  font-weight: 600;
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  }
`;

const Features = styled.section`
  padding: 4rem 2rem;
  background: white;
`;

const FeaturesContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const SectionTitle = styled.h3`
  text-align: center;
  font-size: 2.5rem;
  color: #2d3748;
  margin-bottom: 3rem;
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
`;

const FeatureCard = styled.div`
  padding: 2rem;
  background: #f7fafc;
  border-radius: 12px;
  text-align: center;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  }
`;

const FeatureIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const FeatureTitle = styled.h4`
  color: #2d3748;
  font-size: 1.5rem;
  margin-bottom: 1rem;
`;

const FeatureDescription = styled.p`
  color: #718096;
  line-height: 1.6;
`;

const Pricing = styled.section`
  padding: 4rem 2rem;
  background: #f7fafc;
`;

const PricingGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  max-width: 1000px;
  margin: 0 auto;
`;

const PricingCard = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  text-align: center;
  position: relative;
  ${props => props.$featured && `
    transform: scale(1.05);
    border: 2px solid #667eea;
  `}
`;

const PricingBadge = styled.div`
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: #667eea;
  color: white;
  padding: 0.25rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
`;

const PricingTitle = styled.h4`
  font-size: 1.5rem;
  color: #2d3748;
  margin-bottom: 0.5rem;
`;

const PricingPrice = styled.div`
  font-size: 3rem;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 1rem;

  span {
    font-size: 1rem;
    color: #718096;
  }
`;

const PricingFeatures = styled.ul`
  list-style: none;
  padding: 0;
  margin: 2rem 0;
`;

const PricingFeature = styled.li`
  padding: 0.5rem 0;
  color: #4a5568;

  &:before {
    content: '✓ ';
    color: #48bb78;
    font-weight: 600;
  }
`;

function LandingPage() {
  return (
    <Container>
      <Header>
        <Logo>SEO Tech Check</Logo>
        <Nav>
          <NavButton to="/login">Login</NavButton>
          <NavButton to="/register" primary="true">Get Started</NavButton>
        </Nav>
      </Header>

      <Hero>
        <HeroTitle>Analyze Your Website's SEO Performance</HeroTitle>
        <HeroSubtitle>
          Get comprehensive insights into your website's search engine optimization 
          with SEO Tech Check's advanced analysis tool. Check meta tags, performance, 
          mobile-friendliness, and more.
        </HeroSubtitle>
        <CTAButton to="/register">Start Free Trial</CTAButton>
      </Hero>

      <Features>
        <FeaturesContainer>
          <SectionTitle>Powerful SEO Analysis Features</SectionTitle>
          <FeatureGrid>
            <FeatureCard>
              <FeatureIcon>🚀</FeatureIcon>
              <FeatureTitle>Performance Metrics</FeatureTitle>
              <FeatureDescription>
                Get detailed Core Web Vitals and page speed insights to optimize 
                your site's performance.
              </FeatureDescription>
            </FeatureCard>

            <FeatureCard>
              <FeatureIcon>📱</FeatureIcon>
              <FeatureTitle>Mobile Optimization</FeatureTitle>
              <FeatureDescription>
                Ensure your website is fully optimized for mobile devices with 
                our comprehensive mobile-friendliness checks.
              </FeatureDescription>
            </FeatureCard>

            <FeatureCard>
              <FeatureIcon>🔍</FeatureIcon>
              <FeatureTitle>Technical SEO</FeatureTitle>
              <FeatureDescription>
                Analyze meta tags, structured data, sitemap, robots.txt, and 
                other critical technical SEO elements.
              </FeatureDescription>
            </FeatureCard>

            <FeatureCard>
              <FeatureIcon>📊</FeatureIcon>
              <FeatureTitle>Detailed Reports</FeatureTitle>
              <FeatureDescription>
                Export comprehensive SEO reports in PDF or JSON format for 
                easy sharing and documentation.
              </FeatureDescription>
            </FeatureCard>

            <FeatureCard>
              <FeatureIcon>🔗</FeatureIcon>
              <FeatureTitle>Link Analysis</FeatureTitle>
              <FeatureDescription>
                Identify broken links and analyze your internal and external 
                link structure for better SEO.
              </FeatureDescription>
            </FeatureCard>

            <FeatureCard>
              <FeatureIcon>🛡️</FeatureIcon>
              <FeatureTitle>Security Headers</FeatureTitle>
              <FeatureDescription>
                Check for essential security headers and HTTPS implementation 
                to boost trust and rankings.
              </FeatureDescription>
            </FeatureCard>
          </FeatureGrid>
        </FeaturesContainer>
      </Features>

      <Pricing>
        <FeaturesContainer>
          <SectionTitle>Choose Your Plan</SectionTitle>
          <PricingGrid>
            <PricingCard>
              <PricingTitle>Free</PricingTitle>
              <PricingPrice>$0<span>/month</span></PricingPrice>
              <PricingFeatures>
                <PricingFeature>5 SEO checks per day</PricingFeature>
                <PricingFeature>Basic SEO analysis</PricingFeature>
                <PricingFeature>Meta tags & headings check</PricingFeature>
                <PricingFeature>Mobile-friendliness test</PricingFeature>
                <PricingFeature>JSON export</PricingFeature>
              </PricingFeatures>
              <NavButton to="/register" primary="true" style={{ width: '100%' }}>
                Start Free
              </NavButton>
            </PricingCard>

            <PricingCard $featured>
              <PricingBadge>Most Popular</PricingBadge>
              <PricingTitle>Pro</PricingTitle>
              <PricingPrice>$29<span>/month</span></PricingPrice>
              <PricingFeatures>
                <PricingFeature>100 SEO checks per day</PricingFeature>
                <PricingFeature>Advanced SEO analysis</PricingFeature>
                <PricingFeature>Screenshot capture</PricingFeature>
                <PricingFeature>Link validation</PricingFeature>
                <PricingFeature>Performance metrics</PricingFeature>
                <PricingFeature>PDF & JSON export</PricingFeature>
                <PricingFeature>Priority support</PricingFeature>
              </PricingFeatures>
              <NavButton to="/register" primary="true" style={{ width: '100%' }}>
                Start Pro Trial
              </NavButton>
            </PricingCard>

            <PricingCard>
              <PricingTitle>Enterprise</PricingTitle>
              <PricingPrice>$99<span>/month</span></PricingPrice>
              <PricingFeatures>
                <PricingFeature>Unlimited SEO checks</PricingFeature>
                <PricingFeature>All Pro features</PricingFeature>
                <PricingFeature>API access</PricingFeature>
                <PricingFeature>Custom reports</PricingFeature>
                <PricingFeature>White-label options</PricingFeature>
                <PricingFeature>Dedicated support</PricingFeature>
              </PricingFeatures>
              <NavButton to="/register" primary="true" style={{ width: '100%' }}>
                Contact Sales
              </NavButton>
            </PricingCard>
          </PricingGrid>
        </FeaturesContainer>
      </Pricing>
    </Container>
  );
}

export default LandingPage;
