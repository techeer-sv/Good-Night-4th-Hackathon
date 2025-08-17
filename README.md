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

> 각 목표를 어떻게 해결했는지 README에 설명해주세요.

    - **목표**: 사용자가 서비스를 이용할 때 발생할 수 있는 불편함 최소화
    - **예시**
        - 직관적인 UI
        - 네트워크 지연이 발생했을 때 편의성
        - 예약이 실패했을 때 편의성
        - 모바일에서 접속했을 때 편의성
2. **안정적인 서비스 운영**
        - 잘못된 요청이 들어왔을 때
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

## 프로젝트 구조 (2025 Refactor)

```
backend/
  Cargo.toml (워크스페이스 루트 & 바이너리)
  src/main.rs (앱 엔트리)
  config/
     api/ (라우터 & ApiConfig)
     database/ (DB 초기화)
     migration/ (SeaORM migration)
  seat/
     model/ (SeaORM Entity: Seat)
     service/ (Query & Mutation 로직)
     controller/ (HTTP Handler)
openresty/ (Nginx + Lua, API Gateway 예정)
redis/ (Redis 설정)
docker-compose.yml (redis 등 서비스 정의)
```

### 주요 변경 사항
* 워크스페이스를 `backend/` 단일 Cargo.toml로 통합
* SeaORM 1.1.* 로 업그레이드 및 Entity/Service 모듈 정리
* 중복되던 `entity` 크레이트 제거 → `seat_model` 로 단순화
* 컨트롤러/서비스 레이어 분리 (model ↔ service ↔ controller)
* Redis 연결 및 PING 헬스체크 코드 정비
* FCFS 글로벌 좌석 예약 엔드포인트 (`POST /api/v1/seats/reservation/fcfs`) 추가 – Redis INCR 시퀀스 + DB 조건부 UPDATE 로 경합 최소화
* 공통 의존성/에디션/린트 설정을 workspace 수준으로 통합

### 실행 방법
1. (선택) 환경 변수 설정: `.env` (예: DB_URL, REDIS_URL 등)
2. 마이그레이션 (필요 시):
    ```bash
    cd backend
    cargo run -p migration
    ```
3. 서버 실행:
    ```bash
    cd backend
    cargo run
    ```
    실행 후 OpenAPI 스펙(JSON): http://localhost:5800/openapi.json
        * 글로벌 FCFS 예약:
            ```bash
            curl -X POST http://localhost:5800/api/v1/seats/reservation/fcfs \
                -H 'Content-Type: application/json' \
                -H 'X-User-Id: user-123' \
                -d '{"userName":"Alice","phone":"010-1234-5678"}'
            ```
            성공 응답 예:
            ```json
            {"success":true,"seat":{"id":3,"status":true}}
            ```
            실패(reason) 예: `sold_out`, `already_reserved`, `contention`
4. OpenResty + Redis 조합 실행:
    ```bash
    docker compose up -d
    ```

### 좌석 도메인 개요
* Seat: id, status (예약 가능/불가)
* Query: 전체 좌석/단일 좌석 조회
* Mutation: 상태 변경 (경합 해결은 추후 Redis/DB 락 전략 적용 예정)

### 환경 변수 (.env)
핵심 변수 예시는 `.env.example` 참고.

| 변수 | 설명 | 비고 |
|------|------|------|
| DATABASE_URL | Postgres 연결 문자열 | 필수 |
| REDIS_HOST / REDIS_PORT / REDIS_PASSWORD | Redis 접속 정보 | REDIS_URL 로 대체 가능 |
| REDIS_URL | 전체 URL 직접 지정 | 선택 |
| FCFS_USER_HEADER | Gateway에서 사용자 식별 헤더 | 기본 X-User-Id |
| VITE_API_BASE / NEXT_PUBLIC_API_BASE | 프론트엔드 빌드 타임 API Base | 프레임워크별 prefix |
| GOOGLE_API_KEY | Gemini 사용 시 | 선택 |
| GEMINI_MODEL | Gemini 모델 ID | 기본 gemini-1.5-flash |

### FCFS API 스펙 요약
상세 문서: `docs/api-spec.md` 참고.

| 항목 | 값 |
|------|-----|
| Method | POST |
| Path | /api/v1/seats/reservation/fcfs |
| Header | X-User-Id (또는 FCFS_USER_HEADER) |
| Body | { "userName": string, "phone": string } |
| Success | { "success": true, "seat": { "id": number, "status": true } } |
| Error reason | sold_out | duplicate | contention | already_reserved |

### 다음 개선 예정 (Todo)
* docker-compose에 `app`, `gateway` 서비스 추가 및 OpenResty entrypoint 수정
* 동시성 제어(낙관락 또는 분산락) 적용
* 실시간 좌석 상태(WS or SSE) 반영
* 테스트 커버리지 확장 (service + controller 통합 테스트)
* README에 아키텍처 다이어그램 추가
* 예약 응답 reason 코드 enum-like 문서화 및 클라이언트 매핑 표 추가 (apiSpec.json 동기화 자동화)

