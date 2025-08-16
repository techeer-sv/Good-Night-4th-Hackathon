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