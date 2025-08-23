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

> **핵심 요약**
>
> * **프런트엔드**: Svelte(스벨트). 작은 번들, 러닝커브 낮음, 반응형 상태관리 내장 → **빠르게 완성**하기 적합.
> * **백엔드**: Rust + Salvo + SeaORM + PostgreSQL. 타입 안정성과 성능, 간결한 라우팅/ORM.
> * **게이트웨이**: OpenResty(Nginx+Lua) + Redis. **FCFS(선착순) 중복 방지 & 시퀀스 부여**로 경합 최소화.
> * **좌석 모델**: 3×3 총 9석. 조회/예약 API, 99% 성공·1% 의도적 실패 시뮬레이션, 실패/성공 피드백 명확화.
> * **코드 품질**: 타입체크/린트/테스트 기본 제공(프런트/백엔드).

---

## 1) 왜 Svelte인가? (선택 이유)

**Svelte**는 런타임 프레임워크가 아니라 **컴파일 단계에서 반응성 코드를 최소 JS로 변환**합니다. 본 과제는 “빠르게 만들고, 직관적인 UI로 시연”이 목표이므로 다음 이점이 큽니다.

* 상태/반응성 내장: `store`와 반응 구문만으로 간단한 글로벌 상태(좌석/로딩/에러) 구현.
* 번들 사이즈가 작고 초기 구동이 빠름 → 모바일에서도 쾌적.
* 러닝커브가 낮아 UI 변경/실험 속도가 빠름(이 과제의 **속도 우선** 목표와 부합).

> 결과적으로 **초기 구현 속도**와 **UX 민첩성**에서 가장 유리하다고 판단했습니다.

---

## 2) 아키텍처 개요

```text
[브라우저(Svelte)]
    ↓ HTTP/JSON
[OpenResty(API Gateway) + Lua]
    ├─ (Rate limit, 중복참여 차단, Request tagging)
    └─→ [Rust Salvo API] ── SeaORM ─→ [PostgreSQL]
                        └─→ [Redis] (FCFS 시퀀스/홀드 키)
```

### 설계 포인트

* **중복 참여 차단**: 게이트웨이에서 IP/사용자 헤더 기준으로 원자적 Redis 스크립트 수행(EVALSHA). 중복 시 **즉시 409** 응답.
* **FCFS 시퀀스**: Redis `INCR`로 **전역 순번**을 부여하고, DB에서는 조건부 `UPDATE ... WHERE status = 'available'`로 단 한 명만 성공.
* **단순성**: 9석 기준으로 지나친 복잡도 대신, **원자성·관측성·에러처리**에 집중.

---

## 실행 방법 (상세)

### 1. 환경 변수

`.env` 또는 시스템 환경으로 설정합니다. 샘플은 `.env.example` 참고.

| 변수                 | 설명                               | 비고                            |
| ------------------ | -------------------------------- | ----------------------------- |
| `DATABASE_URL`     | Postgres 연결 문자열                  | **필수**                        |
| `REDIS_URL`        | `redis://user:pass@host:port/db` | `REDIS_HOST/PORT/PASSWORD` 대체 |
| `FCFS_USER_HEADER` | 사용자 식별 헤더명                       | 기본 `X-User-Id`                |
| `VITE_API_BASE`    | 프론트 빌드 타임 API Base               | 예: `http://localhost:5800`    |

### 2. 데이터베이스 마이그레이션

```bash
cd backend
cargo run -p migration
```

### 3. 백엔드 서버 실행

```bash
cd backend
cargo run
```

* OpenAPI 스펙(JSON): `http://localhost:5800/openapi.json`

### 4. 게이트웨이/Redis (선택)

```bash
docker compose up -d  # redis, openresty 등
```

> 게이트웨이를 통해 유입 시, **중복참여 차단/레이트리밋**이 활성화됩니다.

### 5. 프런트엔드(Svelte)

```bash
cd frontend
pnpm i   # 또는 npm i / bun install
pnpm dev # 개발 서버
```

