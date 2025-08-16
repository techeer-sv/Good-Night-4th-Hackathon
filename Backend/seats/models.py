from django.db import models


class Seat(models.Model):
    """
    3x3 좌석 중 하나를 나타내는 모델입니다.

    - row, col         : 좌표(행/열)
    - status           : 좌석 상태 (available=예약 가능, reserved=예약 완료)
    - reserver_name    : 예약자 이름
    - reserver_phone   : 예약자 전화번호
    - created_at       : 생성 시각
    - updated_at       : 변경 시각
    """

    class Status(models.TextChoices):
        AVAILABLE = "available", "available"
        RESERVED = "reserved", "reserved"

    row = models.PositiveIntegerField()  # 1~3
    col = models.PositiveIntegerField()  # 1~3

    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.AVAILABLE,
        help_text="available(예약 가능) / reserved(예약됨)",
    )

    # 예약자 정보
    reserver_name = models.CharField(max_length=50, null=True, blank=True)
    reserver_phone = models.CharField(max_length=20, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("row", "col")
        indexes = [
            models.Index(fields=["row", "col"]),
            models.Index(fields=["status"]),
        ]
        ordering = ["row", "col"]

    def __str__(self) -> str:
        return f"Seat({self.row},{self.col}) - {self.status}"
