package com.goodnight.ticket_service.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.goodnight.ticket_service.domain.Reservation;
import com.goodnight.ticket_service.dto.ReservationRequestDto;
import com.goodnight.ticket_service.dto.ReservationResponseDto;
import com.goodnight.ticket_service.service.ReservationService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
@Validated
@Tag(name = "예약 관리", description = "좌석 예약 및 조회 API")
public class ReservationController {
    private final ReservationService reservationService;

    /*
     * 좌석 예약 요청 API
     */
    @Operation(summary = "좌석 예약", description = "선택한 좌석을 예약합니다. 99% 성공, 1% 실패 확률로 처리됩니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "예약 성공", content = @Content(schema = @Schema(implementation = ReservationResponseDto.class))),
            @ApiResponse(responseCode = "400", description = "예약 실패 (이미 예약된 좌석, 잘못된 요청 등)", content = @Content(schema = @Schema(implementation = ReservationResponseDto.class)))
    })
    @PostMapping
    public ResponseEntity<ReservationResponseDto> reserveSeat(
            @Parameter(description = "예약 요청 정보", required = true) @Valid @RequestBody ReservationRequestDto requestDto) {
        ReservationResponseDto response = reservationService.reserveSeat(requestDto);

        if ("SUCCESS".equals(response.getStatus())) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    /*
     * 모든 예약 목록 조회 API
     */
    @Operation(summary = "모든 예약 목록 조회", description = "시스템에 등록된 모든 예약 정보를 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "예약 목록 조회 성공", content = @Content(schema = @Schema(implementation = Reservation.class)))
    })
    @GetMapping
    public ResponseEntity<List<Reservation>> getAllReservations() {
        List<Reservation> reservations = reservationService.findAllReservations();
        return ResponseEntity.ok(reservations);
    }

    /*
     * 특정 예약 조회 API
     */
    @Operation(summary = "특정 예약 조회", description = "예약 ID로 특정 예약의 상세 정보를 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "예약 조회 성공", content = @Content(schema = @Schema(implementation = Reservation.class))),
            @ApiResponse(responseCode = "404", description = "예약을 찾을 수 없음")
    })
    @GetMapping("/{reservationId}")
    public ResponseEntity<Reservation> getReservationById(
            @Parameter(description = "예약 ID", example = "1") @PathVariable Long reservationId) {
        Reservation reservation = reservationService.findReservationById(reservationId);
        if (reservation == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(reservation);
    }

    /*
     * 회원별 예약 목록 조회 API
     */
    @Operation(summary = "회원별 예약 목록 조회", description = "특정 회원의 모든 예약 정보를 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "회원별 예약 목록 조회 성공", content = @Content(schema = @Schema(implementation = Reservation.class)))
    })
    @GetMapping("/member/{memberId}")
    public ResponseEntity<List<Reservation>> getReservationsByMemberId(
            @Parameter(description = "회원 ID", example = "1") @PathVariable Long memberId) {
        List<Reservation> reservations = reservationService.findReservationsByMemberId(memberId);
        return ResponseEntity.ok(reservations);
    }
}