import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Concert, Seat } from '../types';
import { bookingAPI } from '../services/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

const BookingContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
  width: 100%;
  
  @media (max-width: 768px) {
    padding: 16px;
    max-width: 100%;
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

const BookingSummary = styled(Card)`
  margin-bottom: 32px;
  width: 100%;
`;

const SummaryHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e9ecef;
  
  .concert-icon {
    font-size: 3rem;
  }
  
  .concert-info {
    h3 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 4px;
    }
    
    p {
      color: #666;
      margin: 0;
    }
  }
`;

const SelectedSeatsInfo = styled.div`
  margin-bottom: 24px;
  
  h4 {
    font-size: 1.1rem;
    font-weight: 600;
    color: #495057;
    margin-bottom: 16px;
  }
  
  .seats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px;
  }
  
  .seat-item {
    background: #f8f9fa;
    padding: 12px;
    border-radius: 8px;
    border-left: 4px solid #007bff;
    
    .seat-location {
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 4px;
    }
    
    .seat-price {
      color: #28a745;
      font-weight: 500;
    }
  }
`;

const TotalPrice = styled.div`
  text-align: center;
  padding: 16px;
  background: #e8f5e8;
  border-radius: 8px;
  border: 1px solid #c3e6c3;
  
  .label {
    font-size: 0.9rem;
    color: #666;
    margin-bottom: 4px;
  }
  
  .amount {
    font-size: 1.5rem;
    font-weight: 700;
    color: #28a745;
  }
`;

const CustomerForm = styled(Card)`
  margin-bottom: 32px;
  width: 100%;
`;

const FormTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 24px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
  
  label {
    display: block;
    font-weight: 500;
    color: #495057;
    margin-bottom: 8px;
  }
  
  input {
    width: 100%;
    padding: 12px;
    border: 2px solid #e9ecef;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.2s ease-in-out;
    
    &:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
    }
    
    &.error {
      border-color: #dc3545;
    }
  }
  
  .error-message {
    color: #dc3545;
    font-size: 0.9rem;
    margin-top: 4px;
  }
`;

const FormSection = styled.div`
  margin-bottom: 32px;
  width: 100%;

  h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 24px;
  }
`;

const ErrorMessage = styled.div`
  background: #f8d7da;
  color: #721c24;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
  border: 1px solid #f5c6cb;
  font-size: 0.95rem;
  font-weight: 500;
`;


const ActionButtons = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;
  width: 100%;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const SuccessContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
  padding: 40px 24px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  
  @media (max-width: 768px) {
    min-height: 70vh;
    padding: 32px 20px;
  }
  
  @media (max-width: 480px) {
    min-height: 80vh;
    padding: 24px 16px;
  }
`;

const SuccessCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  max-width: 700px;
  width: 100%;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 6px;
    background: linear-gradient(90deg, #28a745, #20c997, #17a2b8);
  }
  
  @media (max-width: 768px) {
    padding: 36px 24px;
    margin: 0 16px;
    max-width: 600px;
  }
  
  @media (max-width: 480px) {
    padding: 28px 20px;
    margin: 0 12px;
    max-width: 100%;
  }
`;

const SuccessIcon = styled.div`
  font-size: 3.5rem;
  margin-bottom: 24px;
  animation: bounce 1s ease-in-out;
  
  @media (max-width: 768px) {
    font-size: 3rem;
    margin-bottom: 20px;
  }
  
  @media (max-width: 480px) {
    font-size: 2.5rem;
    margin-bottom: 16px;
  }
  
  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
      transform: translateY(0);
    }
    40% {
      transform: translateY(-20px);
    }
    60% {
      transform: translateY(-10px);
    }
  }
`;

const SuccessTitle = styled.h1`
  font-size: 2.2rem;
  font-weight: 700;
  color: #28a745;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #28a745, #20c997);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  
  @media (max-width: 768px) {
    font-size: 2rem;
    margin-bottom: 14px;
  }
  
  @media (max-width: 480px) {
    font-size: 1.5rem;
    margin-bottom: 12px;
  }
`;

const SuccessMessage = styled.p`
  font-size: 1.1rem;
  color: #495057;
  margin-bottom: 28px;
  line-height: 1.6;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
    margin-bottom: 28px;
  }
  
  @media (max-width: 480px) {
    font-size: 1rem;
    margin-bottom: 24px;
  }
`;

const CheerMessage = styled.div`
  background: linear-gradient(135deg, #fff3cd, #ffeaa7);
  border: 2px solid #ffc107;
  border-radius: 16px;
  padding: 20px;
  margin: 24px 0;
  position: relative;
  
  &::before {
    content: '🎉';
    position: absolute;
    top: -15px;
    left: 50%;
    transform: translateX(-50%);
    background: white;
    padding: 8px;
    border-radius: 50%;
    font-size: 1.5rem;
    border: 2px solid #ffc107;
  }
  
  @media (max-width: 768px) {
    padding: 20px;
    margin: 28px 0;
  }
  
  @media (max-width: 480px) {
    padding: 16px;
    margin: 24px 0;
  }
`;

const CheerTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: #856404;
  margin-bottom: 12px;
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
    margin-bottom: 10px;
  }
  
  @media (max-width: 480px) {
    font-size: 1.1rem;
    margin-bottom: 8px;
  }
`;

const CheerText = styled.p`
  font-size: 0.95rem;
  color: #856404;
  text-align: center;
  line-height: 1.5;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 0.95rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

const ActionButton = styled(Button)`
  margin-top: 20px;
  padding: 14px 28px;
  font-size: 1rem;
  border-radius: 50px;
  box-shadow: 0 8px 20px rgba(40, 167, 69, 0.3);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 25px rgba(40, 167, 69, 0.4);
  }
  
  @media (max-width: 768px) {
    padding: 14px 28px;
    font-size: 1rem;
    margin-top: 20px;
  }
  
  @media (max-width: 480px) {
    padding: 12px 24px;
    font-size: 0.95rem;
    margin-top: 16px;
  }
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

const BookingPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [concert, setConcert] = useState<Concert | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [email, setEmail] = useState('');
  const [emailConfirmed, setEmailConfirmed] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    if (location.state) {
      setConcert(location.state.concert);
      setSelectedSeats(location.state.selectedSeats);
    } else {
      // 상태가 없으면 홈으로 리다이렉트
      navigate('/');
    }
  }, [location.state, navigate]);

  const validateForm = (): boolean => {
    const newErrors: { email?: string } = {};
    
    if (!email.trim()) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = '올바른 이메일 형식을 입력해주세요.';
    }
    
    if (!emailConfirmed) {
      newErrors.email = '이메일 중복 확인을 완료해주세요.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setErrors(prev => ({ ...prev, [field]: '' }));
    if (field === 'email') {
      setEmail(value);
      setEmailConfirmed(false);
    }
  };

  const checkEmailDuplicate = async () => {
    if (!email.trim()) {
      setErrors({ email: '이메일을 입력해주세요.' });
      return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors({ email: '올바른 이메일 형식을 입력해주세요.' });
      return;
    }

    try {
      setCheckingEmail(true);
      
      // 실제로는 서버에서 중복 확인을 해야 하지만, 
      // 현재는 프론트엔드에서만 처리 (하드코딩된 예시)
      const existingEmails = ['test@example.com', 'user@test.com'];
      const isDuplicate = existingEmails.includes(email);
      
      if (isDuplicate) {
        setErrors({ email: '이미 사용 중인 이메일입니다.' });
        setEmailConfirmed(false);
      } else {
        setEmailConfirmed(true);
        setErrors({});
        alert('사용 가능한 이메일입니다.');
      }
    } catch (error: unknown) {
      setErrors({ email: '이메일 중복 확인 중 오류가 발생했습니다.' });
      setEmailConfirmed(false);
      console.error('Email duplicate check error:', error);
    } finally {
      setCheckingEmail(false);
    }
  };

  const handleBooking = async () => {
    if (!validateForm()) return;

    setBookingInProgress(true);
    setErrors({});

    try {
      // 99% 성공, 1% 실패 확률 처리
      const randomValue = Math.random();
      const isSuccess = randomValue < 0.99; // 99% 확률로 성공

      if (isSuccess) {
        // 성공 시: 실제 백엤드 API 호출
        console.log('🎯 예약 성공 시도 (99% 확률)');
        
        const response = await bookingAPI.bookSeats({
          concertId: concert!.id,
          seatIds: selectedSeats.map(seat => seat.id),
          userId: email,
          paymentMethod: 'card'
        });

        if (response.success) {
          console.log('✅ 백엤드 예약 성공:', response.data);
          setBookingSuccess(true);
        } else {
          // 백엤드에서 실패한 경우
          console.log('❌ 백엤드 예약 실패:', response.message);
          setErrors({ general: `예약 처리 중 오류가 발생했습니다: ${response.message}` });
        }
      } else {
        // 1% 확률로 의도적 실패
        console.log('💥 의도적 실패 처리 (1% 확률)');
        
        // 2초 후 실패 처리 (사용자 경험 향상)
        setTimeout(() => {
          setErrors({ general: '시스템 일시적 오류로 예약에 실패했습니다. 잠시 후 다시 시도해주세요.' });
          setBookingInProgress(false);
        }, 2000);
        
        return; // 여기서 함수 종료
      }
    } catch (error: unknown) {
      console.error('❌ 예약 처리 중 오류:', error);
      
      // 네트워크 오류와 백엤드 오류 구분
      if (error && typeof error === 'object' && 'response' in error) {
        // 백엤드에서 반환한 오류
        const axiosError = error as { response: { data: { message?: string }; statusText: string } };
        setErrors({ general: `서버 오류: ${axiosError.response.data?.message || axiosError.response.statusText}` });
      } else if (error && typeof error === 'object' && 'request' in error) {
        // 네트워크 오류 (서버에 연결할 수 없음)
        setErrors({ general: '서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.' });
      } else {
        // 기타 오류
        setErrors({ general: '예약 처리 중 예상치 못한 오류가 발생했습니다.' });
      }
    } finally {
      setBookingInProgress(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const calculateTotalPrice = () => {
    return selectedSeats.reduce((total, seat) => total + seat.price, 0);
  };

  if (!concert || !selectedSeats.length) {
    return (
      <BookingContainer>
        <LoadingSpinner>🎭 예매 정보를 불러오는 중...</LoadingSpinner>
      </BookingContainer>
    );
  }

  if (bookingSuccess) {
    return (
      <SuccessContainer>
        <SuccessCard>
          <SuccessIcon>🎉</SuccessIcon>
          <SuccessTitle>예매가 완료되었습니다!</SuccessTitle>
          <SuccessMessage>
            {concert.title} 공연의 좌석 예매가 성공적으로 완료되었습니다.
            <br />
            예매 확인 이메일을 확인해주세요.
          </SuccessMessage>
          <CheerMessage>
            <CheerTitle>🎭 페스티벌을 응원합니다!</CheerTitle>
            <CheerText>
              멋진 공연이 될 거예요! 즐거운 시간 보내세요.
              <br />
              예매 확인 이메일을 꼭 확인해주세요.
            </CheerText>
          </CheerMessage>
          
          <CheerMessage style={{ background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)', borderColor: '#2196f3' }}>
            <CheerTitle style={{ color: '#0d47a1' }}>💡 공연 팁</CheerTitle>
            <CheerText style={{ color: '#0d47a1' }}>
              공연 시작 30분 전에 도착하시면 여유롭게 자리를 찾을 수 있어요.
              <br />
              공연 중에는 사진 촬영을 자제해주세요.
            </CheerText>
          </CheerMessage>
          <ActionButton variant="primary" onClick={() => {
             // 예매 완료 후 홈으로 이동하면서 좌석 상태 업데이트 트리거
             navigate('/', { 
               state: { 
                 bookingCompleted: true,
                 concertId: concert?.id 
               } 
             });
           }}>
              홈으로 돌아가기
           </ActionButton>
        </SuccessCard>
      </SuccessContainer>
    );
  }

  return (
    <BookingContainer>
      <Header>
        <Title>🎫 좌석 예매</Title>
        <Subtitle>예약자 정보를 입력하고 결제를 완료하세요</Subtitle>
      </Header>

      <BookingSummary>
        <SummaryHeader>
          <div className="concert-icon">🎭</div>
          <div className="concert-info">
            <h3>{concert.title}</h3>
            <p>🎤 {concert.artist} | 📍 {concert.venue}</p>
            <p>📅 {new Date(concert.date).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
          </div>
        </SummaryHeader>

        <SelectedSeatsInfo>
          <h4>선택된 좌석 ({selectedSeats.length}개)</h4>
          <div className="seats-grid">
            {selectedSeats.map(seat => (
              <div key={seat.id} className="seat-item">
                <div className="seat-location">
                  {seat.section}구역 {seat.row}열 {seat.seatNumber}번
                </div>
                <div className="seat-price">
                  {formatPrice(seat.price)}원
                </div>
              </div>
            ))}
          </div>
        </SelectedSeatsInfo>

        <TotalPrice>
          <div className="label">총 결제 금액</div>
          <div className="amount">{formatPrice(calculateTotalPrice())}원</div>
        </TotalPrice>
      </BookingSummary>

      <CustomerForm>
        <FormTitle>📝 예약자 정보</FormTitle>
        
        <FormSection>
          <h3>예약자 정보</h3>
          
          {errors.general && (
            <ErrorMessage style={{ 
              background: '#f8d7da', 
              color: '#721c24', 
              padding: '12px', 
              borderRadius: '8px', 
              marginBottom: '16px',
              border: '1px solid #f5c6cb'
            }}>
              ❌ {errors.general}
            </ErrorMessage>
          )}
          
          <FormGroup>
            <label htmlFor="email">이메일 주소 *</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={errors.email ? 'error' : ''}
                placeholder="예: user@example.com"
                style={{ flex: 1 }}
              />
              <Button
                variant="secondary"
                onClick={checkEmailDuplicate}
                disabled={checkingEmail || !email.trim()}
                style={{ minWidth: '100px' }}
              >
                {checkingEmail ? '확인 중...' : '중복 확인'}
              </Button>
            </div>
            {errors.email && <span className="error-message">{errors.email}</span>}
            {emailConfirmed && (
              <div style={{ 
                color: '#28a745', 
                fontSize: '0.9rem', 
                marginTop: '4px',
                fontWeight: '500'
              }}>
                ✓ 사용 가능한 이메일입니다
              </div>
            )}
          </FormGroup>
        </FormSection>
      </CustomerForm>

      <ActionButtons>
        <Button 
          variant="secondary" 
          onClick={() => navigate(-1)}
        >
          ← 이전 단계로
        </Button>
        <Button 
          variant="primary" 
          disabled={bookingInProgress}
          onClick={handleBooking}
        >
          {bookingInProgress ? '예매 처리 중...' : '예매 완료하기'}
        </Button>
      </ActionButtons>
    </BookingContainer>
  );
};

export default BookingPage;
