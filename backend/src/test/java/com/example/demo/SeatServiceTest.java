package com.example.demo;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SeatServiceTest {

    @Mock
    private SeatRepository seatRepository;

    @InjectMocks
    private SeatService seatService;

    private Seat seat;

    @BeforeEach
    void setUp() {
        seat = new Seat();
        seat.setId(1L);
        seat.setSeatNumber(1);
        seat.setReserved(false);
    }

    @Test
    void whenReserveSeat_andSeatIsAvailable_thenSeatIsReserved() {
        // Given
        when(seatRepository.findById(1L)).thenReturn(Optional.of(seat));
        when(seatRepository.save(any(Seat.class))).thenReturn(seat);

        // When
        Seat reservedSeat = seatService.reserveSeat(1L, "Jules");

        // Then
        assertTrue(reservedSeat.isReserved());
        assertEquals("Jules", reservedSeat.getReservedBy());
        assertNotNull(reservedSeat.getReservationTime());
        verify(seatRepository, times(1)).findById(1L);
        verify(seatRepository, times(1)).save(seat);
    }

    @Test
    void whenReserveSeat_andSeatNotFound_thenThrowsSeatNotFoundException() {
        // Given
        when(seatRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(SeatNotFoundException.class, () -> {
            seatService.reserveSeat(1L, "Jules");
        });
        verify(seatRepository, times(1)).findById(1L);
        verify(seatRepository, never()).save(any(Seat.class));
    }

    @Test
    void whenReserveSeat_andSeatIsAlreadyReserved_thenThrowsIllegalStateException() {
        // Given
        seat.setReserved(true);
        when(seatRepository.findById(1L)).thenReturn(Optional.of(seat));

        // When & Then
        assertThrows(IllegalStateException.class, () -> {
            seatService.reserveSeat(1L, "Jules");
        });
        verify(seatRepository, times(1)).findById(1L);
        verify(seatRepository, never()).save(any(Seat.class));
    }
}
