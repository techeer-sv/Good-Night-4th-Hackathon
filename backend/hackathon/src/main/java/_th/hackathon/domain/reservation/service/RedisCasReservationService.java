package _th.hackathon.domain.reservation.service;

import _th.hackathon.domain.catalog.entity.PerformanceSeat;
import _th.hackathon.domain.catalog.repository.PerformanceSeatRepository;
import _th.hackathon.domain.reservation.entity.Reservation;
import _th.hackathon.domain.reservation.repository.RedisRepository;
import _th.hackathon.domain.reservation.repository.ReservationRepository;
import _th.hackathon.domain.user.entity.User;
import _th.hackathon.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Primary
@RequiredArgsConstructor
public class RedisCasReservationService implements ReservationService {

    private final PerformanceSeatRepository performanceSeatRepository;
    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;
    private final RedisRepository redisRepository;

    @Override
    @Transactional
    public Long reserve(Long userId,
                        Long performanceSeatId,
                        String reserverName,
                        String reserverPhone) {

        // 유효성 검사
        if (reserverName == null || reserverName.isBlank()) {
            throw new IllegalArgumentException("예약자 이름은 필수입니다.");
        }
        if (reserverPhone == null || reserverPhone.isBlank()) {
            throw new IllegalArgumentException("예약자 전화번호는 필수입니다.");
        }
        if (!reserverPhone.matches("^[0-9\\-]{7,20}$")) {
            throw new IllegalArgumentException("전화번호 형식이 올바르지 않습니다.");
        }

        // 좌석 조회 (performanceId 필요)
        PerformanceSeat ps = performanceSeatRepository.findById(performanceSeatId)
                .orElseThrow(() -> new IllegalArgumentException("좌석이 존재하지 않습니다."));

        Long gate = redisRepository.increment(ps.getPerformance().getId(), ps.getId());
        if (gate == null) {
            throw new IllegalStateException("Redis 처리 실패");
        }
        if (gate > 1) {
            throw new IllegalStateException("이미 다른 요청이 선점했습니다.");
        }

        try {
            int updated = performanceSeatRepository.tryMarkSold(ps.getId());
            if (updated == 0) {
                // DB에서 실패 → Redis 롤백
                redisRepository.reset(ps.getPerformance().getId(), ps.getId());
                throw new IllegalStateException("이미 예매된 좌석입니다.");
            }

            // 사용자 조회
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 유저입니다."));

            // 예약 엔티티 저장
            Reservation r = Reservation.builder()
                    .user(user)
                    .performanceSeat(ps)
                    .reserverName(reserverName)
                    .reserverPhone(reserverPhone)
                    .build();

            return reservationRepository.save(r).getId();

        } catch (Exception e) {
            // DB 예외 발생 시 Redis 롤백
            redisRepository.reset(ps.getPerformance().getId(), ps.getId());
            throw e;
        }
    }

    @Override
    @Transactional
    public void cancel(Long reservationId) {
        Reservation r = reservationRepository.findById(reservationId).orElseThrow();

        // DB 상태 복귀
        performanceSeatRepository.releaseSold(r.getPerformanceSeat().getId());

        // Redis 키 초기화 (performanceId + seatId)
        PerformanceSeat ps = r.getPerformanceSeat();
        redisRepository.reset(ps.getPerformance().getId(), ps.getId());

        r.cancel(); // 상태 변경
    }
}
