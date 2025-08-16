from rest_framework import serializers
from .models import Seat
import re


class SeatSerializer(serializers.ModelSerializer):
    """
    Seat 모델을 JSON으로 변환해주는 DRF 시리얼라이저
    """

    seat_code = serializers.SerializerMethodField()

    class Meta:
        model = Seat
        fields = ["id", "row", "col", "status", "seat_code"]

    def get_seat_code(self, obj: Seat) -> str:
        row_label = chr(ord("A") + (obj.row - 1))
        col_label = str(obj.col)  # 이미 1~3이므로 그대로 사용
        return f"{row_label}{col_label}"


# ------------------------------------------------------------
# 예약 입력 검증용 Serializer
# - 로그인 없이 name/phone만 받아 예약을 생성할 때 사용
# - phone 정규식/정규화(하이픈, 공백, +82 처리)를 여기서 수행
#   * 실제 DB 저장은 views에서 수행(Reservation 모델 생성 등)
# ------------------------------------------------------------

# 한국 휴대폰 기본 패턴: 010/011/016/017/018/019 + 7~8자리
_KR_MOBILE_RE = re.compile(r"^01[016789][0-9]{7,8}$")


def normalize_phone(raw: str) -> str:
    """전화번호 정규화:
    - 공백/하이픈 제거
    - 국제번호 +82로 시작하면 국내표기(0)로 교체: +82 10-1234-5678 -> 01012345678
    """
    s = re.sub(r"[\s-]+", "", raw or "")
    if s.startswith("+82"):
        s = "0" + s[3:]
    return s


class ReservationInputSerializer(serializers.Serializer):
    """
    예약 시 사용자 입력을 검증하기 위한 Serializer.
    - name: 필수 문자열
    - phone: 필수 문자열 (정규화 + 형식 검증 수행)

    사용 예) views.reserve_seat 내부에서:
        ser = ReservationInputSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        name = ser.validated_data["name"]
        phone = ser.validated_data["phone"]  # 정규화된 값
    """

    name = serializers.CharField(max_length=50)
    phone = serializers.CharField(max_length=20)

    def validate_phone(self, value: str) -> str:
        normalized = normalize_phone(value)
        # 한국 휴대폰 번호 형식 검사 (하이픈/공백 제거 후 검사)
        if not _KR_MOBILE_RE.match(normalized):
            raise serializers.ValidationError("올바른 휴대폰 번호 형식이 아닙니다.")
        return normalized
