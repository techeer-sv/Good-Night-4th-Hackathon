from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker



DATABASE_URL = "mysql+pymysql://root:booking@127.0.0.1:3306/booking"

engine = create_engine(DATABASE_URL, echo=True)
SessionFactory = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionFactory()
    try:
        yield db
    finally:
        db.close()