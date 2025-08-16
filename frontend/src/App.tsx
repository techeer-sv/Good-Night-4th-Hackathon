import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import styled from 'styled-components';
import HomePage from './pages/HomePage';
import SeatSelectionPage from './pages/SeatSelectionPage';
import BookingPage from './pages/BookingPage';

const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f8f9fa;
  width: 100%;
`;

const Header = styled.header`
  background: linear-gradient(135deg, #007bff, #0056b3);
  color: white;
  padding: 1rem 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  box-sizing: border-box;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const HeaderContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  
  @media (max-width: 1200px) {
    max-width: 1000px;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  flex-shrink: 0;
  
  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const Nav = styled.nav`
  display: flex;
  gap: 2rem;
  flex-shrink: 0;
  
  @media (max-width: 768px) {
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: center;
  }
`;

const NavLink = styled.a`
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: background-color 0.2s ease-in-out;
  white-space: nowrap;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  @media (max-width: 768px) {
    padding: 0.25rem 0.5rem;
    font-size: 0.9rem;
  }
`;

const Footer = styled.footer`
  background: #343a40;
  color: #adb5bd;
  text-align: center;
  padding: 2rem;
  margin-top: auto;
  
  @media (max-width: 768px) {
    padding: 1.5rem 1rem;
  }
`;

const App: React.FC = () => {
  const scrollToTop = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); };
  return (
    <Router>
      <AppContainer>
        <Header>
          <HeaderContent>
            <Logo onClick={scrollToTop}>
              🎭 공연 좌석 예매
            </Logo>
            <Nav>
              <NavLink href="/">홈</NavLink>
              <NavLink href="/">공연 목록</NavLink>
              <NavLink href="/">서비스 소개</NavLink>
            </Nav>
          </HeaderContent>
        </Header>
        <main style={{ flex: 1, width: '100%', maxWidth: '1400px', margin: '0 auto', boxSizing: 'border-box', overflowX: 'hidden' }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/concert/:id" element={<SeatSelectionPage />} />
            <Route path="/booking" element={<BookingPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer>
          <p>© 2024 공연 좌석 예매 시스템. All rights reserved.</p>
        </Footer>
      </AppContainer>
    </Router>
  );
};

export default App;
