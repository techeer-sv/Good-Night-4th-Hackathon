package com.goodnight.ticket_service.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.goodnight.ticket_service.domain.Seat;
import com.goodnight.ticket_service.dto.SeatResponseDto;
import com.goodnight.ticket_service.service.SeatService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/seats")
@RequiredArgsConstructor
@Tag(name = "좌석 관리", description = "좌석 조회 및 상태 확인 API")
public class SeatController {
    private final SeatService seatService;

    @Operation(summary = "모든 좌석 목록 조회", description = "시스템에 등록된 모든 좌석의 정보를 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "좌석 목록 조회 성공", content = @Content(schema = @Schema(implementation = SeatResponseDto.class)))
    })
    @GetMapping
    public ResponseEntity<List<SeatResponseDto>> getAllSeats() {
        List<Seat> seats = seatService.findAllSeats();
        List<SeatResponseDto> seatDtos = seats.stream()
                .map(SeatResponseDto::from)
                .collect(Collectors.toList());

        return ResponseEntity.ok(seatDtos);
    }

    /*
     * 특정 좌석 조회 API
     */
    @Operation(summary = "특정 좌석 조회", description = "좌석 ID로 특정 좌석의 상세 정보를 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "좌석 조회 성공", content = @Content(schema = @Schema(implementation = SeatResponseDto.class))),
            @ApiResponse(responseCode = "404", description = "좌석을 찾을 수 없음")
    })
    @GetMapping("/{seatId}")
    public ResponseEntity<SeatResponseDto> getSeatById(
            @Parameter(description = "좌석 ID", example = "1") @PathVariable Long seatId) {
        Seat seat = seatService.findSeatById(seatId);
        if (seat == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(SeatResponseDto.from(seat));
    }

    /*
     * 사용 가능한 좌석만 조회 API
     */
    @Operation(summary = "사용 가능한 좌석 조회", description = "현재 예약 가능한 좌석만 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "사용 가능한 좌석 조회 성공", content = @Content(schema = @Schema(implementation = SeatResponseDto.class)))
    })
    @GetMapping("/available")
    public ResponseEntity<List<SeatResponseDto>> getAvailableSeats() {
        List<Seat> availableSeats = seatService.findAvailableSeats();
        List<SeatResponseDto> seatDtos = availableSeats.stream()
                .map(SeatResponseDto::from)
                .collect(Collectors.toList());

        return ResponseEntity.ok(seatDtos);
    }

    /*
     * 예약된 좌석만 조회 API
     */
    @Operation(summary = "예약된 좌석 조회", description = "현재 예약된 좌석만 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "예약된 좌석 조회 성공", content = @Content(schema = @Schema(implementation = SeatResponseDto.class)))
    })
    @GetMapping("/reserved")
    public ResponseEntity<List<SeatResponseDto>> getReservedSeats() {
        List<Seat> reservedSeats = seatService.findReservedSeats();
        List<SeatResponseDto> seatDtos = reservedSeats.stream()
                .map(SeatResponseDto::from)
                .collect(Collectors.toList());

        return ResponseEntity.ok(seatDtos);
    }
}