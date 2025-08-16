import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Reservation from './reservation';

const HomeContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
  padding: 20px;
`;

const Title = styled.h1`
  color: #333;
  margin-bottom: 30px;
  font-size: 28px;
  text-align: center;
`;

const SeatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-bottom: 30px;
`;

const Seat = styled.div`
  width: 80px;
  height: 80px;
  background: ${props => {
    if (props.$isBooked) return '#f44336'; // 예약된 좌석 - 빨간색
    if (props.$isSelected) return '#4CAF50'; // 선택된 좌석 - 초록색
    return '#fff'; // 빈 좌석 - 흰색
  }};
  border: 2px solid ${props => {
    if (props.$isBooked) return '#f44336';
    if (props.$isSelected) return '#4CAF50';
    return '#ddd';
  }};
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: ${props => props.$isBooked ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  font-weight: bold;
  color: ${props => props.$isBooked ? '#fff' : props.$isSelected ? '#fff' : '#333'};
  opacity: ${props => props.$isBooked ? 0.7 : 1};
  
  &:hover {
    transform: ${props => props.$isBooked ? 'none' : 'translateY(-2px)'};
    box-shadow: ${props => props.$isBooked ? 'none' : '0 4px 12px rgba(0, 0, 0, 0.15)'};
    border-color: ${props => props.$isBooked ? '#f44336' : props.$isSelected ? '#4CAF50' : '#4CAF50'};
  }
  
  &:active {
    transform: ${props => props.$isBooked ? 'none' : 'translateY(0)'};
  }
`;

const SeatNumber = styled.span`
  font-size: 16px;
`;

const SeatStatus = styled.div`
  font-size: 10px;
  margin-top: 2px;
  text-align: center;
`;

const SelectedSeats = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  min-width: 300px;
`;

const SelectedSeatsTitle = styled.h3`
  color: #333;
  margin-bottom: 15px;
  font-size: 18px;
`;

const SelectedSeatsList = styled.div`
  color: #666;
  font-size: 14px;
  line-height: 1.6;
`;

const Legend = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;
  font-size: 14px;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const LegendColor = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 1px solid #ddd;
`;

const BookingButton = styled.button`
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 15px 30px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 20px;
  
  &:hover {
    background: #1976D2;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const Home = () => {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('home'); // 'home' 또는 'reservation'

  // 컴포넌트 마운트 시 예약된 좌석 조회
  useEffect(() => {
    fetchBookedSeats();
  }, []);

  const fetchBookedSeats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/booked-seats');
      const data = await response.json();
      
      if (data.success) {
        setBookedSeats(data.bookedSeats);
      }
    } catch (error) {
      console.error('예약된 좌석 조회 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeatClick = (seatNumber) => {
    // 이미 예약된 좌석은 클릭 불가
    if (bookedSeats.includes(seatNumber)) {
      return;
    }

    setSelectedSeats(prev => {
      if (prev.includes(seatNumber)) {
        return prev.filter(seat => seat !== seatNumber);
      } else {
        return [...prev, seatNumber];
      }
    });
  };

  const handleBooking = () => {
    if (selectedSeats.length === 0) {
      alert('좌석을 선택해주세요!');
      return;
    }
    
    // 예약 페이지로 이동
    setCurrentPage('reservation');
  };

  const handleBackToHome = () => {
    setCurrentPage('home');
  };

  const handleReservationComplete = () => {
    setSelectedSeats([]); // 선택된 좌석 초기화
    setCurrentPage('home'); // 홈으로 돌아가기
    fetchBookedSeats(); // 예약된 좌석 목록 새로고침
  };

  const renderSeats = () => {
    const seats = [];
    for (let i = 1; i <= 9; i++) {
      const isBooked = bookedSeats.includes(i);
      const isSelected = selectedSeats.includes(i);
      
      seats.push(
        <Seat
          key={i}
          $isBooked={isBooked}
          $isSelected={isSelected}
          onClick={() => handleSeatClick(i)}
        >
          <div>
            <SeatNumber>{i}</SeatNumber>
            {isBooked && <SeatStatus>예약됨</SeatStatus>}
          </div>
        </Seat>
      );
    }
    return seats;
  };

  // 예약 페이지 표시
  if (currentPage === 'reservation') {
    return (
      <Reservation
        selectedSeats={selectedSeats}
        onBack={handleBackToHome}
        onComplete={handleReservationComplete}
      />
    );
  }

  if (isLoading) {
    return (
      <HomeContainer>
        <Title>좌석 선택</Title>
        <div>로딩 중...</div>
      </HomeContainer>
    );
  }

  return (
    <HomeContainer>
      <Title>좌석 선택</Title>
      
      <Legend>
        <LegendItem>
          <LegendColor style={{ backgroundColor: '#fff', borderColor: '#ddd' }}></LegendColor>
          <span>빈 좌석</span>
        </LegendItem>
        <LegendItem>
          <LegendColor style={{ backgroundColor: '#4CAF50' }}></LegendColor>
          <span>선택된 좌석</span>
        </LegendItem>
        <LegendItem>
          <LegendColor style={{ backgroundColor: '#f44336' }}></LegendColor>
          <span>예약된 좌석</span>
        </LegendItem>
      </Legend>
      
      <SeatGrid>
        {renderSeats()}
      </SeatGrid>
      
      <SelectedSeats>
        <SelectedSeatsTitle>선택된 좌석</SelectedSeatsTitle>
        <SelectedSeatsList>
          {selectedSeats.length > 0 ? (
            selectedSeats.sort((a, b) => a - b).join(', ') + '번'
          ) : (
            '선택된 좌석이 없습니다.'
          )}
        </SelectedSeatsList>
        <BookingButton 
          onClick={handleBooking}
          disabled={selectedSeats.length === 0}
        >
          예매하기
        </BookingButton>
      </SelectedSeats>
    </HomeContainer>
  );
};

export default Home;