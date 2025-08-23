openapi: 3.1.0
info:
  title: Tickettock 공연 예약 시스템 API (Gateway + Backend)
  version: 1.0.0
  description: |
    - 기본 베이스 URL: `http://localhost:8080`
    - **흐름**: `/fcfs/join`(게이트웨이에서 FCFS 시퀀스 발급) → `/api/v1/seats/reservation/fcfs`(백엔드에서 좌석 배정)
    - **중요 헤더**
      - `X-User-Id` (필수: 조인/예약 모두)
      - `X-Fcfs-Seq` (필수: 예약 시)
      - `X-Admin-Token` (필수: 관리자 리셋)
    - **주의**
      - 예약 호출은 **빈 바디(무내용)** 전송을 권장합니다. JSON 바디를 보낼 경우에만 `Content-Type: application/json`을 사용하세요.
      - 브라우저에서 시퀀스 헤더를 읽으려면 CORS에서 `Access-Control-Expose-Headers: X-Fcfs-Seq`가 설정되어 있어야 합니다.
servers:
  - url: http://localhost:8080
tags:
  - name: fcfs
    description: 게이트웨이 선착순(FCFS) 조인
  - name: seats
    description: 좌석 조회/배정/상태 변경
  - name: admin
    description: 관리자 기능

components:
  parameters:
    XUserId:
      name: X-User-Id
      in: header
      required: true
      description: 클라이언트 식별자(선착순/예약 흐름 전반)
      schema: { type: string, minLength: 1 }
    XFcfsSeq:
      name: X-Fcfs-Seq
      in: header
      required: true
      description: 게이트웨이가 발급한 FCFS 시퀀스(`/fcfs/join` 응답 헤더)
      schema: { type: string, pattern: '^\d+$' }
    XAdminToken:
      name: X-Admin-Token
      in: header
      required: true
      description: 관리자 리셋 토큰(환경변수 `ADMIN_RESET_TOKEN`와 일치)
      schema: { type: string, minLength: 1 }

  headers:
    XFcfsSeqHeader:
      description: 게이트웨이가 발급한 FCFS 시퀀스 값
      schema: { type: string, pattern: '^\d+$' }

  schemas:
    StatusError:
      type: object
      required: [code, name, brief, detail]
      properties:
        code: { type: integer, format: uint16, minimum: 0 }
        name: { type: string }
        brief: { type: string }
        detail: { type: string }
        cause: { type: string, nullable: true }

    PublicSeatInfo:
      type: object
      description: |
        공개 좌석 정보(개인정보 제외). 좌석 목록 조회 시 사용.
      required: [id, status]
      properties:
        id:
          type: integer
          format: int32
          description: 좌석 고유 ID
        status:
          type: boolean
          description: true=예약됨, false=사용가능

    SeatModel:
      type: object
      required: [status]
      properties:
        status: { type: boolean }
        reserved_by: { type: string, nullable: true }
        phone: { type: string, nullable: true }

    SeatUpdatePayload:
      type: object
      description: |
        좌석 상태 업데이트 요청(관리/테스트 용도).
      required: [status]
      properties:
        status:
          type: boolean
          description: true=예약됨, false=사용가능

    ReservationResponse:
      type: object
      required: [success]
      properties:
        success: { type: boolean }
        reason:  { type: string, nullable: true }
        seat:
          oneOf:
            - { type: 'null' }
            - { $ref: '#/components/schemas/PublicSeatInfo' }
        remainingSeats:
          type: integer
          format: int64
          nullable: true
          description: 남은 미예약 좌석 수(참고용)
        sequence:
          type: integer
          format: int64
          nullable: true
          description: 게이트웨이 할당 FCFS 시퀀스(헤더와 동일)
        userTtlRemaining:
          type: integer
          format: int64
          nullable: true
          description: 사용자 키 TTL 잔여(초)

    ResetResponse:
      type: object
      description: 관리자 리셋 결과
      required: [seatCount, sequence]
      properties:
        seatCount: { type: integer, format: int32 }
        sequence:  { type: integer, format: int64 }

