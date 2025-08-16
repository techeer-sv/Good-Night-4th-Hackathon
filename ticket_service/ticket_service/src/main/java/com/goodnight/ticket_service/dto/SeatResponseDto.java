package com.goodnight.ticket_service.dto;

import com.goodnight.ticket_service.domain.Seat;
import com.goodnight.ticket_service.domain.SeatStatus;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "좌석 정보 응답")
public class SeatResponseDto {

    @Schema(description = "좌석 ID", example = "1")
    private Long id;

    @Schema(description = "좌석 코드", example = "A1")
    private String seatCode;

    @Schema(description = "좌석 상태", example = "AVAILABLE", allowableValues = { "AVAILABLE", "RESERVED" })
    private SeatStatus status;

    public static SeatResponseDto from(Seat seat) {
        return SeatResponseDto.builder()
                .id(seat.getId())
                .seatCode(seat.getSeatCode())
                .status(seat.getStatus())
                .build();
    }
}