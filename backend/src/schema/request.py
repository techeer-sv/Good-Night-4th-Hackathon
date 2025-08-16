from pydantic import BaseModel


class BookingRequest(BaseModel):
    seatId: int
    name: str
    phoneNumber: str