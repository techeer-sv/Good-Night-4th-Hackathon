package com.goodnight.ticket_service.dto;

import java.time.LocalDateTime;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "좌석 예약 응답 정보")
public class ReservationResponseDto {
    public static ReservationResponseDto fromEntity(com.goodnight.ticket_service.domain.Reservation reservation) {
        if (reservation == null)
            return null;
        Long seatId = null;
        String seatCode = null;
        // 예약 좌석이 여러 개일 수 있으므로 첫 번째 좌석 정보만 사용
        if (reservation.getReservationSeats() != null && !reservation.getReservationSeats().isEmpty()) {
            com.goodnight.ticket_service.domain.Seat seat = reservation.getReservationSeats().get(0).getSeat();
            if (seat != null) {
                seatId = seat.getId();
                seatCode = seat.getSeatCode();
            }
        }
        return ReservationResponseDto.builder()
                .reservationId(reservation.getId())
                .seatId(seatId)
                .seatCode(seatCode)
                .memberName(reservation.getMember() != null ? reservation.getMember().getName() : null)
                .status("SUCCESS")
                .reservationDate(reservation.getReservationDate())
                .message("예약 정보 조회 성공")
                .build();
    }

    @Schema(description = "예약 ID", example = "1")
    private Long reservationId;

    @Schema(description = "좌석 ID", example = "1")
    private Long seatId;

    @Schema(description = "좌석 코드", example = "A1")
    private String seatCode;

    @Schema(description = "예약자 이름", example = "홍길동")
    private String memberName;

    @Schema(description = "예약 상태", example = "SUCCESS", allowableValues = { "SUCCESS", "FAILED" })
    private String status;

    @Schema(description = "예약 날짜", example = "2024-01-15T10:30:00")
    private LocalDateTime reservationDate;

    @Schema(description = "응답 메시지", example = "좌석 예약이 성공적으로 완료되었습니다.")
    private String message;
}