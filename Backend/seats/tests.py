from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from seats.models import Seat

class SeatAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        # 3x3 좌석 초기화
        for r in range(1, 4):
            for c in range(1, 4):
                Seat.objects.create(row=r, col=c)

    def test_list_seats(self):
        resp = self.client.get(reverse("seat-list"))
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.json()), 9)

    def test_reserve_seat_success(self):
        resp = self.client.post(reverse("reserve-seat"), {
            "row": 1, "col": 1, "name": "홍길동", "phone": "01012345678"
        })
        self.assertEqual(resp.status_code, 200)
