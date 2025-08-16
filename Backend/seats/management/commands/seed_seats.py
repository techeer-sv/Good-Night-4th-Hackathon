from django.core.management.base import BaseCommand
from seats.models import Seat


class Command(BaseCommand):
    help = "3x3 좌석을 생성합니다 (없으면 새로 만들고, 있으면 건너뜀)."

    def add_arguments(self, parser):
        parser.add_argument(
            '--reset',
            action='store_true',
            help='Reset all seats to available and clear reserver information.',
        )

    def handle(self, *args, **kwargs):
        if kwargs['reset']:
            updated = Seat.objects.update(
                status=Seat.Status.AVAILABLE,
                reserver_name='',
                reserver_phone='',
            )
            self.stdout.write(
                self.style.WARNING(f"좌석 초기화: {updated}개의 좌석이 리셋되었습니다.")
            )

        created = 0
        for r in range(1, 4):       # 행: 1~3
            for c in range(1, 4):   # 열: 1~3
                _, was_created = Seat.objects.get_or_create(
                    row=r,
                    col=c,
                    defaults={"status": Seat.Status.AVAILABLE},
                )
                created += int(was_created)

        self.stdout.write(
            self.style.SUCCESS(f"좌석 초기화 완료: 새로 생성된 좌석 {created}개")
        )
