import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Seat, Concert, SeatStats } from '../types';
import { concertAPI } from '../services/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useSeatSync } from '../hooks/useSeatSync';

const SeatSelectionContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px;
  width: 100%;
  
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
  margin-bottom: 32px;
  
  @media (max-width: 768px) {
    margin-bottom: 24px;
  }
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 8px;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.5rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 16px;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const ConcertInfo = styled.div`
  display: flex;
  justify-content: center;
  gap: 32px;
  margin-bottom: 32px;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    gap: 16px;
    margin-bottom: 24px;
  }
  
  .info-item {
    text-align: center;
    
    .label {
      font-size: 0.9rem;
      color: #666;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    
    .value {
      font-size: 1.1rem;
      font-weight: 600;
      color: #1a1a1a;
    }
  }
`;

const SeatMapContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  margin-bottom: 32px;
  width: 100%;
  
  @media (max-width: 768px) {
    gap: 24px;
    margin-bottom: 24px;
  }
`;

const SeatMap = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 32px;
  width: 100%;
  max-width: 600px;
  
  @media (max-width: 768px) {
    padding: 24px;
    max-width: 100%;
  }
  
  @media (max-width: 480px) {
    padding: 16px;
  }
`;

const Stage = styled.div`
  background: linear-gradient(135deg, #28a745, #20c997);
  color: white;
  text-align: center;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 32px;
  font-weight: 700;
  font-size: 1.3rem;
  width: 100%;
  max-width: 300px;
  margin-left: auto;
  margin-right: auto;
  box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
  
  @media (max-width: 768px) {
    margin-bottom: 24px;
    padding: 16px;
    font-size: 1.1rem;
    max-width: 250px;
  }
  
  @media (max-width: 480px) {
    padding: 14px;
    font-size: 1rem;
    max-width: 200px;
  }
`;

const SeatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  justify-items: center;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    gap: 16px;
    max-width: 100%;
  }
  
  @media (max-width: 480px) {
    gap: 12px;
  }
`;

const SeatButton = styled.button.withConfig({
  shouldForwardProp: (prop) => !['status', 'selected', 'disabled'].includes(prop)
})<{
  status: string;
  selected: boolean;
  disabled: boolean;
}>`
  position: relative;
  width: 60px;
  height: 60px;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 4px;
  
  ${({ status, selected, disabled }) => {
    if (disabled) {
      return `
        background-color: #e9ecef;
        color: #adb5bd;
        cursor: not-allowed;
      `;
    }
    
    // status가 'booked' 또는 'reserved'인 경우 우선 처리
    if (status === 'booked') {
      return `
        background-color: #dc3545 !important;
        color: white !important;
        cursor: not-allowed !important;
      `;
    }
    
    if (status === 'reserved') {
      return `
        background-color: #ffc107 !important;
        color: #212529 !important;
        cursor: not-allowed !important;
      `;
    }
    
    // selected 상태는 available 좌석에만 적용
    if (selected && status === 'available') {
      return `
        background-color: #28a745 !important;
        color: white !important;
        transform: scale(1.1);
        box-shadow: 0 4px 12px rgba(40, 167, 69, 0.4);
      `;
    }
    
    // 예약 가능한 좌석 (회색)
    return `
      background-color: #6c757d !important;
      color: white !important;
      
      &:hover {
        background-color: #5a6268;
        transform: scale(1.05);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      }
    `;
  }}
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
  }
`;

const Legend = styled.div`
  display: flex;
  flex-direction: row;
  gap: 24px;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    gap: 20px;
    max-width: 400px;
  }
  
  @media (max-width: 480px) {
    gap: 16px;
    flex-direction: column;
  }
  
  h3 {
    font-size: 1.1rem;
    margin-bottom: 16px;
    text-align: center;
    width: 100%;
    
    @media (max-width: 768px) {
      font-size: 1rem;
    }
  }
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  
  .color-box {
    width: 20px;
    height: 20px;
    border-radius: 4px;
    border: 2px solid #dee2e6;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .label {
    font-size: 0.9rem;
    color: #495057;
    font-weight: 500;
    
    @media (max-width: 768px) {
      font-size: 0.8rem;
    }
  }
