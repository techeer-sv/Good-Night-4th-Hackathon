# 공연 좌석 예매 시스템 풀스택 구현

## 프로젝트 개요
본 프로젝트는 공연 좌석 예매 시스템을 구현하여 사용자가 좌석을 예약하고 관리할 수 있는 웹 애플리케이션입니다. 프론트엔드와 백엔드가 분리된 구조로, 프론트엔드는 React와 Vite를 사용하여 개발하였으며, 백엔드는 Spring Boot와 JPA를 사용하여 RESTful API를 제공합니다. 데이터베이스는 mysql을 사용하였으며, Docker Compose를 통해 개발 환경을 통합하여 배포 및 테스트를 용이하게 하였습니다.

## UI
### 메인화면
<img width="3430" height="1780" alt="image" src="https://github.com/user-attachments/assets/c4dd5ed5-6979-4c62-a1b3-31676ec61fae" />

### 공연시간 선택
<img width="3422" height="1764" alt="image" src="https://github.com/user-attachments/assets/7efd54be-4218-4b36-8a5e-2759dfb83965" />

### 좌석 선택
<img width="3430" height="1786" alt="image" src="https://github.com/user-attachments/assets/6f6c2b96-826f-4e5f-9d3c-cbb4a3a6cee9" />

### 예약 정보 입력
<img width="3422" height="1782" alt="image" src="https://github.com/user-attachments/assets/1fb02064-590b-44df-9533-0b01eb22665a" />

### 예약 내역
<img width="3434" height="1778" alt="image" src="https://github.com/user-attachments/assets/93628ff2-6c81-40c0-9bcc-c1aeb497d479" />


## API 문서
<img width="2602" height="1310" alt="image" src="https://github.com/user-attachments/assets/70c086e4-b731-4333-80c4-dc685967b7c6" />

## erd
<img width="361" height="696" alt="image" src="https://github.com/user-attachments/assets/7de05127-3e75-4064-8e09-de60f6d5fcd8" />
<br><br>

## 구현한 요구사항 체크리스트

-   [ ] **최소 요구사항**
    -   [x] 좌석 현황 표시 (3x3 격자)
    -   [x] 좌석 예약 기능 (성공/실패 피드백 포함)
    -   [x] API 엔드포인트 (좌석 목록 조회, 좌석 예약)
    -   [ ] 코드 품질 보장 (단위/통합 테스트, 타입 체크, 린팅)
-   [ ] **기본 요구사항**
    -   [ ] 사용자 경험 개선 (직관적 UI, 알림 시스템, 접근성, 반응형)
    -   [ ] 안정적인 서비스 운영 (예외 처리, 데이터 정합성)
-   [ ] **심화 요구사항**
    -   [x] 동시성 제어 (Redis의 원자적 연산(INCR)과 DB CAS(Compare-And-Swap) 알고리즘)
    -   [ ] 실시간 좌석 상태 동기화
    -   [ ] 선택한 좌석에 대한 우선순위 제공
       
<br>

## 동시성 제어 전략
### 1. 단순히 JPA와 트랜잭션만을 사용
`NaiveReservationService` 주입 시 1000개의 스레드가 동시에 예약을 요청했을 때 레이스 컨디션 발생 <br>
테스트 코드로 돌려본 결과 여러 개의 예약이 DB에 저장되는 결과 발생 <br>
<img width="246" height="102" alt="image" src="https://github.com/user-attachments/assets/6fe995bf-6ec0-4edd-9135-32793a668bc1" />
<br><br>

### 2. 이를 해결하기 위해 Redis의 원자적 연산을 도입
`RedisReservationService` 주입 <br>
Redis는 단일 스레드 기반으로 동작하므로, `INCR` 명령어를 사용하면 여러 클라이언트가 동시에 요청하더라도 원자적으로 증가 연산을 보장함

- 좌석별 Key를 생성 → `INCR` 실행
- 값이 `1`인 경우에만 예약 로직을 진행
- 값이 `2` 이상이면 이미 누군가 선점한 상태이므로 즉시 실패 처리

이 방식으로는 **동시에 들어오는 요청 중 최초 1개만 통과**하게 되어 DB 부하를 줄이고, 대부분의 동시성 문제를 사전에 걸러낼 수 있었음
<br><br>

### 3. Redis INCR만 사용했을 때의 한계
1. **Redis와 DB 상태 불일치**
    - Redis에서 `1`이 나와 선점에 성공했지만, DB 저장 과정에서 예외가 발생하면?
    - 좌석은 여전히 `AVAILABLE`인데, Redis 키는 이미 점유 상태로 남아버림.
2. **Redis 장애 시 최종 보장 어려움**
    - Redis가 네트워크 분리나 장애가 나면 DB만으로는 중복 예약이 생길 수 있음

즉, Redis는 **앞단에서 진입을 제어하는 게이트 역할**은 훌륭했지만, **최종 무결성 보장**까지는 부족함
<br><br>

### 4. CAS(Compare-And-Swap) 방식 도입
`CasReservationService` 주입 <br>
**DB 레벨에서의 최종 무결성 보장**을 추가적으로 도입함 <br>

**락-프리 알고리즘의 일종으로, 변수의 값을 비교한 후 예상하는 값이면 새로운 값으로 교체하는 원자적 연산을 수행** <br>
>  CAS 알고리즘은 멀티스레드 환경에서 락 없이도 동시성 문제를 해결하는 데 사용된다.

#### 왜 동시성 제어가 되는가?

- 원자성 보장
DB의 조건부 UPDATE는 “조건이 만족할 때만 갱신”을 보장하기 때문에, 두 개 이상의 스레드가 동시에 같은 좌석을 예매하더라도 최초 1개의 트랜잭션만 성공함
- 락을 잡지 않음
전통적인 DB 락(SELECT ... FOR UPDATE)처럼 테이블에 락을 걸지 않으므로, 다른 스레드나 트랜잭션을 기다리게 하지 않고 성능 저하 없이 안전하게 동시성 제어가 가능함
<br>

### 5. Redis + CAS 결합 효과
`RedisCasReservationService` 주입 <br>
- **Redis(INCR)** : 다수의 요청이 한꺼번에 몰려도 최초 1명만 선점할 수 있도록 게이트 역할 수행 → DB 부하를 획기적으로 줄임
- **CAS(DB 조건부 업데이트)** : Redis 단계에서 놓친 예외 상황까지 보완하여 최종적으로 단 1명만 성공하도록 보장

<br><br><br>

## 프로젝트 실행 방법
1. **Docker 설치**: 시스템에 Docker가 설치되어 있어야 합니다.
2.  **레포지토리 클론**:
    ```bash
    git clone <your-fork-url>
    cd Good-Night-4th-Hackathon
    ```
3.  **Docker Compose 실행**:
    ```bash
    docker-compose up --build
    ```
4.  **애플리케이션 접속**:
    -   웹 브라우저를 열고 `http://localhost:5173` 으로 접속합니다.
    -   백엔드 API는 `http://localhost:8080/swagger-ui/index.html` 에서 직접 접근할 수 있습니다.

## 테스트 실행 방법

### 백엔드 테스트
```bash
cd backend
./gradlew test
```
