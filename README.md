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

- Backend: 자유 선택 (Spring Boot, Node.js, Django, FastAPI 등)
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

# 🎪 공연 좌석 예매 시스템 (Backend & Frontend)

## 1. 프로젝트 소개

이 프로젝트는 React와 Django를 사용하여 개발한 실시간 좌석 예매 시스템입니다. 사용자는 좌석 현황을 확인하고, 회원가입 및 로그인을 통해 원하는 좌석을 예약, 조회, 취소할 수 있습니다.

단순한 기능 구현을 넘어, 실제 서비스에서 마주할 수 있는 **동시성 문제, 실시간 동기화, 사용자 경험, 서비스 안정성** 등 심화된 주제들을 해결하는 데 중점을 두었습니다. 모든 개발 과정은 Docker 컨테이너 환경에서 이루어졌으며, 테스트, 린팅, 타입 체크를 포함한 코드 품질 보증 체계를 구축하여 프로젝트의 안정성과 유지보수성을 확보했습니다.

## 2. 기술 스택

### Backend
- **Framework**: Django, Django REST Framework
- **Database**: MySQL
- **Authentication**: JWT (djangorestframework-simplejwt)
- **API Documentation**: drf-spectacular (Swagger UI)

### Frontend
- **Framework**: React
- **Language**: TypeScript
- **Build Tool**: Vite
- **Package Manager**: Yarn
- **Styling**: Tailwind CSS
- **API Client**: Axios

### Code Quality & DevOps
- **Testing**:
    - **Backend**: Pytest (via Django Test Runner), APITestCase
    - **Frontend**: Vitest, React Testing Library
- **Linting & Formatting**:
    - **Backend**: Ruff
    - **Frontend**: ESLint, Prettier
- **Type Checking**:
    - **Backend**: Mypy, django-stubs, djangorestframework-stubs
    - **Frontend**: TypeScript
- **Infrastructure**: Docker, Docker Compose

## 3. 실행 방법

이 프로젝트는 Docker를 사용하여 모든 서비스를 한 번에 실행하는 것을 권장합니다.

### Docker를 사용하여 통합 실행 (권장)

로컬 PC에 Docker와 Docker Compose만 설치되어 있으면 됩니다.

1.  프로젝트 루트 폴더에 `.env` 파일을 생성하고 DB 환경 변수를 설정합니다.
    ```env
    MYSQL_ROOT_PASSWORD=your_root_password
    MYSQL_DATABASE=ticket_db
    MYSQL_USER=your_user
    MYSQL_PASSWORD=your_password
    ```
2.  터미널에서 아래 명령어를 실행합니다.
    ```bash
    docker-compose up --build
    ```
3.  모든 서비스가 정상적으로 실행되면 아래 주소로 접속할 수 있습니다.
    - **Frontend (React)**: `http://localhost:5173`
    - **Backend (Django)**: `http://localhost:8000`
    - **API Docs (Swagger UI)**: `http://localhost:8000/api/schema/swagger-ui/`

### 로컬 환경에서 개별 실행

각각의 환경(Node.js, Python)이 로컬 PC에 별도로 구축되어 있는 경우 사용할 수 있습니다.

1.  **Backend 실행**:
    ```bash
    cd Backend
    # 가상환경 활성화
    uv pip install -r requirements.txt
    python manage.py runserver
    ```
2.  **Frontend 실행**:
    (새로운 터미널에서)
    ```bash
    cd Frontend
    yarn install
    yarn dev
    ```
    
## 4. 요구사항 해결 전략

### 4.1. 최소 요구사항 달성

#### **1. 좌석 현황 표시**
- **해결**: `GET /api/seats/` API를 통해 백엔드에서 좌석 목록을 제공하고, React 프론트엔드에서 이 데이터를 받아 3x3 격자 형태로 렌더링했습니다. 각 좌석의 `is_reserved` 상태에 따라 Tailwind CSS를 이용해 예약 가능/불가 상태를 명확히 시각적으로 구분했습니다.

#### **2. 좌석 예약 기능**
- **해결**: 사용자가 빈 좌석을 클릭하면 선택 상태로 UI가 변경되고, 예약 페이지로 이동합니다. 예약 확정 시 `POST /api/seats/reserve/` API를 호출합니다. 백엔드에서는 `random` 모듈을 사용해 의도적으로 1%의 예약 실패 상황을 시뮬레이션했으며, 프론트엔드에서는 `react-hot-toast`와 같은 라이브러리를 사용하여 예약 성공/실패에 대한 명확하고 직관적인 피드백을 제공하도록 설계했습니다.

