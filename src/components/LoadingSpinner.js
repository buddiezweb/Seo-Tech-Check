import React from 'react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
`;

const Spinner = styled.div`
  width: 50px;
  height: 50px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const LoadingText = styled.div`
  margin-top: 1.5rem;
  font-size: 1.1rem;
  color: #4a5568;
  animation: ${pulse} 2s ease-in-out infinite;
`;

function LoadingSpinner() {
  return (
    <Container>
      <Spinner />
      <LoadingText>Analyzing SEO metrics...</LoadingText>
    </Container>
  );
}

export default LoadingSpinner;
