package com.goodnight.ticket_service.service;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.goodnight.ticket_service.domain.Seat;
import com.goodnight.ticket_service.domain.SeatStatus;
import com.goodnight.ticket_service.exception.SeatAlreadyReservedException;
import com.goodnight.ticket_service.repository.SeatRepository;

import java.util.Arrays;
import java.util.List;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SeatServiceTest {

    @Mock
    private SeatRepository seatRepository;

    @InjectMocks
    private SeatService seatService;

    private Seat testSeat;

    @BeforeEach
    void setUp() {
        testSeat = new Seat("A1", SeatStatus.AVAILABLE);
        testSeat.setId(1L);
    }

    @Test
    @DisplayName("좌석 ID로 조회 테스트")
    void findSeatById() {
        // Given
        when(seatRepository.findById(1L)).thenReturn(testSeat);

        // When
        Seat foundSeat = seatService.findSeatById(1L);

        // Then
        assertNotNull(foundSeat);
        assertEquals("A1", foundSeat.getSeatCode());
        assertEquals(SeatStatus.AVAILABLE, foundSeat.getStatus());
        verify(seatRepository).findById(1L);
    }

    @Test
    @DisplayName("모든 좌석 조회 테스트")
    void findAllSeats() {
        // Given
        List<Seat> expectedSeats = Arrays.asList(testSeat);
        when(seatRepository.findAll()).thenReturn(expectedSeats);

        // When
        List<Seat> result = seatService.findAllSeats();

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(seatRepository).findAll();
    }

    @Test
    @DisplayName("사용 가능한 좌석 조회 테스트")
    void findAvailableSeats() {
        // Given
        List<Seat> expectedSeats = Arrays.asList(testSeat);
        when(seatRepository.findByStatus(SeatStatus.AVAILABLE)).thenReturn(expectedSeats);

        // When
        List<Seat> result = seatService.findAvailableSeats();

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(SeatStatus.AVAILABLE, result.get(0).getStatus());
        verify(seatRepository).findByStatus(SeatStatus.AVAILABLE);
    }

    @Test
    @DisplayName("예약된 좌석 조회 테스트")
    void findReservedSeats() {
        // Given
        Seat reservedSeat = new Seat("B1", SeatStatus.RESERVED);
        reservedSeat.setId(2L);
        List<Seat> expectedSeats = Arrays.asList(reservedSeat);
        when(seatRepository.findByStatus(SeatStatus.RESERVED)).thenReturn(expectedSeats);

        // When
        List<Seat> result = seatService.findReservedSeats();

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(SeatStatus.RESERVED, result.get(0).getStatus());
        verify(seatRepository).findByStatus(SeatStatus.RESERVED);
    }

    @Test
    @DisplayName("좌석 예약 테스트")
    void reserveSeat() {
        // Given
        when(seatRepository.findById(1L)).thenReturn(testSeat);
        doNothing().when(seatRepository).save(any(Seat.class));

        // When
        seatService.reserveSeat(1L);

        // Then
        verify(seatRepository).findById(1L);
        verify(seatRepository).save(any(Seat.class));
        assertEquals(SeatStatus.RESERVED, testSeat.getStatus());
    }

    @Test
    @DisplayName("이미 예약된 좌석 예약 시도 테스트")
    void reserveSeat_AlreadyReserved() {
        // Given
        testSeat.changeStatus(SeatStatus.RESERVED);
        when(seatRepository.findById(1L)).thenReturn(testSeat);

        // When & Then
        assertThrows(SeatAlreadyReservedException.class, () -> {
            seatService.reserveSeat(1L);
        });

        verify(seatRepository).findById(1L);
        verify(seatRepository, never()).save(any(Seat.class));
    }

    @Test
    @DisplayName("존재하지 않는 좌석 예약 시도 테스트")
    void reserveSeat_SeatNotFound() {
        // Given
        when(seatRepository.findById(1L)).thenReturn(null);

        // When & Then
        assertThrows(IllegalArgumentException.class, () -> {
            seatService.reserveSeat(1L);
        });

        verify(seatRepository).findById(1L);
        verify(seatRepository, never()).save(any(Seat.class));
    }

    @Test
    @DisplayName("좌석 예약 해제 테스트")
    void cancelSeatReservation() {
        // Given
        testSeat.changeStatus(SeatStatus.RESERVED);
        when(seatRepository.findById(1L)).thenReturn(testSeat);
        doNothing().when(seatRepository).save(any(Seat.class));

        // When
        seatService.cancelSeatReservation(1L);

        // Then
        verify(seatRepository).findById(1L);
        verify(seatRepository).save(any(Seat.class));
        assertEquals(SeatStatus.AVAILABLE, testSeat.getStatus());
    }

    @Test
    @DisplayName("예약되지 않은 좌석 해제 시도 테스트")
    void cancelSeatReservation_NotReserved() {
        // Given
        when(seatRepository.findById(1L)).thenReturn(testSeat);

        // When & Then
        assertThrows(IllegalArgumentException.class, () -> {
            seatService.cancelSeatReservation(1L);
        });

        verify(seatRepository).findById(1L);
        verify(seatRepository, never()).save(any(Seat.class));
    }
}
