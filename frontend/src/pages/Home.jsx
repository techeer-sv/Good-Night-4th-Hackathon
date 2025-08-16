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
  color: gray;
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

  // 🧪 런타임 타입 체크 함수들
  const typeCheck = {
    // 배열 타입 체크
    isArray: (value) => {
      if (!Array.isArray(value)) {
        console.error('❌ 타입 오류: 배열이 아닙니다.', { value, type: typeof value });
        return false;
      }
      return true;
    },

    // 숫자 타입 체크
    isNumber: (value) => {
      if (typeof value !== 'number' || isNaN(value)) {
        console.error('❌ 타입 오류: 숫자가 아닙니다.', { value, type: typeof value });
        return false;
      }
      return true;
    },

    // 문자열 타입 체크
    isString: (value) => {
      if (typeof value !== 'string') {
        console.error('❌ 타입 오류: 문자열이 아닙니다.', { value, type: typeof value });
        return false;
      }
      return true;
    },

    // 함수 타입 체크
    isFunction: (value) => {
      if (typeof value !== 'function') {
        console.error('❌ 타입 오류: 함수가 아닙니다.', { value, type: typeof value });
        return false;
      }
      return true;
    },

    // 객체 타입 체크
    isObject: (value) => {
      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        console.error('❌ 타입 오류: 객체가 아닙니다.', { value, type: typeof value });
        return false;
      }
      return true;
    },

    // 좌석 번호 유효성 체크 (1-9 범위)
    isValidSeatNumber: (seatNumber) => {
      if (!typeCheck.isNumber(seatNumber)) return false;
      if (seatNumber < 1 || seatNumber > 9 || !Number.isInteger(seatNumber)) {
        console.error('❌ 좌석 번호 오류: 1-9 범위의 정수여야 합니다.', { seatNumber });
        return false;
      }
      return true;
    },

    // 좌석 배열 유효성 체크
    isValidSeatsArray: (seats) => {
      if (!typeCheck.isArray(seats)) return false;
      
      for (let i = 0; i < seats.length; i++) {
        if (!typeCheck.isValidSeatNumber(seats[i])) {
          console.error('❌ 좌석 배열 오류: 유효하지 않은 좌석 번호가 포함되어 있습니다.', { seats, invalidIndex: i });
          return false;
        }
      }
      
      // 중복 좌석 체크
      const uniqueSeats = [...new Set(seats)];
      if (uniqueSeats.length !== seats.length) {
        console.error('❌ 좌석 배열 오류: 중복된 좌석이 있습니다.', { seats, uniqueSeats });
        return false;
      }
      
      return true;
    },

    // 페이지 상태 유효성 체크
    isValidPageState: (pageState) => {
      const validPages = ['home', 'reservation'];
      if (!typeCheck.isString(pageState) || !validPages.includes(pageState)) {
        console.error('❌ 페이지 상태 오류: 유효하지 않은 페이지 상태입니다.', { pageState, validPages });
        return false;
      }
      return true;
    },

    // 로딩 상태 유효성 체크
    isValidLoadingState: (loadingState) => {
      if (typeof loadingState !== 'boolean') {
        console.error('❌ 로딩 상태 오류: 불린 값이 아닙니다.', { loadingState, type: typeof loadingState });
        return false;
      }
      return true;
    }
  };

  // 컴포넌트 마운트 시 예약된 좌석 조회
  useEffect(() => {
    fetchBookedSeats();
  }, []);

  const fetchBookedSeats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/booked-seats');
      const data = await response.json();
      
      if (data.success) {
        // API 응답 데이터 타입 체크
        if (!typeCheck.isArray(data.bookedSeats)) {
          console.error('❌ API 응답 오류: bookedSeats가 배열이 아닙니다.', data);
          return;
        }
        
        // 각 좌석 번호 유효성 체크
        const validSeats = data.bookedSeats.filter(seat => typeCheck.isValidSeatNumber(seat));
        if (validSeats.length !== data.bookedSeats.length) {
          console.warn('⚠️ 일부 좌석 번호가 유효하지 않아 필터링되었습니다.', {
            original: data.bookedSeats,
            filtered: validSeats
          });
        }
        
        setBookedSeats(validSeats);
      }
    } catch (error) {
      console.error('예약된 좌석 조회 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeatClick = (seatNumber) => {
    // 매개변수 타입 체크
    if (!typeCheck.isValidSeatNumber(seatNumber)) {
      console.error('❌ handleSeatClick: 유효하지 않은 좌석 번호입니다.', { seatNumber });
      return;
    }

    // bookedSeats 상태 타입 체크
    if (!typeCheck.isValidSeatsArray(bookedSeats)) {
      console.error('❌ handleSeatClick: bookedSeats 상태가 유효하지 않습니다.', { bookedSeats });
      return;
    }

    // 이미 예약된 좌석은 클릭 불가
    if (bookedSeats.includes(seatNumber)) {
      console.log('ℹ️ 이미 예약된 좌석입니다.', { seatNumber });
      return;
    }

    setSelectedSeats(prev => {
      // 이전 상태 타입 체크
      if (!typeCheck.isValidSeatsArray(prev)) {
        console.error('❌ selectedSeats 상태가 유효하지 않습니다.', { prev });
        return [];
      }

      const newSelectedSeats = prev.includes(seatNumber) 
        ? prev.filter(seat => seat !== seatNumber)
        : [...prev, seatNumber];

      // 새 상태 유효성 체크
      if (!typeCheck.isValidSeatsArray(newSelectedSeats)) {
        console.error('❌ 새로운 selectedSeats 상태가 유효하지 않습니다.', { newSelectedSeats });
        return prev; // 이전 상태 유지
      }

      console.log('✅ 좌석 선택 상태 업데이트:', { 
        previous: prev, 
        new: newSelectedSeats, 
        clicked: seatNumber 
      });

      return newSelectedSeats;
    });
  };

  const handleBooking = () => {
    // selectedSeats 상태 타입 체크
    if (!typeCheck.isValidSeatsArray(selectedSeats)) {
      console.error('❌ handleBooking: selectedSeats 상태가 유효하지 않습니다.', { selectedSeats });
      alert('좌석 선택 상태에 오류가 있습니다. 페이지를 새로고침해주세요.');
      return;
    }

    if (selectedSeats.length === 0) {
      alert('좌석을 선택해주세요!');
      return;
    }
    
    // 예약 페이지로 이동
    setCurrentPage('reservation');
  };

  const handleBackToHome = () => {
    // currentPage 상태 타입 체크
    if (!typeCheck.isValidPageState(currentPage)) {
      console.error('❌ handleBackToHome: currentPage 상태가 유효하지 않습니다.', { currentPage });
      return;
    }

    setCurrentPage('home');
  };

  const handleReservationComplete = () => {
    // selectedSeats 상태 타입 체크
    if (!typeCheck.isValidSeatsArray(selectedSeats)) {
      console.error('❌ handleReservationComplete: selectedSeats 상태가 유효하지 않습니다.', { selectedSeats });
    }

    setSelectedSeats([]); // 선택된 좌석 초기화
    setCurrentPage('home'); // 홈으로 돌아가기
    fetchBookedSeats(); // 예약된 좌석 목록 새로고침
  };

  const renderSeats = () => {
    // bookedSeats와 selectedSeats 상태 타입 체크
    if (!typeCheck.isValidSeatsArray(bookedSeats)) {
      console.error('❌ renderSeats: bookedSeats 상태가 유효하지 않습니다.', { bookedSeats });
      return <div>좌석 정보를 불러올 수 없습니다.</div>;
    }

    if (!typeCheck.isValidSeatsArray(selectedSeats)) {
      console.error('❌ renderSeats: selectedSeats 상태가 유효하지 않습니다.', { selectedSeats });
      return <div>좌석 선택 정보를 불러올 수 없습니다.</div>;
    }

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

  // 전체 상태 유효성 체크 (개발 모드에서만)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 상태 유효성 체크 중...');
      
      const checks = [
        { name: 'selectedSeats', value: selectedSeats, check: typeCheck.isValidSeatsArray },
        { name: 'bookedSeats', value: bookedSeats, check: typeCheck.isValidSeatsArray },
        { name: 'currentPage', value: currentPage, check: typeCheck.isValidPageState },
        { name: 'isLoading', value: isLoading, check: typeCheck.isValidLoadingState }
      ];

      checks.forEach(({ name, value, check }) => {
        if (!check(value)) {
          console.error(`❌ ${name} 상태가 유효하지 않습니다.`, { value });
        } else {
          console.log(`✅ ${name} 상태가 유효합니다.`, { value });
        }
      });
    }
  }, [selectedSeats, bookedSeats, currentPage, isLoading]);

  // 예약 페이지 표시
  if (currentPage === 'reservation') {
    // props 타입 체크
    if (!typeCheck.isValidSeatsArray(selectedSeats)) {
      console.error('❌ Reservation 컴포넌트에 전달되는 selectedSeats가 유효하지 않습니다.', { selectedSeats });
      return <div>좌석 정보 오류가 발생했습니다.</div>;
    }

    if (!typeCheck.isFunction(handleBackToHome)) { // handleBackToHome를 사용
      console.error('❌ Reservation 컴포넌트에 전달되는 onBack이 함수가 아닙니다.', { handleBackToHome });
      return <div>함수 오류가 발생했습니다.</div>;
    }

    if (!typeCheck.isFunction(handleReservationComplete)) { // handleReservationComplete를 사용
      console.error('❌ Reservation 컴포넌트에 전달되는 onComplete이 함수가 아닙니다.', { handleReservationComplete });
      return <div>함수 오류가 발생했습니다.</div>;
    }

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
        <div>로딩 중...</div>
      </HomeContainer>
    );
  }

  return (
    <HomeContainer>
      <Title>STAGE</Title>
      
      
      <SeatGrid>
        {renderSeats()}
      </SeatGrid>
      
      <SelectedSeats>
        <SelectedSeatsTitle>잔여 좌석</SelectedSeatsTitle>
        <SelectedSeatsList>
          {(() => {
            const totalSeats = 9;
            const bookedSeatsCount = bookedSeats.length;
            const selectedSeatsCount = selectedSeats.length;
            const availableSeats = totalSeats - bookedSeatsCount - selectedSeatsCount;
            
            if (availableSeats === 0) {
              return '예약 가능한 좌석이 없습니다.';
            } else if (availableSeats === 1) {
              return '예약 가능한 좌석: 1개';
            } else {
              return `예약 가능한 좌석: ${availableSeats}개`;
            }
          })()}
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