`;

const SelectionSummary = styled(Card)`
  margin-bottom: 24px;
  width: 100%;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

const SelectedSeats = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 16px 0;
  justify-content: center;
  
  .seat-tag {
    background: #e9ecef;
    padding: 8px 12px;
    border-radius: 20px;
    font-size: 0.9rem;
    color: #495057;
    display: flex;
    align-items: center;
    gap: 8px;
    
    .remove-btn {
      background: none;
      border: none;
      color: #dc3545;
      cursor: pointer;
      font-size: 1.2rem;
      padding: 0;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      
      &:hover {
        color: #c82333;
      }
    }
  }
`;

const TotalPrice = styled.div`
  text-align: center;
  font-size: 1.25rem;
  font-weight: 600;
  color: #28a745;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e9ecef;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-top: 32px;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    gap: 12px;
    margin-top: 24px;
  }
  
  @media (max-width: 480px) {
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }
`;



const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
  font-size: 1.25rem;
  color: #666;
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 48px;
  color: #dc3545;
  font-size: 1.25rem;
`;



const SeatSelectionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [concert, setConcert] = useState<Concert | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [stats, setStats] = useState<SeatStats | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  // 실시간 좌석 상태 동기화 훅 사용
  const { 
    checkSeatStatus
  } = useSeatSync({
    concertId: id || '',
    onSeatUpdate: (updatedSeats) => {
      // 실시간 좌석 상태 업데이트
      setSeats(prevSeats => 
        prevSeats.map(seat => {
          const updatedSeat = updatedSeats.find(s => s.id === seat.id);
          if (updatedSeat) {
            return { 
              ...seat, 
              status: updatedSeat.status as 'available' | 'booked' | 'reserved' | 'maintenance',
              bookedBy: updatedSeat.bookedBy,
              updatedAt: updatedSeat.updatedAt
            };
          }
          return seat;
        })
      );

      // 선택된 좌석이 예매된 경우 선택 해제
      setSelectedSeats(prevSelected => 
        prevSelected.filter(seat => {
          const updatedSeat = updatedSeats.find(s => s.id === seat.id);
          if (updatedSeat && updatedSeat.status !== 'available') {
            console.log(`⚠️ 선택된 좌석 ${seat.id}가 예매되어 선택 해제됨`);
            return false;
          }
          return true;
        })
      );
      updateStats(updatedSeats);
    },
    onError: (errorMessage) => {
      console.error('❌ 실시간 동기화 오류:', errorMessage);
    }
  });

  // 통계 업데이트 함수
  const updateStats = (updatedSeats: Array<{ status: string }>) => {
    if (!stats) return;

    const totalSeats = stats.totalSeats;
    const availableSeats = updatedSeats.filter(s => s.status === 'available').length;
    const bookedSeats = updatedSeats.filter(s => s.status === 'booked').length;
    const reservedSeats = updatedSeats.filter(s => s.status === 'reserved').length;
    const reservationRate = Math.round((bookedSeats / totalSeats) * 100);

    setStats({
      totalSeats,
      availableSeats,
      bookedSeats,
      reservedSeats,
      reservationRate
    });
  };

  useEffect(() => {
    if (id) {
      fetchConcertData(id);
    }
  }, [id]);

  const fetchConcertData = async (concertId: string) => {
    try {
      setLoading(true);
      const response = await concertAPI.getConcertById(concertId);
      if (response.success) {
        setConcert(response.data);
        setSeats(response.data.seats);
        setStats(response.data.stats);
        
        // 좌석 상태 디버깅
        console.log('🔍 좌석 상태 확인:', response.data.seats.map(seat => ({
          id: seat.id,
          seatNumber: seat.seatNumber,
          status: seat.status,
          row: seat.row
        })));

        // 좌석 렌더링 디버깅
        console.log('🎨 좌석 렌더링 정보:', response.data.seats.map(seat => {
          const displayNumber = Math.floor((seat.row - 1) * 3) + seat.seatNumber;
          return {
            displayNumber,
            status: seat.status,
            backgroundColor: seat.status === 'booked' ? '#dc3545' : 
                            seat.status === 'reserved' ? '#ffc107' : '#6c757d',
            color: seat.status === 'booked' ? 'white' : 
                   seat.status === 'reserved' ? '#212529' : 'white'
          };
        }));
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('공연 정보를 불러오는데 실패했습니다.');
      console.error('Error fetching concert:', err);
    } finally {
      setLoading(false);
    }
  };

  // 좌석 클릭 시 실시간 상태 확인
  const handleSeatClick = async (seat: Seat) => {
    if (seat.status !== 'available') return;
    
    try {
      // 실시간으로 좌석 상태 재확인
      const realtimeStatus = await checkSeatStatus(seat.id);
      
      if (realtimeStatus.status !== 'available') {
        // 좌석이 이미 예매된 경우
        console.log(`⚠️ 좌석 ${seat.id}가 이미 ${realtimeStatus.status} 상태입니다.`);
        
        // 좌석 상태 업데이트
        setSeats(prevSeats => 
          prevSeats.map(s => 
            s.id === seat.id ? { 
              ...s, 
              status: realtimeStatus.status as 'available' | 'booked' | 'reserved' | 'maintenance' 
            } : s
          )
        );
        
        console.error(`좌석이 이미 ${realtimeStatus.status === 'booked' ? '예매' : '예약'}되었습니다.`);
        return;
      }
      
      // 좌석 선택 처리
      setSelectedSeats(prev => {
        const isSelected = prev.find(s => s.id === seat.id);
        if (isSelected) {
          return prev.filter(s => s.id !== seat.id);
        } else {
          return [...prev, seat];
        }
      });
      
    } catch (error) {
      console.error('❌ 좌석 상태 확인 실패:', error);
              console.error('좌석 상태 확인에 실패했습니다.');
    }
  };

  const removeSelectedSeat = (seatId: string) => {
    setSelectedSeats(prev => prev.filter(s => s.id !== seatId));
  };

  const calculateTotalPrice = () => {
    return selectedSeats.reduce((total, seat) => total + seat.price, 0);
  };

  const handleReserveSeats = () => {
    if (selectedSeats.length === 0) return;
    
    navigate('/booking', {
      state: {
        concert,
        selectedSeats
      }
    });
  };



  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const getSeatsBySection = () => {
    // 3x3 격자로 좌석을 정렬
    const gridSeats: Seat[][] = [];
    
    // 3행 3열로 좌석 배치 (1부터 9까지 순차적으로)
    for (let row = 0; row < 3; row++) {
      gridSeats[row] = [];
      for (let col = 0; col < 3; col++) {
        const seatIndex = row * 3 + col;
        if (seats[seatIndex]) {
          gridSeats[row][col] = seats[seatIndex];
        }
      }
    }
    
    return gridSeats;
  };

  // 좌석 표시 번호 계산 (1부터 9까지)
  const getSeatDisplayNumber = (rowIndex: number, colIndex: number) => {
    return rowIndex * 3 + colIndex + 1;
  };

  if (loading) {
    return (
      <SeatSelectionContainer>
        <LoadingSpinner>🎭 좌석 정보를 불러오는 중...</LoadingSpinner>
      </SeatSelectionContainer>
    );
  }

  if (error || !concert) {
    return (
      <SeatSelectionContainer>
        <ErrorMessage>
          ❌ {error || '공연 정보를 찾을 수 없습니다.'}
          <br />
          <Button onClick={() => navigate('/')} variant="primary" style={{ marginTop: '16px' }}>
            홈으로 돌아가기
          </Button>
        </ErrorMessage>
      </SeatSelectionContainer>
    );
  }

  return (
    <SeatSelectionContainer>
      <Header>
        <Title>{concert.title}</Title>
        <Subtitle>🎤 {concert.artist} | 📍 {concert.venue}</Subtitle>
      </Header>

      <ConcertInfo>
        <div className="info-item">
          <div className="label">공연 날짜</div>
          <div className="value">
            {new Date(concert.date).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>
        <div className="info-item">
          <div className="label">총 좌석</div>
          <div className="value">{stats?.totalSeats.toLocaleString()}석</div>
        </div>
        <div className="info-item">
          <div className="label">예약 가능</div>
          <div className="value">{stats?.availableSeats.toLocaleString()}석</div>
        </div>
        <div className="info-item">
          <div className="label">예약률</div>
          <div className="value">{stats?.reservationRate}%</div>
        </div>
      </ConcertInfo>



      <SeatMapContainer>
        <SeatMap>
          <Stage>STAGE</Stage>
          
          {(() => {
            const gridSeats = getSeatsBySection();
            return (
              <SeatGrid>
                {gridSeats.map((row, rowIndex) => 
                  row.map((seat, colIndex) => 
                    seat ? (
                      <SeatButton
                        key={seat.id}
                        status={seat.status}
                        selected={selectedSeats.some(s => s.id === seat.id)}
                        disabled={seat.status !== 'available'}
                        onClick={() => handleSeatClick(seat)}
                        data-status={seat.status}
                        title={`${seat.section}구역 ${seat.row}열 ${seat.seatNumber}번 - ${formatPrice(seat.price)}원 (상태: ${seat.status})`}
                        style={{
                          backgroundColor: seat.status === 'booked' ? '#dc3545' : 
                                         seat.status === 'reserved' ? '#ffc107' : 
                                         selectedSeats.some(s => s.id === seat.id) ? '#28a745' : '#6c757d',
                          color: seat.status === 'booked' ? 'white' : 
                                 seat.status === 'reserved' ? '#212529' : 
                                 selectedSeats.some(s => s.id === seat.id) ? 'white' : 'white'
                        }}
                      >
                        {getSeatDisplayNumber(rowIndex, colIndex)}
                        {seat.status !== 'available' && (
                          <div style={{ 
                            position: 'absolute', 
                            top: '2px', 
                            right: '2px', 
                            fontSize: '8px', 
                            color: seat.status === 'booked' ? '#fff' : '#000',
                            fontWeight: 'bold'
                          }}>
                            {seat.status === 'booked' ? 'B' : 'R'}
                          </div>
                        )}
                      </SeatButton>
                    ) : (
                      <div key={`empty-${rowIndex}-${colIndex}`} style={{ width: '60px', height: '60px' }} />
                    )
                  )
                )}
              </SeatGrid>
            );
          })()}
        </SeatMap>

        <Legend>
          <h3>좌석 상태</h3>
          <LegendItem>
            <div className="color-box" style={{ backgroundColor: '#6c757d' }}></div>
            <div className="label">예약 가능</div>
          </LegendItem>

          <LegendItem>
            <div className="color-box" style={{ backgroundColor: '#dc3545' }}></div>
            <div className="label">예매됨</div>
          </LegendItem>
          <LegendItem>
            <div className="color-box" style={{ backgroundColor: '#28a745' }}></div>
            <div className="label">선택됨</div>
          </LegendItem>
        </Legend>
        

      </SeatMapContainer>

      {selectedSeats.length > 0 && (
        <SelectionSummary>
          <h3>선택된 좌석 ({selectedSeats.length}개)</h3>
          <SelectedSeats>
            {selectedSeats.map(seat => (
              <div key={seat.id} className="seat-tag">
                {seat.section}구역 {seat.row}열 {seat.seatNumber}번
                <button 
                  className="remove-btn" 
                  onClick={() => removeSelectedSeat(seat.id)}
                  title="선택 해제"
                >
                  ×
                </button>
              </div>
            ))}
          </SelectedSeats>
          <TotalPrice>
            총 금액: {formatPrice(calculateTotalPrice())}원
          </TotalPrice>
        </SelectionSummary>
      )}

      <ActionButtons>
        <Button 
          variant="secondary" 
          onClick={() => navigate('/')}
        >
          ← 홈으로 돌아가기
        </Button>
        <Button 
          variant="primary" 
          disabled={selectedSeats.length === 0}
          onClick={handleReserveSeats}
        >
          {selectedSeats.length === 0 ? '선택한 좌석이 없습니다.' : '선택한 좌석 예약하기'}
        </Button>
      </ActionButtons>


    </SeatSelectionContainer>
  );
};

export default SeatSelectionPage;
