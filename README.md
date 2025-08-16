# 🎬 공연 좌석 예매 시스템 — Good-Night-4th-Hackathon

**풀스택(Backend: Django REST, Frontend: React+Vite+TS, DB: SQLite)** 좌석 예매 데모입니다.  
3×3 좌석표, 예약/조회, 실패/지연 UX까지 갖춘 구현을 목표로 했습니다.

---

## 📦 프로젝트 구조

```
Good-Night-4th-Hackathon/
├─ Backend/              # Django + DRF
│  ├─ app/               # settings/urls
│  └─ seats/             # 좌석/예약 app (models, views, serializers, tests)
└─ Frontend/             # Vite + React + TypeScript
    └─ src/
        ├─ pages/          # SeatsPage, ReservePage, LookupPage
        ├─ api.ts          # API 유틸
        ├─ types.ts        # 타입 정의
        └─ index.css       # 전역 스타일
```

---

<br>

## 🚀 실행 방법

### 1) 백엔드 (Django + DRF)

```bash
cd Backend
python -m venv .venv
# macOS/Linux
source .venv/bin/activate
# Windows (PowerShell)
# .venv\Scripts\Activate.ps1

pip install -r requirements.txt
python manage.py migrate

# 좌석 초기 시드(3×3) — 필요 시
python manage.py seed_seats
# 전체 초기화(리셋)까지 원한다면
# python manage.py seed_seats --reset true

# 서버 실행
python manage.py runserver
# => http://localhost:8000
```

### 2) 프론트엔드 (Vite + React + TS)
```bash
cd Frontend
npm install

# 환경변수
echo "VITE_API_BASE_URL=http://localhost:8000" > .env

npm run dev
# => http://localhost:5173
```

<br>

## 🛠 기술 스택 & 선택 이유
- Django + Django REST Framework
    - 빠르게 API 작성(시리얼라이저/뷰/라우팅) 가능
	- ORM으로 간결한 모델/마이그레이션
- React + Vite + TypeScript
    - Vite로 쉬운 개발 서버/번들링
	- TS로 컴파일 단계에서 타입 오류 사전 방지
- SQLite
    - 준님의 추천으로 사용해봤습니다
    - 개발/데모에 최적(설치 불필요, 파일 기반)
	- 마이그레이션만으로 즉시 사용

<br>

## 📚 API 명세
1) 좌석 목록 조회
- GET /seats/
```json
[
  { "id": 1, "row": 1, "col": 1, "status": "available", "seat_code": "A1" },
  { "id": 2, "row": 1, "col": 2, "status": "reserved",  "seat_code": "A2" }
]
```
<br>

2) 좌석 예약 요청
- POST /reserve/
  
**Request**
```json
{ "row": 1, "col": 2, "name": "홍길동", "phone": "010-1234-5678" }
```

**Response 200**
```json
{
  "message": "예약이 완료되었습니다.",
  "seat": { "id": 2, "row": 1, "col": 2, "status": "reserved", "seat_code": "A2" }
}
```

**Response 400**
```json
{ "message": "올바른 휴대폰 번호 형식이 아닙니다." }
```

**Response 409**
```json
{ "message": "이미 예약된 좌석입니다." }
```
<br>

3) 예약 내역 조회 (이름+전화번호)
- POST /reservations/lookup/
  
**Request**
```json
{ "name": "홍길동", "phone": "010-1234-5678" }
```

**Response 200**
```json
{
  "message": "홍길동님의 예약 내역입니다.",
  "seats": [
    { "id": 2, "row": 1, "col": 2, "status": "reserved", "seat_code": "A2" }
  ]
}
```

**Response 404**
```json
{ "message": "예약 내역이 없습니다." }
```

<br>

## 🧩 요구사항별 해결 방법
### 1) 직관적인 UI
- 초록(available), 빨강(reserved), 회색(pending) 색상 적용
  
### 2) 예약 실패 UX
- 에러 메시지를 { message }로 받아 모달에 표시 → 메인으로 이동 버튼 제공
- 요구사항에 따라 예약 시 **1% 확률로 의도적으로 실패**하도록 구현했습니다.
- 실패 시 백엔드는 `{ "message": "일시적으로 실패했습니다. 다시 시도해주세요." }` 형태로 응답하고,
  프론트는 사용자에게 메시지로 명확히 안내합니다.

### 3) 안정성/정합성
- 입력 검증(이름/전화번호 정규식)
- 좌석 존재 여부 및 상태 확인
  
<br>

## 🧪 테스트 & 품질 보장
### Django 테스트

```bash
cd Backend
pytest
```

<img width="1147" height="170" alt="Image" src="https://github.com/user-attachments/assets/bfb47f8d-dd3a-42a3-aee2-0925ac91088d" />

### 타입 체크

```bash
# Backend
mypy .
```
<img width="349" height="34" alt="Image" src="https://github.com/user-attachments/assets/be49253e-0a81-4c73-8c8a-8cfa875bb0ac" />


```bash
# Frontend
npm run type-check
```

<img width="362" height="72" alt="Image" src="https://github.com/user-attachments/assets/266a0957-b9ae-436f-954f-c66542c383e8" />

### 린트

```bash
# Backend
ruff check .
```

<img width="376" height="35" alt="Image" src="https://github.com/user-attachments/assets/cc53cc83-60b9-405f-8248-67077263c195" />

<br>

## 📸 스크린샷

### 1) 좌석 현황 페이지
- 공연장 스테이지와 좌석이 **3×3 격자**로 표시
- **초록색 = 예약 가능**, **빨강색 = 예약 불가**

<img src="https://github.com/user-attachments/assets/2543f59a-2c83-4896-812b-75b410a1ea63" width="300" />

---

### 2) 예약 페이지
- 사용자가 좌석 선택 → 이름/전화번호 입력
- **예약 중 안내 문구** 표시

<img src="https://github.com/user-attachments/assets/86ee5cb3-0903-4c08-969a-a32563062c94" width="300" />

---

### 3) 예약 실패 모달
- 이미 예약된 좌석을 선택하면 **모달 알림** 표시
- 확인 시 **메인 좌석 현황 페이지로 이동**

<img src="https://github.com/user-attachments/assets/84e5bb27-4cc3-4058-92c1-c59e21e889d7" width="300" />

---

### 4) 예약 확인 페이지
- 이름+전화번호 입력 → 내 예약 내역 조회
- **여러 좌석이 예약된 경우 목록으로 표시**

<img src="https://github.com/user-attachments/assets/91737b57-c10f-46e8-89cb-20fd624e6ba0" width="300" />