* 기본 화면: 3×3 그리드, 좌석별 상태 표시(예약 가능/불가).
* 빈 좌석 클릭 → 상세/예약자 정보 입력 페이지로 이동.

---

##  API 요약 & 예시

### 1. 좌석 목록 조회

* `GET /api/v1/seats`
* 응답 예시

```json
[
  { "id": 1, "status": true },
  { "id": 2, "status": false },
  ...
]
```

### 2. 글로벌 FCFS 예약

* `POST /api/v1/seats/reservation/fcfs`
* 헤더: `X-User-Id: user-123` (또는 `FCFS_USER_HEADER` 설정값)
* 바디:

```json
{ "user_name": "Alice", "phone": "010-1234-5678" }
```

* 성공(예):

```json
{ "success": true, "seat": { "id": 3, "status": true } }
```

* 실패(예):

```json
{ "success": false, "reason": "sold_out" }
```

> **의도적 실패 1%**: 컨트롤러 레벨에서 `if rand < 0.01 then return failure` 형태로 주입해 **오류 UX**를 테스트합니다.

### 3. 게이트웨이 엔드포인트(선택)

* `POST /fcfs/join?event=E&ttl=900`

  * 중복 참여(Lua + Redis 스크립트) 시 `409 duplicate`
  * 통과 시 백엔드로 프록시

---

## UI/UX 설계 (불편 최소화)

* **직관 UI**: 3×3 좌석이 즉시 보이며, 예약 가능 좌석은 강조/호버 가능, 불가 좌석은 비활성 스타일.
* **네트워크 지연**: 버튼에 로딩 스피너/`aria-busy` 적용, 중복 클릭 방지(`disabled || loading`).
* **실패 피드백**: 1% 실패/경합 실패 시 토스트 노출 + 재시도 동선 제공.
* **모바일 대응**: 그리드가 좁은 화면에서 3열 유지, 터치 히트박스 확장(패딩/간격), 시스템 폰트/명도 대비 준수.

---

## 동시성 제어 (심화)

### 1. 문제 상황

여러 사용자가 **동시에 같은 좌석**을 예약하려 할 때, 단 **한 명만** 성공해야 합니다.

### 2. 해결 전략

1. **게이트웨이에서 중복/과도한 요청 차단**

* `limit_req`(IP 기반), Lua 스크립트로 `fcfs:{event}:user:{user}` & `fcfs:{event}:ip:{ip}` 키를 **원자적**으로 체크/셋.

2. **백엔드에서 FCFS 시퀀스 + 조건부 업데이트**

* Redis `INCR fcfs:seq` → 부여된 순번을 서버 로깅/메트릭에 포함.
* DB에서 `UPDATE seats SET status = 'reserved', user=... WHERE id = ? AND status = 'available'`로 **낙관적 경쟁 해소**.
* 영향 행 수 1이면 성공, 0이면 이미 선점됨 → `already_reserved` 또는 `contention` 반환.

> **장점**: 단일 좌석 기준으로 DB의 **원자성**을 활용. Redis는 “대기열/순번”을 제공해 **관측성**과 **재현성**을 향상.

### 3. 한계

* 단일 인스턴스 DB 기준으로 가정. 분산/샤딩 환경에선 **좌석 파티셔닝 전략**이 필요.
* Redis Cluster 사용 시 Lua 스크립트 KEYS는 **해시태그**로 슬롯 고정 필요(`fcfs:{E}:user:U`).

---

## 실시간 좌석 상태 동기화 (심화)

* **기본**: 예약 후 목록/상세 재조회로 최신화(간단/안정적).
* **실시간(선택)**: SSE 또는 WebSocket으로 `seat_reserved` 이벤트 푸시.

  * 서버: 예약 성공 시 좌석 ID 브로드캐스트.
  * 클라: 수신 시 해당 좌석 UI를 즉시 **비활성** 처리.
* **한계**: 네트워크 분리/탭 유휴 상태 등으로 누락 가능 → \*\*주기적 폴링(백오프)\*\*과 **초기 동기화**를 병행.

