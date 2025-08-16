import React from 'react';
import styled from 'styled-components';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  fullWidth?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  style?: React.CSSProperties;
}

const StyledButton = styled.button.withConfig({
  shouldForwardProp: (prop) => !['variant', 'size', 'fullWidth'].includes(prop)
})<ButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  font-family: inherit;
  width: ${({ fullWidth }) => fullWidth ? '100%' : 'auto'};
  
  ${({ size = 'medium' }) => {
    switch (size) {
      case 'small':
        return `
          padding: 8px 16px;
          font-size: 14px;
          min-height: 36px;
        `;
      case 'large':
        return `
          padding: 16px 32px;
          font-size: 18px;
          min-height: 56px;
        `;
      default:
        return `
          padding: 12px 24px;
          font-size: 16px;
          min-height: 48px;
        `;
    }
  }}

  ${({ variant = 'primary' }) => {
    switch (variant) {
      case 'secondary':
        return `
          background-color: #f8f9fa;
          color: #495057;
          border: 2px solid #dee2e6;
          
          &:hover:not(:disabled) {
            background-color: #e9ecef;
            border-color: #adb5bd;
          }
        `;
      case 'success':
        return `
          background-color: #28a745;
          color: white;
          
          &:hover:not(:disabled) {
            background-color: #218838;
          }
        `;
      case 'danger':
        return `
          background-color: #dc3545;
          color: white;
          
          &:hover:not(:disabled) {
            background-color: #c82333;
          }
        `;
      case 'warning':
        return `
          background-color: #ffc107;
          color: #212529;
          
          &:hover:not(:disabled) {
            background-color: #e0a800;
          }
        `;
      default:
        return `
          background-color: #007bff;
          color: white;
          
          &:hover:not(:disabled) {
            background-color: #0056b3;
          }
        `;
    }
  }}

  ${({ disabled }) => disabled && `
    opacity: 0.6;
    cursor: not-allowed;
    
    &:hover {
      transform: none;
    }
  `}

  &:active:not(:disabled) {
    transform: translateY(1px);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
  }
`;

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  fullWidth = false,
  onClick,
  type = 'button',
  ...props
}) => {
  return (
    <StyledButton
      variant={variant}
      size={size}
      disabled={disabled}
      fullWidth={fullWidth}
      onClick={onClick}
      type={type}
      {...props}
    >
      {children}
    </StyledButton>
  );
};

export default Button;
