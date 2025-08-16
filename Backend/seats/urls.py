from django.urls import path
from .views import seat_list, reserve_seat, lookup_reservation

urlpatterns = [
    # 좌석 목록 조회 API
    path("seats/", seat_list, name="seat-list"),

    # 좌석 예약 요청 API
    path("reserve/", reserve_seat, name="reserve-seat"),

    # 예약 확인 API
    path("lookup/", lookup_reservation, name="reservation-lookup"),
]