---

## 선택 좌석 우선순위 (심화)

* 사용자가 정보 입력 중일 때 다른 사용자가 선점하지 못하도록 **소프트 홀드(soft-hold)** 도입 가능.

  * Redis 키: `seat:{id}:{event}:hold:{user}` → `SET NX EX=120` (기본 2분).
  * 백엔드 예약 시, 본인 홀드가 있거나(동일 사용자) 아직 비어있을 때만 `UPDATE` 허용.
* **한계**: 홀드 남용/고아(만료 전 이탈) 방지 위해 **짧은 TTL** 및 장바구니 UI 상 타이머 표시 필요.

---

## 안정적인 운영 (에러/정합성/보안)

* **잘못된 요청**: 스키마 검증 → `400 validation`, 명확한 `reason` 코드.
* **서버 에러**: `500 internal` + `request_id` 로그 상관키 제공.
* **정합성**: DB 조건부 업데이트로 중복 예약 방지.
* **보안**:

  * `X-User-Id`는 스푸핑 가능 → 게이트웨이에서 인증 후 신뢰 헤더(`X-Authenticated-User-Id`) 주입 권장.
  * `real_ip` 신뢰 대역을 CDN/LB 공인 범위로 제한.
  * 기본 보안 헤더(`X-Content-Type-Options`, `Referrer-Policy` 등) 추가 권장.

---

## 좌석 로그 기반 FCFS의 한계(고려했던 대안 설명)

Nginx **access log** 타임스탬프 기반 순서화는 다음 이유로 **신뢰 불가**합니다.

1. 기록 지연/버퍼링: 응답 후 기록되거나 버퍼링되어 실제 도착 순서와 어긋남.
2. 멀티 워커/멀티 인스턴스: 파일 병합 시 순서 뒤섞임(클럭 스큐 포함).
3. 부분 유실: 로테이션/전송 중단/디스크 이슈.
4. 프런트 레이어 개입: CDN/LB가 앞에 있으면 실 접속자/시각 왜곡.
5. 스푸핑: `X-Forwarded-For` 변조 등.

→ 따라서 **게이트웨이에서 Redis 기반 원자 연산**으로 “참여/중복/순번”을 관리하도록 설계했습니다.

---

## 품질 보장 (테스트/타입/린트)

* **백엔드**

  * 러스트 단위/통합 테스트: `cargo test`
  * 정적 분석: `cargo clippy` (CI에서 `-D warnings` 권장)
* **프런트엔드**

  * 타입체크: TypeScript `pnpm typecheck`
  * 린트: ESLint `pnpm lint`
  * 최소 상호작용 테스트: Vitest(또는 Playwright)로 좌석 클릭/예약 플로우 스모크 테스트

---

## 요구사항 체크리스트

### 최소 요구사항

* [x] 3×3 총 9석 표시 및 상태 구분
* [x] 좌석 선택 → 예약자 정보 페이지 → 예약 확정 시도
* [x] 99% 성공 / 1% 의도적 실패 처리 및 명확한 피드백
* [x] 좌석 목록 조회/예약 API 제공(HTTP/JSON)
* [x] 테스트/타입체크/린트 수행

### 기본 요구사항 (불편 최소화)

* [x] 직관적 UI(명확한 가능/불가 구분)
* [x] 네트워크 지연 시 로딩/중복클릭 방지
* [x] 실패 시 재시도/안내동선
* [x] 모바일 접속 가독성/터치 영역 최적화
* [x] 잘못된 요청/서버 에러/정합성 고려

### 심화 요구사항

* [x] 동시성 제어: 게이트웨이 중복 차단 + DB 조건부 업데이트
* [-] 실시간 동기화: SSE/WS 준비(기본은 폴링 재조회), 클릭시 바로 확인 가능
* [x] 우선순위(소프트 홀드): Redis 기반 홀드 키(설계/부분 구현)

---

## 시연 가이드 (cURL 예시)

