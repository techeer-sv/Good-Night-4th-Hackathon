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
public class RedisReservationService implements ReservationService {

    private final PerformanceSeatRepository performanceSeatRepository;
    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;
    private final _th.hackathon.domain.reservation.repository.RedisRepository redisRepository;

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

        // 좌석 조회 (회차ID를 얻기 위해 필요)
        PerformanceSeat ps = performanceSeatRepository.findById(performanceSeatId)
                .orElseThrow(() -> new IllegalArgumentException("좌석이 존재하지 않습니다."));
        // 첫 시도만 통과
        Long gate = redisRepository.increment(ps.getPerformance().getId(), ps.getId());
        if (gate == null) {
            throw new IllegalStateException("예약 게이트 확인에 실패했습니다."); // 필요시 503 등으로 매핑
        }
        if (gate > 1) {
            // 이미 누군가 선점 → 즉시 충돌 처리(409로 매핑 권장)
            throw new IllegalStateException("이미 다른 요청이 선점했습니다.");
        }

        try { Thread.sleep(80); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }

        if (!ps.isAvailable()) {
            throw new IllegalStateException("이미 예매된 좌석입니다.");
        }

        ps.markSold();

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
                .ifPresent(ps -> {
                    ps.markAvailable();
                    redisRepository.reset(ps.getPerformance().getId(), ps.getId());
                });
        r.cancel();
    }
}
