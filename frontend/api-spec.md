# Tickettock Seat Reservation API Spec

버전: 1.1.2 (Gateway 포트/경로 정정)

## 1. Overview
- 좌석 목록/단건 조회  
- FCFS(선착순) 예약  
- Gateway(OpenResty)에서 **중복 차단 & 시퀀스 할당** → Salvo 백엔드가 **좌석 DB 원자적 예약** 수행

## 2. Base URL (via Gateway)
```http
http://localhost:8080
```

## 3. Global JSON Envelope
| 구분 | 형태 |
|---|---|
| 성공 | `{ "success": true, ... }` |
| 실패 | `{ "success": false, "reason": <code>, "message"?: <string> }` |

### 공통 Reason 코드
`sold_out`, `duplicate`, `contention`, `already_reserved`,  
`validation`, `internal_error`, `service_unavailable`,  
`redis_error`, `missing_user`, `sequence_unavailable`,  
`not_found`

## 4. Endpoints

### 4.1 GET `/api/v1/seats`
모든 좌석 목록 조회  
- **200 OK**
```json
{ "success": true, "seats": [ { "id": 1, "status": true }, { "id": 2, "status": false } ] }
```

### 4.2 GET `/api/v1/seats/{id}`
단일 좌석 조회  
- **200 OK**
```json
{ "success": true, "seat": { "id": 3, "status": true } }
```
- **404 Not Found**
```json
{ "success": false, "reason": "not_found" }
```

### 4.3 POST `/fcfs/join`
글로벌 FCFS 좌석 예약 (※ `/api/v1/seats/reservation/fcfs` **없음**)  

#### Headers
| Name | Required | Description |
|---|---|---|
| `X-User-Id` (= `FCFS_USER_HEADER`) | Yes | 사용자 식별(중복/순서) |
| `X-Fcfs-Seq` | Gateway → Backend | Gateway가 Redis `INCR`로 채움 |

#### Request Body
```json
{ "user_name": "Alice", "phone": "010-1234-5678" }
```

#### Success (200)
```json
{
  "success": true,
  "seat": { "id": 5, "status": true },
  "remainingSeats": 3,
  "userTtlRemaining": 870,
  "sequence": 42
}
```

#### 주요 실패
| HTTP | reason | 의미 |
|---|---|---|
| 409 | sold_out | 남은 좌석 없음 |
| 409 | duplicate | TTL 내 동일 사용자/IP 재시도 |
| 409 | contention | 좌석 경합 재시도 한계 / 충돌 |
| 409 | already_reserved | 동일 사용자 이전 성공 기록(멱등) |
| 400 | validation | 본문 파싱/필수값 오류 |
| 400 | missing_user | 헤더 미존재 |
| 503 | service_unavailable | Gateway Redis 연결 실패 |
| 503 | redis_error | Gateway Lua Redis 실행 오류 |
| 503 | sequence_unavailable | 시퀀스 `INCR` 실패 |
| 500 | internal_error | 백엔드 내부 예외 |

## 5. Response Schemas (TypeScript)
```ts
interface Seat { id: number; status: boolean }

interface SeatsListResponse { success: true; seats: Seat[] }
interface SeatDetailResponse { success: true; seat: Seat }

type Reason =
  | 'sold_out' | 'duplicate' | 'contention' | 'already_reserved'
  | 'validation' | 'internal_error' | 'service_unavailable'
  | 'redis_error' | 'missing_user' | 'sequence_unavailable'
  | 'not_found'

interface FcfsSuccessResponse {
  success: true;
  seat: Seat;
  remainingSeats?: number;
  userTtlRemaining?: number;
  sequence: number; // Gateway 할당
}
interface ErrorResponse { success: false; reason: Reason; message?: string }
```

## 6. Gateway Behavior
| 기능 | 설명 | 구현 |
|---|---|---|
| 중복 방지 | SHA Lua 스크립트(user+ip key) | 완료 |
| 시퀀스 할당 | `INCR fcfs:seq` → `X-Fcfs-Seq` 헤더 | 완료 |
| 에러 표준화 | 모든 실패 `{success:false,reason}` | 완료 |
| 래핑 옵션 | `?wrap=1` → gatewayWrapped JSON | 덤프용 |

## 7. Environment Variables
| Env | 용도 | 기본 | 참고 |
|---|---|---|---|
| FCFS_USER_HEADER | 사용자 헤더명 | `X-User-Id` | Gateway/Backend 공유 |
| FCFS_USER_TTL | 사용자 중복 TTL(sec) | 900 | 0=만료없음 |
| REDIS_HOST / REDIS_PORT | Redis 주소 | `redis` / `6379` | docker-compose 기준 |
| REDIS_PASSWORD | Redis 비밀번호 | `redis_pass` | 필요시 변경 |
| APP_PORT | 백엔드 포트 | `5800` | Backend 내부 |
| GATEWAY_EXTERNAL_PORT | Gateway 외부 포트 | `8080` | **Base URL과 연동** |
| RUST_LOG | 로그 레벨 | `info` | `debug` 상세 |

## 8. Error Semantics & Retry
| reason | 재시도 전략 | 비고 |
|---|---|---|
| duplicate | TTL 후 재시도 | 사용자/IP key 만료 필요 |
| contention | 즉시 또는 백오프 | 좌석 경합 상황 |
| sold_out | 불필요 | 재고 0 |
| already_reserved | 불필요 | 멱등 성공 |
| validation | 수정 후 재시도 | 입력 검증 |
| missing_user | 헤더 추가 후 재시도 | 클라이언트 오류 |
| service_unavailable | 백오프 후 재시도 | 인프라 장애 |
| redis_error | 백오프 후 재시도 | Gateway Redis Lua 실패 |
| sequence_unavailable | 짧은 백오프 재시도 | INCR 실패 |
| internal_error | 모니터링 후 조건부 재시도 | 서버 오류 |

## 9. cURL Examples
```bash
# 좌석 목록 조회 (via Gateway 8080)
curl -s http://localhost:8080/api/v1/seats

# 단일 좌석 조회
curl -s http://localhost:8080/api/v1/seats/1

# FCFS 예약
curl -s -X POST http://localhost:8080/fcfs/join \
  -H 'X-User-Id: user-123' \
  -H 'Content-Type: application/json' \
  -d '{"user_name":"Alice","phone":"010-1234-5678"}'
```

