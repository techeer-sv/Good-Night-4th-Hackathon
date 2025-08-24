package _th.hackathon.domain.reservation.service;

public interface ReservationService {
    /** AVAILABLE -> SOLD 원자적 확정, 성공 시 예약 ID 반환 */
    Long reserve(Long userId, Long performanceSeatId, String reserverName, String reserverPhone);

    /** 예약 취소 (SOLD -> AVAILABLE 복귀) */
    void cancel(Long reservationId);
}
