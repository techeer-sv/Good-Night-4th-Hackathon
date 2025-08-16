# Good-Night-4th-Hackathon

공연 좌석 예매 시스템 풀스택 구현

## 안내사항

- 본 레포지토리를 **fork**하여 과제를 수행하고, 완료시 PR을 보냅니다.
- 과제의 소스코드는 본인의 GitHub 레포지토리에 **Public**으로 올려주세요.
- 진행 간 문의사항은 이 레포지토리의 Issue로 등록해주세요.
- 구현 내용은 README.md 하단에 이어서 작성해 주세요.

## 과제 목표

공연 좌석 예매 시스템 구현

### 기술 스택

- Backend: FastAPI,
- Frontend: 자유 선택 (React, Vue, Svelte, Vanilla JS 등)
- Database: 자유 선택
- 선택한 기술 스택에 대한 이유를 README에 간단히 설명해주세요

### 평가 항목

- 문제 해결 접근 방식에서 기술적 의사결정
- 구현 완성도와 문서화 수준

## 요구사항

### 최소 요구사항

> 아래 목표들을 달성하기 위한 구현 방법은 자유롭게 선택하세요.

1. **좌석 현황 표시**
   - 3x3 격자 형태로 총 9개의 좌석 표시
   - 각 좌석의 예약 가능/불가능 상태를 시각적으로 구분
2. **좌석 예약 기능**
   - 사용자가 빈 좌석을 클릭하여 선택
   - 페이지를 이동하여 예약자 정보 입력
   - 정보 입력 완료 후 예약 확정 시도
     - 99% 확률로 예약 성공 처리
     - 1% 확률로 의도적 실패 처리
   - 예약 성공/실패에 대한 명확한 피드백 제공
3. **API 엔드포인트**
   - 좌석 목록 조회 API
   - 좌석 예약 요청 API
   - HTTP 통신을 통한 데이터 교환
4. **코드 품질 보장**
   - 테스트 코드
   - 타입 체크
   - 린팅

### 기본 요구사항

> 아래 목표들을 달성하기 위한 구현 방법은 자유롭게 선택하세요.

> 각 목표를 어떻게 해결했는지 README에 설명해주세요.

1. **사용자 경험 개선**
   - **목표**: 사용자가 서비스를 이용할 때 발생할 수 있는 불편함 최소화
   - **예시**
     - 직관적인 UI
     - 네트워크 지연이 발생했을 때 편의성
     - 예약이 실패했을 때 편의성
     - 모바일에서 접속했을 때 편의성
2. **안정적인 서비스 운영**
   - **목표**: 예상치 못한 상황에서도 서비스가 안정적으로 동작
   - **예시**
     - 잘못된 요청이 들어왔을 때
     - 존재하지 않는 좌석을 예약하려 할 때
     - 서버 에러가 발생했을 때
     - 데이터 정합성 보장

### 심화 요구사항

> 아래 목표들을 달성하기 윈한 구현 방법은 자유롭게 선택하세요.

> 각 목표를 달성했음을 검증할 방법을 마련하세요.

> 시도한 방법이 어떤 방식으로 문제를 해결했으며 보유한 한계점에 대해 상세히 README에 설명해주세요.

1. **동시성 제어**
   - **상황**: 여러 사용자가 동시에 같은 좌석을 예약하려고 시도하는 경우
   - **목표**: 한 좌석에 대해 단 한 명만 예약에 성공하도록 보장
2. **실시간 좌석 상태 동기화**
   - 상황: UI에서 사용자들이 이미 선택된 좌석을 선택하게 되는 경우
   - 목표: 실시간 좌석 예약 상태를 확인할 수 있도록 실시간 동기화 제공
3. **선택한 좌석에 대한 우선순위 제공**
   - 상황 : 좌석 선택 후 예약자 정보를 입력하는 동안 다른 사용자가 좌석을 예약하게 되는 경우
   - 목표: 동일 좌석에 대해 먼저 선택을 한 사용자에게 예약 우선순위 제공

## 참고사항

### 진행 방식

- 최소 요구사항을 먼저 완성한 후 기본 기능을 구현해주세요
- 심화 요구사항은 구현에 실패해도 고민한 해결 방법이 있으면 작성해주세요.

### 필수 제출 항목

- **README.md**: 다음 내용을 반드시 포함
  - 프로젝트 실행 방법 (상세하게)
  - 기술 스택 선택 이유
  - 구현한 요구사항 체크리스트
  - 각 요구사항별 해결 방법 설명