paths:
  /health:
    get:
      tags: [fcfs]
      summary: 게이트웨이 헬스 체크
      responses:
        '200':
          description: ok
          content:
            text/plain:
              schema: { type: string, example: "ok\n" }

  /healthz:
    get:
      tags: [fcfs]
      summary: 게이트웨이 헬스 체크(z)
      responses:
        '200':
          description: ok
          content:
            text/plain:
              schema: { type: string, example: "ok\n" }

  /fcfs/join:
    post:
      tags: [fcfs]
      summary: FCFS 조인(게이트웨이에서 시퀀스 발급)
      description: |
        - Redis 전역 시퀀스를 증가시켜 FCFS 순번을 발급합니다.
        - **헤더**: `X-User-Id` 필수
        - **응답 헤더**: `X-Fcfs-Seq` 포함(브라우저에서 읽으려면 CORS Expose 필요)
        - **레이트리밋**: IP 기준 5r/s (burst 30)
      parameters:
        - $ref: '#/components/parameters/XUserId'
      requestBody:
        description: 선택 JSON(예: 사용자 이름/전화). 서버는 내용 없이도 처리 가능.
        required: false
        content:
          application/json:
            schema:
              type: object
              additionalProperties: true
            examples:
              minimal:
                value: { }
              withUserInfo:
                value: { "user_name": "kim", "phone": "010-0000-0000" }
      responses:
        '200':
          description: 시퀀스 발급 성공
          headers:
            X-Fcfs-Seq:
              $ref: '#/components/headers/XFcfsSeqHeader'
          content:
            application/json:
              schema:
                type: object
                required: [success, sequence]
                properties:
                  success: { type: boolean, enum: [true] }
                  sequence: { type: integer, format: int64 }
                  userTtlRemaining: { type: integer, format: int64 }
              examples:
                ok:
                  value: { success: true, sequence: 12, userTtlRemaining: 600 }
        '409':
          description: 이미 조인/예약된 사용자
          content:
            application/json:
              schema:
                type: object
                required: [success, reason]
                properties:
                  success: { type: boolean, enum: [false] }
                  reason:  { type: string, enum: [already_reserved] }
              examples:
                dup:
                  value: { success: false, reason: "already_reserved" }
        '400':
          description: 사용자 헤더 누락 등 요청 오류
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/StatusError'
        '5XX':
          description: 게이트웨이/Redis 오류
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/StatusError'

  /api/v1/seats:
    get:
      tags: [seats]
      summary: 좌석 목록 조회
      responses:
        '200':
          description: 좌석 목록
          content:
            application/json:
              schema:
                type: array
                items: { $ref: '#/components/schemas/PublicSeatInfo' }
        '4XX':
          description: 클라이언트 오류
          content:
            application/json:
              schema: { $ref: '#/components/schemas/StatusError' }
        '5XX':
          description: 서버 오류
          content:
            application/json:
              schema: { $ref: '#/components/schemas/StatusError' }

  /api/v1/seats/{id}:
    get:
      tags: [seats]
      summary: 좌석 상세 조회
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: integer, format: int32 }
      responses:
        '200':
          description: 좌석 정보
          content:
            application/json:
              schema: { $ref: '#/components/schemas/SeatModel' }
        '404':
          description: 미존재 좌석
          content:
            application/json:
              schema: { $ref: '#/components/schemas/StatusError' }
    put:
      tags: [seats]
      summary: 좌석 상태 직접 변경
      description: 테스트/관리 목적. 일반 사용자 시나리오에서는 사용하지 않습니다.
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: integer, format: int32 }
      requestBody:
        required: true
        content:
          application/json:
            schema: { $ref: '#/components/schemas/SeatUpdatePayload' }
            examples:
              reserve: { value: { status: true } }
              release: { value: { status: false } }
      responses:
        '200':
          description: 변경된 좌석 모델
          content:
            application/json:
              schema: { $ref: '#/components/schemas/SeatModel' }
        '4XX':
          description: 요청 오류
          content:
            application/json:
              schema: { $ref: '#/components/schemas/StatusError' }

  /api/v1/seats/reservation/fcfs:
    post:
      tags: [seats]
      summary: FCFS 좌석 예약 확정(백엔드)
      description: |
        - **헤더 필수**: `X-User-Id`, `X-Fcfs-Seq`
        - **요청 바디**: 기본은 **빈 바디** 권장. JSON 바디를 보낼 경우에만 `Content-Type: application/json` 사용.
      parameters:
        - $ref: '#/components/parameters/XUserId'
        - $ref: '#/components/parameters/XFcfsSeq'
      requestBody:
        required: false
        content:
          application/json:
            schema:
              type: object
              additionalProperties: true
            examples:
              emptyObject:
                summary: (권장 아님) 빈 JSON 객체
                value: {}
      responses:
        '200':
          description: 예약 성공
          content:
            application/json:
              schema: { $ref: '#/components/schemas/ReservationResponse' }
              examples:
                ok:
                  value:
                    success: true
                    seat: { id: 17, status: true }
                    remainingSeats: 83
                    sequence: 12
        '409':
          description: 중복/경합으로 예약 불가
          content:
            application/json:
              schema: { $ref: '#/components/schemas/ReservationResponse' }
              examples:
                dup:
                  value:
                    success: false
                    reason: "already_reserved"
                    remainingSeats: 82
        '400':
          description: 잘못된 요청(헤더 누락, 잘못된 Content-Type/바디 등)
          content:
            application/json:
              schema: { $ref: '#/components/schemas/StatusError' }
        '5XX':
          description: 서버 오류
          content:
            application/json:
              schema: { $ref: '#/components/schemas/StatusError' }

  /api/v1/seats/reset:
    post:
      tags: [admin]
      summary: 좌석/시퀀스 초기화(관리자)
      description: |
        - 모든 좌석을 비우고 재생성, Redis FCFS 시퀀스를 0으로 초기화
        - **헤더 필수**: `X-Admin-Token`
      parameters:
        - $ref: '#/components/parameters/XAdminToken'
      responses:
        '200':
          description: 리셋 성공
          content:
            application/json:
              schema: { $ref: '#/components/schemas/ResetResponse' }
              examples:
                ok:
                  value: { seatCount: 100, sequence: 0 }
        '401':
          description: 토큰 불일치/권한 없음
          content:
            application/json:
              schema: { $ref: '#/components/schemas/StatusError' }
        '5XX':
          description: 서버 오류
          content:
            application/json:
              schema: { $ref: '#/components/schemas/StatusError' }