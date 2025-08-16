package com.goodnight.ticket_service.service;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import com.goodnight.ticket_service.domain.Seat;
import com.goodnight.ticket_service.domain.SeatStatus;
import com.goodnight.ticket_service.repository.SeatRepository;

import jakarta.transaction.Transactional;

@SpringBootTest
@Transactional
@ActiveProfiles("test") // 테스트 프로파일을 활성화하여, application-test.yml 설정을 사용한다.
public class SeatServiceTest {

    @Autowired
    SeatService seatService;
    @Autowired
    SeatRepository seatRepository;

    @Test
    void stock_id_조회() throws Exception {
        // given
        Seat seat = new Seat();
        seat.setSeatCode("A1");
        seat.setStatus(SeatStatus.AVAILABLE);
        seatService.saveSeat(seat);

        // when
        Seat foundSeat = seatService.findSeatById(seat.getId());

        // then
        assertEquals(seat, foundSeat); // 저장된 좌석과 조회된 좌석이 동일해야 한다.
    }

    @Test
    void seat_상태_예외() throws Exception {
        // given
        Seat seat = new Seat();
        seat.setSeatCode("B1");
        seat.setStatus(SeatStatus.RESERVED);
        seatService.saveSeat(seat);

        // when
        Seat foundSeat = seatService.findSeatById(seat.getId());

        // then
        assertEquals(SeatStatus.RESERVED, foundSeat.getStatus()); // 조회된 좌석의 상태가 RESERVED여야 한다.

    }
}