```bash
# 좌석 조회
curl http://localhost:5800/api/v1/seats

# FCFS 예약 시도 (게이트웨이 없이 직접 API)
curl -X POST http://localhost:5800/api/v1/seats/reservation/fcfs \
  -H 'Content-Type: application/json' \
  -H 'X-User-Id: user-123' \
  -d '{"user_name":"Alice","phone":"010-1234-5678"}'
```

---

## 한눈에 보는 결정 트레이드오프

* **간결함 vs 완전한 대기열**: Redis `INCR` + DB 조건부 업데이트로 **간결한 FCFS** 달성. 대신 복잡한 대기열(취소/재삽입/우선순위 큐)은 범위 밖.
* **게이트웨이 의존**: 중복 차단/레이트리밋은 OpenResty에 의존. 단순 배포 시에는 생략 가능하나, 대규모 트래픽에선 필수.
* **실시간성 vs 비용**: 폴링은 단순/안정, WS/SSE는 즉시성 우수하나 운영 복잡도 증가.

---

## 향후 개선(ToDo)

* [ ] 아키텍처 다이어그램(정식) 추가

---

## 부록 — 게이트웨이 Lua 개념 코드(설명용)

> 실제 코드 구조는 `openresty/` 디렉터리 참고. 아래는 흐름 이해를 위한 개념화 예시입니다.

```lua
-- access_by_lua_block
local redis = require 'resty.redis'
local r = redis:new(); r:set_timeout(500)
assert(r:connect(os.getenv('REDIS_HOST') or 'redis', 6379))

local user = ngx.var.http_x_user_id
if not user or user == '' then
  ngx.status = 400; ngx.say('{"success":false,"reason":"validation"}')
  return ngx.exit(400)
end

local ip   = ngx.var.realip_remote_addr or ngx.var.remote_addr
local ev   = ngx.var.arg_event or 'default'
local ttl  = tonumber(ngx.var.arg_ttl) or 900

-- 해시태그로 슬롯 고정 (Cluster 대비)
local k1 = ('fcfs:{%s}:user:%s'):format(ev, user)
local k2 = ('fcfs:{%s}:ip:%s'):format(ev, ip)

-- EVALSHA/EVAL (원자적 체크+셋)
local script = [[
  if (redis.call('EXISTS', KEYS[1]) == 1) or (redis.call('EXISTS', KEYS[2]) == 1) then
    return 0
  end
  redis.call('SET', KEYS[1], ARGV[1], 'EX', ARGV[3])
  redis.call('SET', KEYS[2], ARGV[2], 'EX', ARGV[3])
  return 1
]]

local ok = r:eval(script, 2, k1, k2, user, ip, ttl)
if ok == 0 then
  ngx.status = 409; ngx.say('{"success":false,"reason":"duplicate"}')
  return ngx.exit(409)
end

-- 통과 → 백엔드로 프록시
```

---

## 라이선스/크레딧

* 과제 목적의 학습/시연용. 사용한 OSS의 라이선스를 준수합니다.

---

**끝.** 이 README는 “설명 위주”로 구성되어, 요구사항-결정-한계-개선 방향까지 한 파일에서 검토할 수 있도록 작성되었습니다.


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
                -d '{"user_name":"Alice","phone":"010-1234-5678"}'
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
| Body | { "user_name": string, "phone": string } |
| Success | { "success": true, "seat": { "id": number, "status": true } } |
| Error reason | sold_out | duplicate | contention | already_reserved |

### 다음 개선 예정 (Todo)
* docker-compose에 `app`, `gateway` 서비스 추가 및 OpenResty entrypoint 수정
* 동시성 제어(낙관락 또는 분산락) 적용
* 실시간 좌석 상태(WS or SSE) 반영
* 테스트 커버리지 확장 (service + controller 통합 테스트)
* README에 아키텍처 다이어그램 추가
* 예약 응답 reason 코드 enum-like 문서화 및 클라이언트 매핑 표 추가 (apiSpec.json 동기화 자동화)