### 선택 제출 항목

- 아키텍처 다이어그램
- 시연 영상 또는 GIF

---

<!-- 구현 내용 작성 -->

# Good-Night-4th-Hackathon

공연 좌석 예매 시스템 풀스택 구현

## 프로젝트 개요

이 프로그램은 공연 좌석 예매 시스템을 구현하여 사용자가 좌석을 예약 할 수 있는 웹입니다. 프론트엔드와 백엔드가 분리된 구조로, 프론트엔드는 React와 Vite를 사용하여 개발하였으며, 백엔드는 FastAPI를 사용하였습니다. 데이터베이스는 Docker의 MYSQL를 사용하였습니다.

## 프로젝트 실행 방법

1.  **Docker 설치**: 시스템에 [Docker](https://www.docker.com/get-started)가 설치되어 있어야 합니다.
2.  **레포지토리 클론**:
    ```bash
    git clone <your-fork-url>
    cd Good-Night-4th-Hackathon
    ```
3.  **Docker를 통한 MYSQL데이터 입력**:

    ```bash
      docker run -p 3306:3306 -e MYSQL_ROOT_PASSWORD=booking -e MYSQL_DATABASE=booking -d -v booking:/db --name booking mysql:8.0

      docker exec -it todos bash

      mysql -u root -p

      booking

      show databases

      use booking;

      CREATE TABLE seats (
    ->     id INT PRIMARY KEY,
    ->     is_booked BOOLEAN NOT NULL DEFAULT FALSE
    -> );

      INSERT INTO seats (id, is_booked) VALUES
    -> (1, FALSE),
    -> (2, FALSE),
    -> (3, FALSE),
    -> (4, FALSE),
    -> (5, FALSE),
    -> (6, FALSE),
    -> (7, FALSE),
    -> (8, FALSE),
    -> (9, FALSE);

    CREATE TABLE reservations (
    reservation_id INT PRIMARY KEY AUTO_INCREMENT,
    seat_id INT NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    FOREIGN KEY (seat_id) REFERENCES seats(id)
    );

    ```

4.  **애플리케이션 접속**:
    - 프론트엔드는 npm run dev을 통해 `http://localhost:5173/` 로 접속합니다.
    - 백엔드 API는 uvicorn main:app을 통해 `http://127.0.0.1:8000` 에서 직접 접근할 수 있습니다.

## 프로젝트 실행 방법

### 1. 사전 요구사항

- Docker와 Docker Compose가 설치되어 있어야 합니다.
- Node.js 16 이상
- Python 3.9 이상

### 2. 프로젝트 클론

```bash
git clone https://github.com/minseon0201/Good-Night-4th-Hackathon.git
cd Good-Night-4th-Hackathon
```

### 3. 백엔드 테스트

```bash
cd backend
mypy your_script_name.py
black . # 전체 프로젝트 포맷팅
ruff check . # 잠재적인 오류를 검사합니다.
ruff check --fix . # 검사 후 발견된 오류를 자동으로 수정합니다.
```

### 4. 프론트엔드 테스트

```bash
cd frontend
npm run lint
```

## 기술 스택 선택 이유

- **Backend (FastAPI)** - **FastAPI**: 빠른 성능과 쉬운 비동기 처리,
  자동 API 문서화 (OpenAPI/Swagger),
  Python의 타입 힌트를 활용한 강력한 타입 검사,
  간결한 코드로 빠른 개발 가능 - **Poetry**: 의존성 관리의 현대적 해결책,
  가상환경 자동 관리,
  lock 파일을 통한 재현 가능한 빌드

- **Frontend (React + Vite)**

  - **React**: 컴포넌트 기반 아키텍처를 통해 재사용 가능하고 논리적인 UI 구조를 만들 수 있습니다. 방대한 커뮤니티와 자료 덕분에 문제 해결이 용이합니다.
  - **Vite**: 매우 빠른 빌드 속도와 Hot Module Replacement(HMR)를 제공하여 개발 경험을 크게 향상시킵니다.
  - **TypeScript**: 정적 타이핑을 통해 런타임 에러를 사전에 방지하고, 코드의 안정성과 가독성을 높입니다.

- **Database (MySQL)** - 신뢰성 있는 트랜잭션 처리,
  외래 키를 통한 데이터 정합성 보장,
  Docker를 통한 쉬운 설정과 배포

- **Containerization (Docker)**

  - Docker를 통해 개발 환경과 배포 환경을 일치시켜 "내 컴퓨터에서는 됐는데..."와 같은 문제를 원천적으로 차단합니다.

  ## 구현한 요구사항 체크리스트

- [x] **최소 요구사항**
  - [x] 좌석 현황 표시 (3x3 격자)
  - [x] 좌석 예약 기능 (성공/실패 피드백 포함)
  - [x] API 엔드포인트 (좌석 목록 조회, 좌석 예약)
  - [x] 코드 품질 보장 (단위/통합 테스트, 타입 체크, 린팅)
- [x] **기본 요구사항**
  - [x] 사용자 경험 개선 (직관적 UI, 에외처리)
  - [x] 안정적인 서비스 운영 (예외 처리, 데이터 정합성)

### 최소 요구사항

1. **좌석 현황 표시**:

   - FastAPI의 `GET /api/seats` 엔드포인트에서 좌석 목록을 조회합니다.
   - React 컴포넌트 `seat.jsx`에서 3x3 격자 형태로 좌석을 표시합니다.

   ```jsx
   // seat.jsx
   const SeatGrid = styled.div`
     display: grid;
     grid-template-columns: repeat(3, 1fr);
     gap: 10px;
   `;
   ```

   - 예약 상태에 따라 다른 스타일을 적용하여 시각적 구분을 제공합니다:
     - 예약 가능: 녹색
     - 예약 불가: 회색

2. **좌석 예약 기능**:

   - `bookingformpage.jsx`에서 예약자 정보(이름, 전화번호) 입력 폼을 구현했습니다.
   - FastAPI의 `BookingRequest` 모델을 통해 요청 데이터 유효성을 검증합니다.

   ```python
   # request.py
   class BookingRequest(BaseModel):
       seatId: int
       userName: str
       phoneNumber: str
   ```

   - 1% 확률의 의도적 실패를 위해 `random.random() < 0.01` 조건을 구현했습니다.
   - 예약 결과는 `bookingresultpage.jsx`에서 사용자에게 표시됩니다.

3. **API 엔드포인트**:

   - `main.py`에 구현된 두 개의 핵심 엔드포인트:

     ```python
     @app.get("/api/seats", status_code=200)
     async def get_seats_api(...)

     @app.post("/api/book-seat")
     async def book_seat(...)
     ```

   - HTTP 상태 코드를 통한 명확한 응답 처리:
     - 200: 성공
     - 400: 잘못된 요청
     - 404: 좌석 없음
     - 409: 이미 예약됨

4. **코드 품질 보장**:
   - **테스트 코드**:
     ```python
     # test_main.py
     def test_get_seats_api(client, mocker)
     def test_book_seat(client, mocker)
     ```
   - **타입 체크**:
     - mypy를 사용한 정적 타입 검사
     ```bash
     mypy src/main.py
     ```
   - **린팅**:
     - ruff와 black을 통한 코드 스타일 통일
     ```bash
     black .
     ruff check .
     ```

### 기본 요구사항

1. **사용자 경험 개선**:

   - 직관적인 UI 구현
   - 예약 실패시 명확한 에러 메시지 표시
   - 로딩 상태 표시로 네트워크 지연 시 사용자 피드백 제공

2. **안정적인 서비스 운영**:
   - 예외 상황 처리 및 에러 핸들링
   - 데이터베이스 트랜잭션 관리
   - 요청 데이터 검증

### 기본 요구사항

1.  **사용자 경험 개선**:
    - **직관적인 UI**: 좌석 선택 -> 정보 입력 -> 예약 확정으로 이어지는 단순하고 명확한 워크플로우를 채택했습니다.
    - **로딩 상태**: 스피너 애니메이션과 명확한 상태 메시지를 통해 네트워크 지연 상황에서 사용자 경험을 개선했습니다.
2.  **안정적인 서비스 운영**:
    - **예외 처리**: raise HTTPException로 서비스 전반의 예외를 일관되게 처리합니다. 존재하지 않는 좌석(`404 Not Found`), 이미 예약된 좌석(`409 Conflict`), 서버 내부 오류(`500 Internal Server Error`) 등 상황에 맞는 HTTP 상태 코드와 명확한 에러 메시지를 반환하여 클라이언트가 에러 상황에 대처할 수 있도록 했습니다.
