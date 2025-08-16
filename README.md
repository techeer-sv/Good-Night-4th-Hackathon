# Good-Night-4th-Hackathon

공연 좌석 예매 시스템 풀스택 구현

## 프로젝트 개요

이 프로젝트는 사용자가 웹에서 공연 좌석을 확인하고 예약할 수 있는 시스템입니다. 프론트엔드는 **React**를 사용해 직관적이고 반응형 UI를 구현하였고, 백엔드는 **Node.js와 Express**를 활용해 빠르고 안정적으로 구현했습니다. 또한 **REST API**를 통해 프론트엔드와 백엔드 간 데이터를 실시간으로 교환합니다.

## 프로젝트 실행 방법
1. **레포지토리 클론:**  
git clone https://github.com/doyun9288/Good-Night-4th-Hackathon.git  
cd ood-Night-4th-Hackathon
2. **환경 설치**
Node.js 설치: [https://nodejs.org/](https://nodejs.org/)
3. **프론트엔드 설치 밎 실행**
- 프론트엔드 디렉토리로 이동  
cd frontend
- 의존성 설치  
npm install
- 개발 서버 실행 (포트 3000)  
npm start
4. **백엔드 설치 및 실행**
- 백엔드 디렉토리로 이동  
cd backend
- 의존성 설치  
npm install
- 개발 모드 실행 (포트 5000, 자동 DB 초기화)  
npm run dev

---

## 기술 스택 선택 이유
- **React**: 가상 DOM을 사용한 빠른 렌더링
- **Node.js + Express**: 빠른 서버 사이드 개발과 REST API 구현이 쉬움
- **SQLite**: 서버 설치나 별도의 설정이 필요 없는 가벼운 파일 기반 데이터베이스로, 소규모 프로젝트에서 빠르게 데이터 관리를 할 수 있음

---

## 구현한 요구사항 체크리스트
### 최소 요구사항
- [x] 좌석 현황 표시
- [x] 좌석 예약 기능
- [x] API 엔드포인트
- [x] 코드 품질 보장
### 기본 요구사항
- [x] 사용자 경험 개선
- [x] 안정적인 서비스 운영
### 심화 요구사항
- [ ] 동시성 제어
- [ ] 실시간 좌석 상태 동기화
- [ ] 선택한 좌석에 대한 우선순위 제공

## 각 요구사항별 해결 방법 설명
### 최소 요구사항
1. **좌석 현황 표시:**
  - `useEffect`를 사용하여 백엔드 API(/api/booked-seats)에서 예약된 좌석 배열을 가져옴.
  ``` javascript
    useEffect(() => {
    fetchBookedSeats();
  }, []);
  ```
  - 좌석을 표시하는 `Seat`컴포넌트가 `SeatGrid`컴포넌트를 부모로 함으로써 3x3배열로 나타남.
  ``` javascript
  const SeatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-bottom: 30px;
  `;
  ```
  - props(isBooked, isSelected)를 받은 `Seat`컴포넌트가 좌석의 상태를 시각적으로 나타냄.
2. **좌석 예약 기능:**
  - 사용자가 예약 가능한 좌석을 클릭하면 선택된 좌석 정보를 `Home` 컴포넌트의 `selectedSeats` 상태로 저장하고 `Reservation` 컴포넌트를 렌더링.
  - `Reservation` 컴포넌트에서 예약자 정보를 입력하고 '예매 완료' 버튼을 누르면 모든 필드가 입력되었는지 검증, 빈 필드가 있으면 경고 메시지 표시.
  - 모든 정보 입력 완료 후 `/api/db-test API`로 서버 상태를 확인, 정상이면 `POST /api/book-seats` API를 호출. 백엔드에서는 1% 확률의 의도적인 예매 실패를 시뮬레이션.
  ``` javascript
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
  ```
  - API 호출 결과에 따라 성공 시 성공 메시지를 표시, 홈 화면으로 복귀, 실패 시에는 오류 메시지를 표시하고 폼 데이터를 초기화.
3. **API 엔드포인트:**
  - `GET /api/booked-seats`: 모든 예약된 좌석의 번호를 JSON 배열로 반환.
  - `POST /api/book-seats`: 예약자 정보(이름, 이메일, 전화번호)와 선택된 좌석 배열을 받아 좌석을 예약 처리, 예매 성공/실패 결과를 JSON으로 반환.
4. **코드 품질 보장:**
  - 기본 타입 체크 함수 추가(배열, 숫자,, 문자열, 함수, 객체 타입 검증)
  - 실시간 타입 검증(API 응답 데이터, 사용자 입력, 상태 업데이트, 컴포넌트 렌더링)

### 기본 요구사항
1. **사용자 경험 개선:**
- **직관적인 UI:** 직관적인 UI를 위해 좌석 상태를 알려주는 범례를 제거.
- **로딩 상태:** 네트워크 지연이 발생할 경우 로딩 화면을 띄워 네트워크 지연이 표시.
2. **안정적인 서비스 운영:**
- **잘못된 요청이 들어왔을 때:** 도메인별 유효성 체크(좌석 번호, 좌석 배열, 페이지 상태, 로딩 상태)
- **존재하지 않는 좌석을 예약하려 할 때:** 좌석 번호 유효성 체크(1-9범위 내의 정수인지 확인)

