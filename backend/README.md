# Backend API 서버

Node.js와 Express를 사용한 백엔드 API 서버입니다.

## 설치

```bash
npm install
```

## 실행

### 개발 모드 (자동 재시작)
```bash
npm run dev
```

### 프로덕션 모드
```bash
npm start
```

## 환경 변수

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```
PORT=5000
NODE_ENV=development
```

## API 엔드포인트

- `GET /` - 서버 상태 확인
- `GET /api/test` - API 테스트

## 포트

기본 포트: 5000
환경 변수 `PORT`로 변경 가능

## 의존성

- **express**: 웹 프레임워크
- **cors**: CORS 설정
- **dotenv**: 환경 변수 관리
- **nodemon**: 개발 시 자동 재시작 (개발 의존성) 