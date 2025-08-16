from fastapi.testclient import TestClient
from main import app, get_db, Seat, Reservation, BookingRequest # 필요한 모델과 의존성 함수를 모두 import 합니다.

# 이 부분은 conftest.py에 TestClient 픽스처가 있다고 가정하고 주석 처리합니다.
# client = TestClient(app=app)

# NOTE: pytest에서 client 픽스처를 사용하려면, tests/conftest.py 파일에
# 아래와 같이 client 픽스처가 정의되어 있어야 합니다.
# @pytest.fixture
# def client():
#     return TestClient(app=app)

# 두 개의 test_get_seats 함수가 있어 하나를 test_get_root로 변경했습니다.
def test_get_root(client):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello, FastAPI!"}

def test_get_seats_api(client, mocker):
    # SQLAlchemy Seat 객체처럼 행동하는 가짜 클래스를 만듭니다.
    class MockSeat:
        def __init__(self, id, is_booked):
            self.id = id
            self.is_booked = is_booked

    # get_seats 함수가 MockSeat 객체 리스트를 반환하도록 설정합니다.
    mocker.patch(
        "main.get_seats",
        return_value=[
            MockSeat(id=1, is_booked=True),
            MockSeat(id=2, is_booked=False),
            MockSeat(id=3, is_booked=False),
            MockSeat(id=4, is_booked=False),
            MockSeat(id=5, is_booked=False),
            MockSeat(id=6, is_booked=False),
            MockSeat(id=7, is_booked=False),
            MockSeat(id=8, is_booked=False),
            MockSeat(id=9, is_booked=False),
        ],
    )

    response = client.get("/api/seats")
    assert response.status_code == 200
    assert response.json() == [
        {"id": 1, "isBooked": True},
        {"id": 2, "isBooked": False},
        {"id": 3, "isBooked": False},
        {"id": 4, "isBooked": False},
        {"id": 5, "isBooked": False},
        {"id": 6, "isBooked": False},
        {"id": 7, "isBooked": False},
        {"id": 8, "isBooked": False},
        {"id": 9, "isBooked": False},
    ]

def test_book_seat(client, mocker):
    # 1. 가짜 Seat 객체와 세션을 만듭니다.
    mock_seat = mocker.MagicMock(id=1, is_booked=False)
    mock_session = mocker.MagicMock()
    mock_session.query.return_value.filter.return_value.first.return_value = mock_seat
    
    # 2. FastAPI의 의존성(get_db)을 가짜 세션으로 오버라이드합니다.
    app.dependency_overrides[get_db] = lambda: mock_session

    # 3. 테스트용 요청 데이터를 정의합니다.
    booking_data = {
        "seatId": 1,
        "name": "Test User",
        "phoneNumber": "123-456-7890"
    }

    # 4. API를 호출합니다.
    response = client.post("/api/book-seat", json=booking_data)

    # 5. 테스트가 끝난 후 의존성 오버라이드를 초기화합니다.
    app.dependency_overrides = {}

    # 6. 예상대로 동작했는지 검증합니다.
    assert response.status_code == 200
    assert response.json() == {"success": True, "message": "예약이 완료되었습니다."}
    
    # 7. (선택 사항) 가짜 객체에 대한 추가 검증
    # mock_session이 `.add()`와 `.commit()` 메서드를 호출했는지 확인합니다.
    mock_session.add.assert_called_once()
    mock_session.commit.assert_called_once()