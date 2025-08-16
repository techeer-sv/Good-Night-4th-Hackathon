from typing import Any, Dict
import random

from rest_framework.decorators import api_view
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction

from .models import Seat
from .serializers import SeatSerializer, ReservationInputSerializer


def _first_error_message(errors: Any) -> str:
    """error 사람이 읽기 쉬운 한 문장으로 변환."""
    try:
        if isinstance(errors, dict):
            for field, msgs in errors.items():
                if isinstance(msgs, (list, tuple)) and msgs:
                    return str(msgs[0])
            return "잘못된 입력입니다."
        if isinstance(errors, (list, tuple)) and errors:
            return str(errors[0])
    except Exception:
        pass
    return "잘못된 입력입니다."


@api_view(["GET"])
def seat_list(request: Request) -> Response:
    """
    좌석 목록 조회 API

    - 엔드포인트: GET /seats/
    - 반환값: 3x3 좌석 목록(JSON)
    """
    seats = Seat.objects.all()  # Meta.ordering에 의해 row -> col 정렬
    data = SeatSerializer(seats, many=True).data
    return Response(data, status=status.HTTP_200_OK)



@api_view(["POST"])
def reserve_seat(request: Request) -> Response:
    """
    좌석 예약 요청 API

    - 엔드포인트: POST /reserve/
    - 요청 본문 예시:
      {
        "row": 1,
        "col": 2,
        "name": "홍길동",
        "phone": "010-1234-5678"
      }

    - 동작:
      1) name/phone 검증(전화번호 정규화)
      2) row/col 숫자 변환 및 존재 확인
      3) 1% 확률 의도적 실패(409)
      4) 이미 예약된 좌석이면 400
      5) 성공 시 status 변경 및 예약자 정보 저장 후 200
    """
    # 1) 이름/전화번호 검증 및 정규화
    input_ser = ReservationInputSerializer(data=request.data)
    if not input_ser.is_valid():
        return Response({"message": _first_error_message(input_ser.errors)}, status=status.HTTP_400_BAD_REQUEST)
    name = input_ser.validated_data["name"]
    phone = input_ser.validated_data["phone"]

    # 2) row/col 파싱 (문자열로 들어와도 안전하게 정수 변환)
    body: Dict[str, Any] = request.data
    row_raw = body.get("row")
    col_raw = body.get("col")

    if row_raw is None or col_raw is None:
        return Response({"message": "row, col이 필요합니다."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        row = int(row_raw)
        col = int(col_raw)
    except (TypeError, ValueError):
        return Response({"message": "row, col은 정수여야 합니다."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        seat = Seat.objects.get(row=row, col=col)
    except Seat.DoesNotExist:
        return Response({"message": "존재하지 않는 좌석입니다."}, status=status.HTTP_404_NOT_FOUND)

    # 3) 1% 의도적 실패
    if random.random() < 0.01:
        return Response({"message": "1% 확률로 실패했습니다. 다시 시도해주세요."}, status=status.HTTP_409_CONFLICT)

    # 4) 이미 예약됨
    if seat.status == Seat.Status.RESERVED:
        return Response({"message": "이미 예약된 좌석입니다."}, status=status.HTTP_400_BAD_REQUEST)

    # 5) 상태 변경 (동시성 제어 구현 x)
    with transaction.atomic():
        seat.status = Seat.Status.RESERVED
        seat.reserver_name = name
        seat.reserver_phone = phone
        seat.save(update_fields=["status", "reserver_name", "reserver_phone"])  # updated_at 자동 갱신

    return Response(
        {"message": "예약에 성공했습니다.", "seat": SeatSerializer(seat).data},
        status=status.HTTP_200_OK,
    )



# 예약 확인 API
@api_view(["POST"])
def lookup_reservation(request: Request) -> Response:
    """
    예약 확인 API
    - 엔드포인트: POST /lookup/
    - 요청 본문 예시:
      { "name": "홍길동", "phone": "010-1234-5678" }
    - 응답: 사용자가 예약한 좌석 목록(0개 가능)
    """
    # 이름/전화번호 검증 및 전화번호 정규화 재사용
    ser = ReservationInputSerializer(data=request.data)
    if not ser.is_valid():
        return Response({"message": _first_error_message(ser.errors)}, status=status.HTTP_400_BAD_REQUEST)
    name = ser.validated_data["name"]
    phone = ser.validated_data["phone"]

    seats = (
        Seat.objects.filter(
            status=Seat.Status.RESERVED,
            reserver_name=name,
            reserver_phone=phone,
        )
        .order_by("row", "col")
    )

    data = SeatSerializer(seats, many=True).data

    # 존재하지 않더라도 200 + 빈 배열로 응답
    message = "예약 내역입니다." if data else "예약 내역이 없습니다."
    return Response({"message": message, "seats": data}, status=status.HTTP_200_OK)