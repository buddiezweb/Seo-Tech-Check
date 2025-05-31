import React, { useState } from 'react';
import styled from 'styled-components';

const CheckContainer = styled.div`
  display: flex;
  align-items: flex-start;
  padding: 1rem;
  background: ${props => props.expanded ? '#f7fafc' : 'transparent'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #f7fafc;
  }
`;

const StatusIcon = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  flex-shrink: 0;
  
  ${props => {
    switch (props.status) {
      case 'pass':
        return `
          background: #c6f6d5;
          color: #276749;
        `;
      case 'warn':
        return `
          background: #feebc8;
          color: #975a16;
        `;
      case 'fail':
        return `
          background: #fed7d7;
          color: #9b2c2c;
        `;
      default:
        return '';
    }
  }}
`;

const Content = styled.div`
  flex: 1;
`;

const CheckName = styled.div`
  font-weight: 500;
  color: #2d3748;
  margin-bottom: 0.25rem;
`;

const CheckMessage = styled.div`
  font-size: 0.9rem;
  color: #718096;
  line-height: 1.5;
`;

const Details = styled.div`
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid #e2e8f0;
  font-size: 0.85rem;
  color: #4a5568;
`;

const DetailItem = styled.div`
  margin: 0.25rem 0;
`;

function CheckItem({ check }) {
  const [expanded, setExpanded] = useState(false);

  const getIcon = (status) => {
    switch (status) {
      case 'pass':
        return '✓';
      case 'warn':
        return '!';
      case 'fail':
        return '✗';
      default:
        return '?';
    }
  };

  return (
    <CheckContainer 
      expanded={expanded} 
      onClick={() => check.details && setExpanded(!expanded)}
    >
      <StatusIcon status={check.status}>
        {getIcon(check.status)}
      </StatusIcon>
      <Content>
        <CheckName>{check.name}</CheckName>
        <CheckMessage>{check.message}</CheckMessage>
        {expanded && check.details && (
          <Details>
            {Array.isArray(check.details) ? (
              check.details.map((detail, index) => (
                <DetailItem key={index}>• {detail}</DetailItem>
              ))
            ) : (
              <DetailItem>{check.details}</DetailItem>
            )}
          </Details>
        )}
      </Content>
    </CheckContainer>
  );
}

export default CheckItem;
