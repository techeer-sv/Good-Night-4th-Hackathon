package _th.hackathon.domain.reservation.service;

import _th.hackathon.domain.catalog.entity.PerformanceSeat;
import _th.hackathon.domain.catalog.repository.PerformanceSeatRepository;
import _th.hackathon.domain.reservation.entity.Reservation;
import _th.hackathon.domain.reservation.repository.ReservationRepository;
import _th.hackathon.domain.reservation.service.ReservationService;
import _th.hackathon.domain.user.entity.User;
import _th.hackathon.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NaiveReservationService implements ReservationService {

    private final PerformanceSeatRepository performanceSeatRepository;
    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;

    /** CAS 제거 버전: 읽고-검사하고-저장(중간에 인위적 딜레이) */
    @Override
    @Transactional
    public Long reserve(Long userId,
                        Long performanceSeatId,
                        String reserverName,
                        String reserverPhone) {

        if (reserverName == null || reserverName.isBlank()) throw new IllegalArgumentException("예약자 이름은 필수입니다.");
        if (reserverPhone == null || reserverPhone.isBlank()) throw new IllegalArgumentException("예약자 전화번호는 필수입니다.");
        if (!reserverPhone.matches("^[0-9\\-]{7,20}$")) throw new IllegalArgumentException("전화번호 형식이 올바르지 않습니다.");

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 유저입니다."));

        // 1) 현재 좌석 상태 읽기
        PerformanceSeat ps = performanceSeatRepository.findById(performanceSeatId)
                .orElseThrow(() -> new IllegalArgumentException("좌석이 존재하지 않습니다."));

        if (!ps.isAvailable()) {
            throw new IllegalStateException("이미 예매된 좌석입니다.");
        }

        // 2) 레이스 윈도우를 키우기 위한 인위적 딜레이 (동시성 실패 유도)
        try {
            Thread.sleep(80); // 50~200ms 등으로 늘리면 실패 빈도↑
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // 3) 상태 변경(단순 필드 세팅) — CAS/락/버전 없음
        ps.markSold(); // 내부에서 status = SOLD 같은 단순 세팅

        // 4) 예약 레코드 저장
        Reservation r = Reservation.builder()
                .user(user)
                .performanceSeat(ps)
                .reserverName(reserverName)
                .reserverPhone(reserverPhone)
                .build();

        return reservationRepository.save(r).getId();
    }

    @Override
    @Transactional
    public void cancel(Long reservationId) {
        Reservation r = reservationRepository.findById(reservationId).orElseThrow();
        performanceSeatRepository.findById(r.getPerformanceSeat().getId())
                .ifPresent(PerformanceSeat::markAvailable);
        r.cancel();
    }
}
