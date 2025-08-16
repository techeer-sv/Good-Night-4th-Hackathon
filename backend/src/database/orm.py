from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import declarative_base, relationship
from schema.request import BookingRequest

Base = declarative_base()

class Seat(Base):
    __tablename__ = "seats"  # 소문자로 통일

    id = Column(Integer, primary_key=True)
    is_booked = Column(Boolean, nullable=False, default=False)

    def __repr__(self):
        return f"Seat(id={self.id}, is_booked={self.is_booked})"

class Reservation(Base):
    __tablename__ = "reservations"

    reservation_id = Column(Integer, primary_key=True, autoincrement=True)
    seat_id = Column(Integer, ForeignKey("seats.id"), nullable=False)  # 테이블명 일치
    user_name = Column(String(255), nullable=False)
    phone_number = Column(String(20), nullable=False)
    
    # Seat 테이블과의 관계를 정의합니다.
    seat = relationship("Seat", backref="reservations")

    @classmethod
    def create(cls, request: BookingRequest) -> "Reservation":
        return cls(
            seat_id=request.seatId,
            user_name=request.name,
            phone_number=request.phoneNumber
        )