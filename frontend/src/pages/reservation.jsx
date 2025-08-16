import React, { useState } from 'react';
import styled from 'styled-components';

const ReservationContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
  padding: 20px;
`;

const ReservationCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  min-width: 400px;
  max-width: 500px;
`;

const Title = styled.h1`
  color: #333;
  margin-bottom: 30px;
  font-size: 24px;
  text-align: center;
`;

const SelectedSeatsInfo = styled.div`
  background: #e8f5e8;
  border: 1px solid #4CAF50;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 25px;
  text-align: center;
`;

const SelectedSeatsTitle = styled.h3`
  color: #2e7d32;
  margin-bottom: 10px;
  font-size: 16px;
`;

const SelectedSeatsList = styled.div`
  color: #4CAF50;
  font-size: 18px;
  font-weight: bold;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  color: #333;
  font-weight: 600;
  font-size: 14px;
`;

const Input = styled.input`
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #2196F3;
  }
  
  &:invalid {
    border-color: #f44336;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 10px;
`;

const Button = styled.button`
  flex: 1;
  padding: 15px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const PrimaryButton = styled(Button)`
  background: #2196F3;
  color: white;
  
  &:hover {
    background: #1976D2;
    box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const SecondaryButton = styled(Button)`
  background: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
  
  &:hover {
    background: #e0e0e0;
  }
`;

const Reservation = ({ selectedSeats, onBack, onComplete }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // 먼저 서버 상태 확인
      console.log('서버 상태 확인 중...');
      const healthCheck = await fetch('http://localhost:5000/api/db-test');
      
      if (!healthCheck.ok) {
        throw new Error(`서버 상태 확인 실패: ${healthCheck.status}`);
      }
      
      const healthData = await healthCheck.json();
      console.log('서버 상태:', healthData);
      
      if (!healthData.success) {
        throw new Error(`데이터베이스 연결 실패: ${healthData.message}`);
      }
      
      console.log('예매 요청 데이터:', { seats: selectedSeats, customerInfo: formData });
      
      // 예약자 정보와 함께 좌석 예매 API 호출
      const response = await fetch('http://localhost:5000/api/book-seats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          seats: selectedSeats,
          customerInfo: formData
        })
      });
      
      console.log('응답 상태:', response.status);
      console.log('응답 헤더:', response.headers);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('응답 데이터:', data);
      
      if (data.success) {
        alert(`예매가 완료되었습니다!\n\n예약자: ${formData.name}\n선택된 좌석: ${selectedSeats.sort((a, b) => a - b).join(', ')}번`);
        onComplete(); // 예매 완료 후 홈으로 돌아가기
      } else {
        alert(`예매 실패: ${data.message}`);
      }
    } catch (error) {
      console.error('예매 오류 상세 정보:', error);
      console.error('오류 스택:', error.stack);
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        alert('서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
      } else if (error.message.includes('서버 상태 확인 실패')) {
        alert('백엔드 서버가 실행되지 않았습니다. 서버를 시작해주세요.');
      } else if (error.message.includes('데이터베이스 연결 실패')) {
        alert('데이터베이스 연결에 문제가 있습니다. 서버를 재시작해주세요.');
      } else {
        alert(`예매 중 오류가 발생했습니다.\n\n오류 내용: ${error.message}\n\n개발자 도구의 콘솔을 확인해주세요.`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    onBack();
  };

  return (
    <ReservationContainer>
      <ReservationCard>
        <Title>예약자 정보 입력</Title>
        
        <SelectedSeatsInfo>
          <SelectedSeatsTitle>선택된 좌석</SelectedSeatsTitle>
          <SelectedSeatsList>
            {selectedSeats.sort((a, b) => a - b).join(', ')}번
          </SelectedSeatsList>
        </SelectedSeatsInfo>
        
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="name">이름 *</Label>
            <Input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="예약자 이름을 입력하세요"
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="email">이메일 *</Label>
            <Input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="example@email.com"
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="phone">전화번호 *</Label>
            <Input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="010-1234-5678"
              required
            />
          </FormGroup>
          
          <ButtonGroup>
            <SecondaryButton type="button" onClick={handleBack}>
              뒤로 가기
            </SecondaryButton>
            <PrimaryButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? '예매 중...' : '예매 완료'}
            </PrimaryButton>
          </ButtonGroup>
        </Form>
      </ReservationCard>
    </ReservationContainer>
  );
};

export default Reservation;
