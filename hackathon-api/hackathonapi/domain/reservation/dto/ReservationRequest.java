package hello.hackathonapi.domain.reservation.dto;

import jakarta.validation.constraints.NotNull;

public record ReservationRequest(
    @NotNull(message = "사용자 ID는 필수입니다.")
    Long memberId,
    @NotNull(message = "좌석 ID는 필수입니다.")
    Long seatId
) {
} 