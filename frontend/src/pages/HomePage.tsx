import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { Concert } from '../types';
import { concertAPI } from '../services/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

// 이미지 경로 (public 폴더 기준)
const kpopImg = '/imgs/kpop.jpg';
const classImg = '/imgs/class.jpg';
const rockImg = '/imgs/rock.jpeg';

const HomeContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
  width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
  
  @media (max-width: 1200px) {
    max-width: 1000px;
    padding: 20px;
  }
  
  @media (max-width: 768px) {
    padding: 16px;
    max-width: 100%;
  }
  
  @media (max-width: 480px) {
    padding: 12px;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 48px;
  
  @media (max-width: 768px) {
    margin-bottom: 32px;
  }
`;

const Title = styled.h1`
  font-size: 3rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 16px;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.5rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.25rem;
  color: #666;
  margin-bottom: 32px;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 24px;
  }
`;

const ConcertGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 32px;
  margin-bottom: 48px;
  width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 28px;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
    margin-bottom: 32px;
  }
  
  @media (max-width: 480px) {
    gap: 12px;
    margin-bottom: 24px;
  }
`;

const ConcertCard = styled(Card)`
  position: relative;
  overflow: hidden;
  width: 100%;
  min-height: 450px;
  box-sizing: border-box;
  max-width: 100%;
  
  @media (max-width: 1200px) {
    min-height: 420px;
  }
  
  @media (max-width: 768px) {
    min-height: 350px;
  }
  
  @media (max-width: 480px) {
    min-height: 300px;
  }
`;

const ConcertImage = styled.div.withConfig({
  shouldForwardProp: (prop) => !['priority', 'imageUrl'].includes(prop)
})<{ priority: string; imageUrl: string }>`
  width: 100%;
  height: 220px;
  background: ${({ priority, imageUrl }) => {
    if (imageUrl) {
      return `url(${imageUrl}) center/cover no-repeat`;
    }
    switch (priority) {
      case 'vip':
        return 'linear-gradient(135deg, #ffd700, #ffed4e)';
      case 'premium':
        return 'linear-gradient(135deg, #c0c0c0, #e5e5e5)';
      default:
        return 'linear-gradient(135deg, #007bff, #0056b3)';
    }
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: -24px -24px 24px -24px;
  position: relative;
  
  @media (max-width: 1200px) {
    height: 200px;
  }
  
  @media (max-width: 768px) {
    height: 180px;
    margin: -16px -16px 16px -16px;
  }
  
  @media (max-width: 480px) {
    height: 150px;
    margin: -12px -12px 12px -12px;
  }
`;

const ConcertInfo = styled.div`
  h3 {
    font-size: 1.6rem;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 12px;
    
    @media (max-width: 1200px) {
      font-size: 1.5rem;
    }
    
    @media (max-width: 768px) {
      font-size: 1.4rem;
    }
  }
  
  p {
    color: #666;
    margin-bottom: 10px;
    font-size: 1.1rem;
    
    @media (max-width: 1200px) {
      font-size: 1rem;
    }
    
    &.artist {
      font-weight: 500;
      color: #007bff;
    }
    
    &.venue {
      font-size: 1rem;
    }
    
    &.date {
      font-size: 1rem;
      color: #28a745;
    }
  }
`;

const ConcertStats = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 20px 0;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  
  @media (max-width: 1200px) {
    padding: 18px;
  }
  
  .stat {
    text-align: center;
    
    .value {
      font-size: 1.4rem;
      font-weight: 600;
      color: #007bff;
      
      @media (max-width: 1200px) {
        font-size: 1.3rem;
      }
    }
    
    .label {
      font-size: 0.9rem;
      color: #666;
      text-transform: uppercase;
    }
  }
`;

const PriorityBadge = styled.span<{ priority: string }>`
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  color: white;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  
  ${({ priority }) => {
    switch (priority) {
      case 'vip':
        return 'background-color: #ffd700; color: #1a1a1a;';
      case 'premium':
        return 'background-color: #c0c0c0; color: #1a1a1a;';
      default:
        return 'background-color: #007bff; color: white;';
    }
  }}
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 1.25rem;
  color: #666;
  width: 100%;
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 48px;
  color: #dc3545;
  font-size: 1.25rem;
  width: 100%;
`;

const HomePage: React.FC = () => {
  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    fetchConcerts();
  }, []);

  // 예매 완료 후 상태 변경 감지
  useEffect(() => {
    if (location.state?.bookingCompleted) {
      // 예매 완료 후 콘서트 데이터 새로고침
      fetchConcerts();
      // 상태 초기화
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const fetchConcerts = async () => {
    try {
      setLoading(true);
      const response = await concertAPI.getConcerts();
      if (response.success) {
        setConcerts(response.data);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('공연 정보를 불러오는데 실패했습니다.');
      console.error('Error fetching concerts:', err);
    } finally {
      setLoading(false);
    }
  };

  const getConcertImage = (index: number) => {
    switch (index) {
      case 0:
        return kpopImg;
      case 1:
        return classImg;
      case 2:
        return rockImg;
      default:
        return '';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  if (loading) {
    return (
      <HomeContainer>
        <LoadingSpinner>🎭 공연 정보를 불러오는 중...</LoadingSpinner>
      </HomeContainer>
    );
  }

  if (error) {
    return (
      <HomeContainer>
        <ErrorMessage>
          ❌ {error}
          <br />
          <Button onClick={fetchConcerts} variant="primary" style={{ marginTop: '16px' }}>
            다시 시도
          </Button>
        </ErrorMessage>
      </HomeContainer>
    );
  }

  return (
    <HomeContainer>
      <Header>
        <Title>🎭 공연 좌석 예매 시스템</Title>
        <Subtitle>
          최고의 공연을 위한 최고의 좌석을 예매하세요
        </Subtitle>
      </Header>

      <ConcertGrid>
        {concerts.map((concert, index) => {
          const priority = 'normal';
          const imageUrl = getConcertImage(index);
          
          return (
            <ConcertCard key={concert.id} hover>
              <PriorityBadge priority={priority}>
                Standard
              </PriorityBadge>
              
              <ConcertImage priority={priority} imageUrl={imageUrl}>
              </ConcertImage>
              
              <ConcertInfo>
                <h3>{concert.title}</h3>
                <p className="artist">🎤 {concert.artist}</p>
                <p className="venue">📍 {concert.venue}</p>
                <p className="date">📅 {formatDate(concert.date)}</p>
                
                <ConcertStats>
                  <div className="stat">
                    <div className="value">{formatPrice(concert.price)}</div>
                    <div className="label">가격</div>
                  </div>
                  <div className="stat">
                    <div className="value">{concert.totalSeats.toLocaleString()}</div>
                    <div className="label">총 좌석</div>
                  </div>
                  <div className="stat">
                    <div className="value">{concert.status}</div>
                    <div className="label">상태</div>
                  </div>
                </ConcertStats>
                
                <Button 
                  variant="primary" 
                  fullWidth 
                  onClick={() => window.location.href = `/concert/${concert.id}`}
                >
                  좌석 선택하기
                </Button>
              </ConcertInfo>
            </ConcertCard>
          );
        })}
      </ConcertGrid>
    </HomeContainer>
  );
};

export default HomePage;
