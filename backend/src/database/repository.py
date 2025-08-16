from typing import List

from sqlalchemy import select
from sqlalchemy.orm import Session

from database.orm import Seat

def get_seats(session: Session) -> List[Seat]:
    return list(session.scalars(select(Seat)))

def create_seat(session: Session, seat: Seat) -> Seat:
    session.add(instance=seat)
    session.commit()
    session.refresh(instance=seat)
    return seat