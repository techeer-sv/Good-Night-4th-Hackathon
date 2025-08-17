## Tickettock Seat Reservation API Spec

버전: 1.1.0 (Gateway 시퀀스/에러 표준화 반영)

### 1. Overview
좌석 목록/단건 조회와 FCFS(선착순) 예약. Gateway(OpenResty)에서 중복 차단 & 시퀀스 할당 후 Salvo 백엔드가 좌석 DB에 원자적 예약 수행.

### 2. Base URL
```
http://localhost:5800
```

### 3. Global JSON Envelope
| 구분 | 형태 |
|------|------|
| 성공 | `{ "success": true, ... }` |
| 실패 | `{ "success": false, "reason": <code>, "message"?: <string> }` |

공통 Reason 코드 집합: `sold_out`, `duplicate`, `contention`, `already_reserved`, `validation`, `internal_error`, `service_unavailable`, `redis_error`, `missing_user`, `sequence_unavailable`

### 4. Endpoints

#### 4.1 GET /api/v1/seats
모든 좌석 목록.
200 예:
```jsonc
{ "success": true, "seats": [ { "id": 1, "status": true }, { "id": 2, "status": false } ] }
```

#### 4.2 GET /api/v1/seats/{id}
단일 좌석.
- 200: `{ "success": true, "seat": { "id": 3, "status": true } }`
- 404: `{ "success": false, "reason": "not_found" }` (추가 코드, OpenAPI 변환 시 포함 예정)

#### 4.3 POST /api/v1/seats/reservation/fcfs
FCFS 글로벌 좌석 예약.

Headers:
| Name | Required | Description |
|------|----------|-------------|
| `X-User-Id` (=`FCFS_USER_HEADER`) | Yes | 사용자 식별 (중복/순서) |
| `X-Fcfs-Seq` | Gateway -> Backend | Gateway가 Redis INCR로 채움 |

Request Body:
```jsonc
{ "userName": "Alice", "phone": "010-1234-5678" }
```

성공 200:
```jsonc
{ "success": true, "seat": { "id": 5, "status": true }, "remainingSeats": 3, "userTtlRemaining": 870, "sequence": 42 }
```

주요 실패 (예):
| HTTP | reason | 의미 |
|------|--------|------|
| 409 | sold_out | 남은 좌석 없음 |
| 409 | duplicate | TTL 내 동일 사용자/IP 재시도 |
| 409 | contention | 좌석 경합 재시도 한계 / 이미 예약된 좌석 충돌 |
| 409 | already_reserved | 동일 사용자 이전 성공 기록 (멱등) |
| 400 | validation | 본문 파싱/필수값 오류 |
| 400 | missing_user | 헤더 미존재 (Gateway) |
| 503 | service_unavailable | Gateway Redis 연결 실패 |
| 503 | redis_error | Gateway Lua Redis 실행 오류 |
| 503 | sequence_unavailable | 시퀀스 INCR 실패 |
| 500 | internal_error | 백엔드 내부 예외 |

### 5. Response Schemas (TypeScript)
```ts
interface Seat { id: number; status: boolean }

interface SeatsListResponse { success: true; seats: Seat[] }
interface SeatDetailResponse { success: true; seat: Seat }

type Reason =
  | 'sold_out' | 'duplicate' | 'contention' | 'already_reserved'
  | 'validation' | 'internal_error' | 'service_unavailable'
  | 'redis_error' | 'missing_user' | 'sequence_unavailable' | 'not_found'

interface FcfsSuccessResponse {
  success: true;
  seat: Seat;
  remainingSeats?: number;
  userTtlRemaining?: number;
  sequence: number; // Gateway 할당
}
interface ErrorResponse { success: false; reason: Reason; message?: string }
```

### 6. Gateway Behavior
| 기능 | 설명 | 구현 |
|------|------|------|
| 중복 방지 | SHA Lua 스크립트 (user+ip key) | 완료 |
| 시퀀스 할당 | `INCR fcfs:seq` → `X-Fcfs-Seq` 헤더 | 완료 |
| 에러 표준화 | 모든 실패 `{success:false,reason}` | 완료 |
| 래핑 옵션 | `?wrap=1` → gatewayWrapped JSON | 덤프용 |

### 7. Environment Variables
| Env | 용도 | 기본 | 참고 |
|-----|------|------|-----|
| FCFS_USER_HEADER | 사용자 헤더명 | X-User-Id | Gateway/Backend 공유 |
| FCFS_USER_TTL | 사용자 중복 TTL(sec) | 900 | 0=무제한(만료없음) |
| REDIS_HOST / REDIS_PORT | Redis 주소 | redis / 6379 | docker-compose 기준 |
| REDIS_PASSWORD | Redis 비밀번호 | redis_pass | 필요시 변경 |
| APP_PORT | 백엔드 포트 | 5800 | Base URL |
| RUST_LOG | 로그 레벨 | info | debug 상세 |

### 8. Error Semantics & Retry
| reason | 재시도 전략 | 비고 |
|--------|-------------|------|
| duplicate | TTL 후 재시도 | 사용자/IP key 만료 필요 |
| contention | 즉시 또는 백오프 | 좌석 경합 상황 |
| sold_out | 재시도 불필요 | 재고 0 |
| already_reserved | 불필요 | 멱등 성공 |
| validation | 수정 후 재시도 | 입력 검증 |
| missing_user | 헤더 추가 후 재시도 | 클라이언트 오류 |
| service_unavailable | 백오프 후 재시도 | 인프라 장애 |
| redis_error | 백오프 후 재시도 | Gateway Redis Lua 실패 |
| sequence_unavailable | 짧은 백오프 재시도 | INCR 실패 케이스 |
| internal_error | 모니터링 후 조건부 재시도 | 서버 오류 |

### 9. cURL Examples
```bash
# 목록
curl -s http://localhost:5800/api/v1/seats

# FCFS 예약
curl -s -X POST http://localhost:5800/fcfs/join \
  -H 'X-User-Id: user-123' \
  -H 'Content-Type: application/json' \
  -d '{"userName":"Alice","phone":"010-1234-5678"}'
```

### 10. OpenAPI Migration Plan
| 단계 | 내용 | 산출물 |
|------|------|--------|
| 1 | Markdown 명세 표준화 | (현재) |
| 2 | 스크립트 → openapi.yaml 변환 | openapi/tickettock.yaml |
| 3 | CI diff 검사 | GitHub Action |
| 4 | SDK 타입 생성 | generated/types.ts |
| 5 | 문서 호스팅 | ReDoc/Swagger UI |

### 11. Changelog
| 버전 | 변경 |
|------|------|
| 1.1.0 | Gateway 시퀀스/에러 reason 통합, reason 목록 확장, 응답 Envelope 표준화 |
| 1.0.0 | 초기 초안 |

---
이 문서는 OpenAPI 자동 생성 이전의 단일 소스입니다.
