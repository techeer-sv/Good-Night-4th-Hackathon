# FCFS 좌석 선착순 예약 API 명세

> Version: 2025-08-17
> Status: Draft (Backend 구현 완료 / 일부 글로벌 에러 래핑 및 부하/통합 테스트 추후 예정)

---

## 1. 개요

공연/이벤트 좌석을 **선착순(FCFS)** 으로 하나씩 예약하는 단일 엔드포인트 흐름을 정의한다. 서버는 _현재 비예약( status = false )_ 상태의 가장 빠른(또는 정의된 순서) 좌석을 원자적으로 집어와 호출자에게 반환한다. 중복 / 경합 상황을 제어하기 위해 **Redis + PostgreSQL 조건부 UPDATE** 조합을 사용한다.

---

## 2. 데이터 모델 (Seat)

| 필드        | 타입        | 설명                                |
| ----------- | ----------- | ----------------------------------- |
| id          | BIGINT (PK) | 좌석 식별자                         |
| status      | BOOLEAN     | 예약 여부 (false=미예약, true=예약) |
| reserved_by | TEXT NULL   | 예약자 식별자 (예: phone)           |
| phone       | TEXT NULL   | 요청자가 제공한 전화번호 (예시)     |
| created_at  | TIMESTAMP   | (옵션) 생성 일시                    |
| updated_at  | TIMESTAMP   | (옵션) 갱신 일시                    |

> 실제 컬럼/타임스탬프 명은 마이그레이션 정의에 따름.

---

## 3. 엔드포인트 요약

| 메서드 | 경로                             | 설명            | 인증       | 비고                                            |
| ------ | -------------------------------- | --------------- | ---------- | ----------------------------------------------- |
| POST   | `/api/v1/seats/reservation/fcfs` | 선착순 1석 예약 | 없음(현재) | 멱등 아님 (중복 호출 차단은 게이트웨이 + Redis) |

---

## 4. 요청(Request)

```
POST /api/v1/seats/reservation/fcfs
Content-Type: application/json

{
  "phone": "+821012345678"   // 선택적 (추후 식별/연락 목적)
}
```

(Body 비어 있는 것도 허용 가능 — 구현 시 phone 없으면 NULL)

---

## 5. 응답(Response)

### 5.1 성공 (좌석 확보)

```
200 OK
{
  "success": true,
  "seat_id": 123,
  "reserved_by": "+821012345678",
  "reason": null
}
```

### 5.2 매진 (더 이상 남은 좌석 없음)

```
200 OK
{
  "success": false,
  "seat_id": null,
  "reserved_by": null,
  "reason": "sold_out"
}
```

### 5.3 이미 동일 사용자 예약 존재 (정책에 따라)

```
200 OK
{
  "success": false,
  "seat_id": 123,              // 이미 그 사용자가 가진 좌석 ID 반환 (정책 선택)
  "reserved_by": "+821012345678",
  "reason": "already_reserved"
}
```

### 5.4 경합(Contention) — 재시도 후 실패 (희귀)

```
200 OK
{
  "success": false,
  "seat_id": null,
  "reserved_by": "+821012345678",
  "reason": "contention"
}
```

> 서버 내부에서는 최대 N회(예: 5) 재시도 후에도 좌석을 획득하지 못한 경우 반환.

### 5.5 (향후) 표준 에러 포맷 예시 (아직 전면 적용 전)

```
4xx/5xx
{
  "error": {
    "code": "internal_error", // 또는 validation_failed 등
    "message": "...",
    "trace_id": "...",
    "meta": { }
  }
}
```

---

## 6. Reason Codes

| Code             | 상황                                  | 클라이언트 처리 권장            |
| ---------------- | ------------------------------------- | ------------------------------- |
| sold_out         | 남은 좌석 없음                        | 판매 종료 UI / 재입고 알림 옵션 |
| already_reserved | 동일 식별자(전화 등)가 이미 좌석 보유 | 기존 예약 정보 표시 / 중복 안내 |
| contention       | 극심한 경합으로 내부 재시도 한계 도달 | 즉시 재시도 버튼 or 대기열 전환 |

---

## 7. 시퀀스 (Mermaid)

```mermaid
sequenceDiagram
  participant C as Client
  participant G as Gateway(OpenResty)
  participant A as App(Server)
  participant R as Redis
  participant DB as Postgres

  C->>G: POST /api/v1/seats/reservation/fcfs
  G->>R: (옵션) 중복요청 Key 검사
  alt 최초 요청
    G->>A: 전달
    A->>R: INCR seat_sequence (읽기/진행 지표)
    loop (최대 N회)
      A->>DB: UPDATE seats SET status=true,... WHERE status=false ORDER BY id LIMIT 1 RETURNING id
      alt 행 반환됨
        DB-->>A: seat row
        A-->>C: 200 {success:true, seat_id}
        break
      else 경합 (0행)
        DB-->>A: 0 rows
        A->>R: (선택) contention metric INCR
      end
    end
    alt 실패 (N회 모두 실패)
      A-->>C: 200 {success:false, reason:contention}
    end
  else 중복 요청
    G-->>C: 409/429 (정책) or 캐시된 응답
  end
```

