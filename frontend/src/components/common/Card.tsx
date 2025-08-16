import React from 'react';
import styled from 'styled-components';

interface CardProps {
  children: React.ReactNode;
  padding?: 'small' | 'medium' | 'large';
  shadow?: 'none' | 'small' | 'medium' | 'large';
  hover?: boolean;
  onClick?: () => void;
}

const StyledCard = styled.div.withConfig({
  shouldForwardProp: (prop) => !['padding', 'shadow', 'hover'].includes(prop)
})<CardProps>`
  background: white;
  border-radius: 12px;
  border: 1px solid #e9ecef;
  overflow: hidden;
  transition: all 0.2s ease-in-out;
  width: 100%;
  
  ${({ padding = 'medium' }) => {
    switch (padding) {
      case 'small':
        return 'padding: 16px;';
      case 'large':
        return 'padding: 32px;';
      default:
        return 'padding: 24px;';
    }
  }}

  ${({ shadow = 'medium' }) => {
    switch (shadow) {
      case 'none':
        return 'box-shadow: none;';
      case 'small':
        return 'box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);';
      case 'large':
        return 'box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);';
      default:
        return 'box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);';
    }
  }}

  ${({ hover, onClick }) => hover && `
    cursor: ${onClick ? 'pointer' : 'default'};
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
    }
  `}

  ${({ onClick }) => onClick && `
    cursor: pointer;
    
    &:active {
      transform: translateY(0);
    }
  `}
`;

const Card: React.FC<CardProps> = ({
  children,
  padding = 'medium',
  shadow = 'medium',
  hover = false,
  onClick,
  ...props
}) => {
  return (
    <StyledCard
      padding={padding}
      shadow={shadow}
      hover={hover}
      onClick={onClick}
      {...props}
    >
      {children}
    </StyledCard>
  );
};

export default Card;