#### **3. API 엔드포인트**
- **해결**: Django REST Framework와 `drf-spectacular`를 사용하여 기능별 API 엔드포인트를 체계적으로 구축하고 Swagger UI를 통해 명세화했습니다.
    - `GET /api/seats/`: 좌석 목록 조회
    - `POST /api/seats/reserve/`: 좌석 예약
    - `DELETE /api/seats/{seat_number}/cancel/`: 좌석 취소
    - `POST /api/seats/reset/`: (관리자용) 모든 좌석 초기화
    - `POST /api/users/signup/`: 회원가입
    - `POST /api/users/login/`: 로그인 (JWT 발급)
    - `GET /api/users/me/reservations/`: 내 예매 목록 조회

#### **4. 코드 품질 보장**
- **해결**: 백엔드와 프론트엔드 양쪽 모두에 체계적인 코드 품질 보증 시스템을 구축했습니다.
    - **테스트 코드**: 백엔드는 `APITestCase`로 API의 요청/응답 및 비즈니스 로직을 검증하고, 프론트엔드는 `Vitest`와 `React Testing Library`로 컴포넌트의 렌더링과 상호작용을 검증하여 기능의 안정성을 확보했습니다.
    - **타입 체크**: 백엔드는 `Mypy`와 `django-stubs`를, 프론트엔드는 `TypeScript`를 사용하여 코드 실행 전에 발생할 수 있는 타입 관련 오류를 사전에 방지하고 코드의 신뢰성을 높였습니다.
    - **린팅/포맷팅**: 백엔드는 `Ruff`, 프론트엔드는 `ESLint`와 `Prettier`를 도입하여 일관된 코드 스타일을 유지하고 잠재적인 오류를 최소화했습니다. 이 모든 검사는 `pre-commit`과 `husky`를 통해 Git 커밋 시 자동으로 실행되도록 자동화했습니다.

### 4.2. 기본 요구사항 달성

#### **1. 사용자 경험 개선**
> **목표**: 사용자가 서비스를 이용할 때 발생할 수 있는 불편함 최소화

백엔드는 프론트엔드가 훌륭한 사용자 경험을 만들 수 있도록 명확하고 예측 가능한 데이터와 응답을 제공하는 방식으로 기여했습니다.

- **네트워크 지연 및 예약 실패 대응**: API 요청이 처리되는 동안 프론트엔드가 로딩 상태(스피너 등)를 표시할 수 있도록 API를 설계했습니다. 또한, 예약 실패 원인에 따라 `409 Conflict`(중복 예약), `404 Not Found`(좌석 없음) 등 구체적인 HTTP 상태 코드를 반환하여, 프론트엔드가 사용자에게 "이미 예약된 좌석입니다" 와 같이 상황에 맞는 정확한 안내를 할 수 있도록 지원했습니다.

- **직관성 및 모바일 편의성 지원**: 백엔드 API는 기기에 상관없이 동일한 정제된 데이터를 제공하므로, 프론트엔드는 이 데이터를 바탕으로 Tailwind CSS 등을 사용하여 모바일/데스크탑 환경에 맞는 최적의 UI를 그리는 데만 집중할 수 있습니다.

#### **2. 안정적인 서비스 운영**
> **목표**: 예상치 못한 상황에서도 서비스가 안정적으로 동작

서비스의 안정성은 전적으로 백엔드의 책임이라는 원칙하에, 다음과 같은 장치들을 통해 견고함을 확보했습니다.

- **데이터 정합성 보장 (동시성 제어)**: 좌석 예매 시스템의 핵심인 '동시 예약' 문제를 해결하기 위해 데이터베이스의 **비관적 잠금(Pessimistic Lock)**을 구현했습니다. `transaction.atomic`과 `select_for_update`를 통해 특정 좌석에 대한 예약 트랜잭션이 처리되는 동안 다른 동시 요청의 접근을 DB 레벨에서 원천적으로 차단하여, 단 하나의 예약만 성공하도록 100% 보장합니다.

- **잘못된 요청 처리**: DRF Serializer를 통해 API로 들어오는 모든 요청의 데이터 타입, 형식, 필수값 여부를 검증합니다. 유효하지 않은 요청은 비즈니스 로직에 도달하기 전에 즉시 `400 Bad Request`로 처리하여 시스템 내부를 보호합니다.

- **서버 에러 대응**: Django의 `LOGGING` 시스템을 설정하여, `DEBUG=False`인 운영 환경에서 예측하지 못한 오류 발생 시 모든 상세 내역을 `logs/error.log` 파일에 기록하도록 구축했습니다. 이를 통해 서비스가 중단되지 않으면서도, 개발자는 신속하게 문제의 원인을 파악하고 대응할 수 있습니다.
