package com.goodnight.ticket_service.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import com.goodnight.ticket_service.domain.Seat;
import com.goodnight.ticket_service.domain.SeatStatus;
import com.goodnight.ticket_service.dto.ReservationRequestDto;
import com.goodnight.ticket_service.dto.ReservationResponseDto;
import com.goodnight.ticket_service.repository.SeatRepository;

import jakarta.transaction.Transactional;

@SpringBootTest
@Transactional
@ActiveProfiles("test")
public class ReservationServiceTest {

    @Autowired
    ReservationService reservationService;

    @Autowired
    SeatRepository seatRepository;

    @Test
    void 좌석_예약_성공_테스트() throws Exception {
        // given
        Seat seat = new Seat();
        seat.setSeatCode("A1");
        seat.setStatus(SeatStatus.AVAILABLE);
        seatRepository.save(seat);

        ReservationRequestDto requestDto = ReservationRequestDto.builder()
                .seatId(seat.getId())
                .memberName("홍길동")
                .build();

        // when
        ReservationResponseDto response = reservationService.reserveSeat(requestDto);

        // then
        assertNotNull(response);
        assertTrue("SUCCESS".equals(response.getStatus()) || "FAILED".equals(response.getStatus()));

        if ("SUCCESS".equals(response.getStatus())) {
            assertEquals(seat.getId(), response.getSeatId());
            assertEquals("A1", response.getSeatCode());
            assertEquals("홍길동", response.getMemberName());
            assertEquals("좌석 예약이 성공적으로 완료되었습니다.", response.getMessage());
        }
    }

    @Test
    void 이미_예약된_좌석_예약_시도_테스트() throws Exception {
        // given
        Seat seat = new Seat();
        seat.setSeatCode("A1");
        seat.setStatus(SeatStatus.AVAILABLE);
        seatRepository.save(seat);

        // 첫 번째 예약
        ReservationRequestDto firstRequest = ReservationRequestDto.builder()
                .seatId(seat.getId())
                .memberName("홍길동")
                .build();

        reservationService.reserveSeat(firstRequest);

        // 두 번째 예약 시도
        ReservationRequestDto secondRequest = ReservationRequestDto.builder()
                .seatId(seat.getId())
                .memberName("김철수")
                .build();

        // when
        ReservationResponseDto response = reservationService.reserveSeat(secondRequest);

        // then
        assertNotNull(response);
        assertEquals("FAILED", response.getStatus());
        assertTrue(response.getMessage().contains("이미 예약된 좌석입니다"));
    }

    @Test
    void 존재하지_않는_좌석_예약_시도_테스트() throws Exception {
        // given
        ReservationRequestDto requestDto = ReservationRequestDto.builder()
                .seatId(999L)
                .memberName("홍길동")
                .build();

        // when
        ReservationResponseDto response = reservationService.reserveSeat(requestDto);

        // then
        assertNotNull(response);
        assertEquals("FAILED", response.getStatus());
        assertTrue(response.getMessage().contains("존재하지 않는 좌석입니다"));
    }

    @Test
    void 예약_확률_테스트() throws Exception {
        // given
        Seat seat = new Seat();
        seat.setSeatCode("A1");
        seat.setStatus(SeatStatus.AVAILABLE);
        seatRepository.save(seat);

        ReservationRequestDto requestDto = ReservationRequestDto.builder()
                .seatId(seat.getId())
                .memberName("홍길동")
                .build();

        int successCount = 0;
        int totalAttempts = 1000;

        // when
        for (int i = 0; i < totalAttempts; i++) {
            // 좌석 상태를 다시 AVAILABLE로 설정
            seat.setStatus(SeatStatus.AVAILABLE);
            seatRepository.save(seat);

            ReservationResponseDto response = reservationService.reserveSeat(requestDto);
            if ("SUCCESS".equals(response.getStatus())) {
                successCount++;
            }
        }

        // then
        double successRate = (double) successCount / totalAttempts;
        assertTrue(successRate > 0.95, "성공률이 95% 이상이어야 합니다. 실제 성공률: " + successRate);
        assertTrue(successRate < 1.0, "성공률이 100% 미만이어야 합니다. 실제 성공률: " + successRate);
    }
}