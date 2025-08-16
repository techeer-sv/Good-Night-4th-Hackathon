package _th.hackathon.domain.reservation.service;

import _th.hackathon.domain.catalog.entity.PerformanceSeat;
import _th.hackathon.domain.catalog.repository.PerformanceSeatRepository;
import _th.hackathon.domain.reservation.entity.Reservation;
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
public class CasReservationService implements ReservationService {

    private final PerformanceSeatRepository performanceSeatRepository;
    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;

    /** 좌석 확정 예매: AVAILABLE -> SOLD (원자적 UPDATE) + 예약 이력 저장 */
    @Override
    @Transactional
    public Long reserve(Long userId,
                        Long performanceSeatId,
                        String reserverName,
                        String reserverPhone) {

        // 1) 유효성(빠른 실패)
        if (reserverName == null || reserverName.isBlank()) {
            throw new IllegalArgumentException("예약자 이름은 필수입니다.");
        }
        if (reserverPhone == null || reserverPhone.isBlank()) {
            throw new IllegalArgumentException("예약자 전화번호는 필수입니다.");
        }
        // 필요시 아주 간단한 포맷 검증 (해커톤용)
        if (!reserverPhone.matches("^[0-9\\-]{7,20}$")) {
            throw new IllegalArgumentException("전화번호 형식이 올바르지 않습니다.");
        }

        // 2) 사용자 확인
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 유저입니다."));

        // 3) CAS로 좌석 선점(AVAILABLE -> SOLD)
        int updated = performanceSeatRepository.tryMarkSold(performanceSeatId);
        if (updated == 0) {
            // 이미 SOLD이거나 존재하지 않음
            throw new IllegalStateException("이미 예매된 좌석입니다.");
        }

        // 4) 예약 레코드 저장 (동일 트랜잭션 내에서 실패 시 CAS도 롤백)
        PerformanceSeat ps = performanceSeatRepository.findById(performanceSeatId).orElseThrow();
        Reservation r = Reservation.builder()
                .user(user)
                .performanceSeat(ps)
                .reserverName(reserverName)
                .reserverPhone(reserverPhone)
                .build(); // @PrePersist: createdAt/PAID 세팅
        return reservationRepository.save(r).getId();
    }

    /** 예매 취소: SOLD -> AVAILABLE 복귀 + 상태 기록 */
    @Override
    @Transactional
    public void cancel(Long reservationId) {
        Reservation r = reservationRepository.findById(reservationId).orElseThrow();
        performanceSeatRepository.releaseSold(r.getPerformanceSeat().getId()); // SOLD -> AVAILABLE
        r.cancel(); // ReservationStatus.CANCELLED
        // JPA 변경감지로 자동 UPDATE
    }
}
