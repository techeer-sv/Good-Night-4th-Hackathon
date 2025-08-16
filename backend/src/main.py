from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import random
from sqlalchemy.orm import Session
from database.connection import get_db, engine
from database.repository import get_seats
from database.orm import Base, Seat, Reservation
from typing import List
import logging
from schema.request import BookingRequest

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI 애플리케이션 생성
app = FastAPI()

# CORS 설정: 프론트엔드 접근 허용
origins = ["http://localhost:5173"]  # 프론트엔드 주소
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Hello, FastAPI!"}

# 좌석 데이터 모델 정의 (Pydantic)
class SeatResponse(BaseModel):
    id: int
    isBooked: bool

# 예약 요청 데이터 모델 정의

# ⭐️ 좌석 목록 조회 API (GET)
@app.get("/api/seats", status_code=200)
async def get_seats_api(
    order: str | None = None,
    session: Session = Depends(get_db)
):
    try:
        logger.info("좌석 조회 API 호출됨")
        
        db_seats: List[Seat] = get_seats(session=session)
        logger.info(f"데이터베이스에서 {len(db_seats)}개의 좌석을 가져왔습니다.")
        
        # 데이터베이스에서 가져온 좌석 데이터를 Pydantic 모델로 변환
        seat_list = []
        for db_seat in db_seats:
            seat_list.append(SeatResponse(id=db_seat.id, isBooked=db_seat.is_booked))
            logger.info(f"좌석 {db_seat.id}: 예약상태 {db_seat.is_booked}")
        
        logger.info(f"총 {len(seat_list)}개의 좌석을 반환합니다.")
        return seat_list
        
    except Exception as e:
        logger.error(f"좌석 조회 중 오류 발생: {e}")
        raise HTTPException(status_code=500, detail=f"좌석 조회 실패: {str(e)}")


# ⭐️ 좌석 예약 요청 API (POST)
@app.post("/api/book-seat")
async def book_seat(
    request: BookingRequest,
    session: Session = Depends(get_db)
    ):
    try:
        # 1. 해당 좌석이 존재하는지 확인
        seat = session.query(Seat).filter(Seat.id == request.seatId).first()
        if not seat:
            raise HTTPException(status_code=404, detail="좌석을 찾을 수 없습니다.")
            
        # 2. 좌석이 이미 예약되어 있는지 확인
        if seat.is_booked:
            raise HTTPException(status_code=400, detail="이미 예약된 좌석입니다.")
            
        # 3. 1% 확률로 의도적 실패
        if random.random() < 0.01:
            raise HTTPException(status_code=500, detail="예약 실패: 서버 오류 발생")

        # 4. Reservation 생성 및 저장
        reservation = Reservation.create(request=request)
        session.add(reservation)
        
        # 5. Seat 상태 업데이트
        seat.is_booked = True
        
        # 6. 데이터베이스 변경사항 커밋
        session.commit()
        
        return {"success": True, "message": "예약이 완료되었습니다."}
        
    except HTTPException:
        session.rollback()
        raise
    except Exception as e:
        session.rollback()
        logger.error(f"예약 처리 중 오류 발생: {e}")
        raise HTTPException(status_code=500, detail="예약 처리 중 오류가 발생했습니다.")




# 데이터베이스 연결 상태 확인 API
@app.get("/api/health")
async def health_check():
    try:
        # 데이터베이스 연결 테스트
        db = Session(engine)
        try:
            # 간단한 쿼리 실행
            result = db.execute("SELECT 1")
            result.fetchone()
            
            # 좌석 테이블 존재 확인
            seat_count = db.query(Seat).count()
            
            return {
                "status": "healthy",
                "database": "connected",
                "seat_table": "exists",
                "seat_count": seat_count
            }
        finally:
            db.close()
    except Exception as e:
        logger.error(f"헬스체크 실패: {e}")
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e)
        }