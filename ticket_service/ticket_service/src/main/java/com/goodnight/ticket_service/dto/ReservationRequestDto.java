package com.goodnight.ticket_service.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "좌석 예약 요청 정보")
public class ReservationRequestDto {

    @Schema(description = "예약할 좌석 ID", example = "1", required = true)
    @NotNull(message = "좌석 ID는 필수입니다.")
    private Long seatId;

    @Schema(description = "예약자 이름", example = "홍길동", required = true)
    @NotBlank(message = "예약자 이름은 필수입니다.")
    private String memberName;
}