---

## 8. 동시성 & 원자성

1. **DB 조건부 UPDATE**: `WHERE status=false` + `RETURNING` 으로 단일 트랜잭션 내 원자 예약.
2. **Redis INCR**: 단순 카운터(모니터링/확률적 혼잡 파악) — 예약 완결성 의존 X.
3. **재시도 루프**: 경합 발생 시 소량 짧은 재시도 (백오프 가능).
4. **게이트웨이 중복 차단**: 동일 클라이언트 단시간 다중 POST 방지 (OpenResty Lua)

---

## 9. Redis 키 전략 (예시)

| Key                     | 타입       | 목적                                  |
| ----------------------- | ---------- | ------------------------------------- |
| `fcfs:seat:sequence`    | integer    | 전체 시도/진행 인덱스 측정 (모니터링) |
| `dup:req:{fingerprint}` | string+TTL | 짧은 창(window) 내 동일 요청 차단     |

> 실제 코드에서는 `config_redis` crate 내부 `CLIENT` 재사용; 키 네이밍 상수화 추후.

---

## 10. 성능 / 확장 고려

| 항목        | 현재                       | 개선 아이디어                            |
| ----------- | -------------------------- | ---------------------------------------- |
| DB Row Lock | 조건부 UPDATE 첫 매칭 행만 | 파티션/샤딩 또는 SKIP LOCKED (필요 시)   |
| 경합 완화   | 짧은 재시도                | Exponential backoff + jitter             |
| 모니터링    | 로그 & 시퀀스 카운터       | Prometheus exporter / RED metrics        |
| 캐싱        | 없음                       | "sold_out" 상태 캐시 후 TTL invalidation |
| 대기열      | 미구현                     | Redis Stream / Kafka 기반 Queue          |

---

## 11. 테스트 시나리오 제안

| 시나리오                      | 기대결과                                         |
| ----------------------------- | ------------------------------------------------ |
| 단일 성공                     | success:true, seat_id != null                    |
| 연속 호출(잔여 충분)          | seat_id 증가 또는 순서 일관성 (정책에 맞게)      |
| 동시 100명 (좌석 50개)        | 마지막 50명 sold_out or contention (경합률 로그) |
| 이미 예약된 사용자 재호출     | already_reserved 반환                            |
| 좌석 0개 초기화 후 호출       | sold_out 반환                                    |
| 강제 경합 (인위적 sleep 삽입) | contention 케이스 드러남                         |

---

## 12. 프런트엔드 처리 패턴

Pseudo:

```ts
async function reserveOnce(phone?: string) {
  const res = await fetch('/api/v1/seats/reservation/fcfs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone }),
  });
  const data = await res.json();
  if (data.success) return { state: 'SUCCESS', seatId: data.seat_id };
  switch (data.reason) {
    case 'sold_out':
      return { state: 'ENDED' };
    case 'already_reserved':
      return { state: 'EXISTING', seatId: data.seat_id };
    case 'contention':
      return { state: 'RETRYABLE' };
    default:
      return { state: 'UNKNOWN' };
  }
}
```

---

## 13. 보안 & 검증

- Rate Limiting (게이트웨이 계층) — IP/Device 기반
- Phone 형식 검증 (E.164) 추후 도입
- Abuse 탐지: 초과 실패(contention) 비율 경보

---

## 14. 향후 개선 로드맵

| 항목                    | 우선순위 | 설명                                                  |
| ----------------------- | -------- | ----------------------------------------------------- |
| 표준 에러 Envelope      | High     | 모든 엔드포인트 응답 통일                             |
| Load / Soak Test Suite  | High     | k6 or Locust 기반 성능 수치화                         |
| Metrics Exporter        | Med      | Prometheus counter/gauge (성공, sold_out, contention) |
| Duplicate Filter 강화   | Med      | 사용자 Fingerprint 전략 개선                          |
| Queue 기반 대기열 모드  | Low      | 트래픽 폭주 완화                                      |
| WebSocket/SSE Broadcast | Low      | 실시간 남은 좌석 갱신                                 |

---

## 15. 요약 (한국어)

원자적 DB 조건부 UPDATE + Redis 모니터링 카운터로 경합 환경에서도 일관된 1석 할당을 보장한다. Reason code 3종으로 클라이언트 UI 분기 단순화.

## 16. English Quick Summary

Atomic single-seat allocation via conditional UPDATE (status=false) with retry loop. Redis used for a monotonic sequence (observability) and optional duplicate suppression at gateway. Reason codes: sold_out, already_reserved, contention. Future work: standardized error envelope, load testing, metrics, queue-based fallback.

---

_Document generated on 2025-08-17._
