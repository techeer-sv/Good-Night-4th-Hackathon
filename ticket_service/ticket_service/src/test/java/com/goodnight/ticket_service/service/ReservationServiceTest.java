package com.goodnight.ticket_service.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.util.Arrays;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.goodnight.ticket_service.domain.Member;
import com.goodnight.ticket_service.domain.Reservation;
import com.goodnight.ticket_service.domain.Seat;
import com.goodnight.ticket_service.domain.SeatStatus;
import com.goodnight.ticket_service.dto.ReservationRequestDto;
import com.goodnight.ticket_service.dto.ReservationResponseDto;
import com.goodnight.ticket_service.repository.MemberRepository;
import com.goodnight.ticket_service.repository.ReservationRepository;
import com.goodnight.ticket_service.repository.SeatRepository;

@ExtendWith(MockitoExtension.class)
class ReservationServiceTest {

    @Mock
    private SeatRepository seatRepository;

    @Mock
    private MemberRepository memberRepository;

    @Mock
    private ReservationRepository reservationRepository;

    @InjectMocks
    private ReservationService reservationService;

    private Seat testSeat;
    private Member testMember;
    private ReservationRequestDto requestDto;

    @BeforeEach
    void setUp() {
        testSeat = new Seat("A1", SeatStatus.AVAILABLE);
        testSeat.setId(1L);

        testMember = new Member("테스트 사용자");
        testMember.setId(1L);

        requestDto = ReservationRequestDto.builder()
                .seatId(1L)
                .memberName("테스트 사용자")
                .build();
    }

    @Test
    @DisplayName("좌석 예약 성공 테스트")
    void reserveSeat_Success() {
        // Given
        when(seatRepository.findById(1L)).thenReturn(testSeat);
        when(memberRepository.findByName("테스트 사용자")).thenReturn(Arrays.asList(testMember));
        doNothing().when(reservationRepository).save(any(Reservation.class));
        doNothing().when(seatRepository).save(any(Seat.class));

        // When
        ReservationResponseDto response = reservationService.reserveSeat(requestDto);

        // Then
        assertNotNull(response);
        assertEquals("SUCCESS", response.getStatus());
        assertEquals("좌석 예약이 성공적으로 완료되었습니다.", response.getMessage());
        assertEquals("A1", response.getSeatCode());
        assertEquals("테스트 사용자", response.getMemberName());

        verify(seatRepository).findById(1L);
        verify(memberRepository).findByName("테스트 사용자");
        verify(reservationRepository).save(any(Reservation.class));
        verify(seatRepository).save(any(Seat.class));
    }

    @Test
    @DisplayName("이미 예약된 좌석 예약 시도 테스트")
    void reserveSeat_AlreadyReserved() {
        // Given
        testSeat.changeStatus(SeatStatus.RESERVED);
        when(seatRepository.findById(1L)).thenReturn(testSeat);

        // When
        ReservationResponseDto response = reservationService.reserveSeat(requestDto);

        // Then
        assertNotNull(response);
        assertEquals("FAILED", response.getStatus());
        assertTrue(response.getMessage().contains("여러 번 시도했지만 예약에 실패했습니다"));

        verify(seatRepository, atLeastOnce()).findById(1L);
        verify(memberRepository, never()).findByName(anyString());
        verify(reservationRepository, never()).save(any());
    }

    @Test
    @DisplayName("존재하지 않는 좌석 예약 시도 테스트")
    void reserveSeat_SeatNotFound() {
        // Given
        when(seatRepository.findById(1L)).thenReturn(null);

        // When
        ReservationResponseDto response = reservationService.reserveSeat(requestDto);

        // Then
        assertNotNull(response);
        assertEquals("FAILED", response.getStatus());
        assertTrue(response.getMessage().contains("여러 번 시도했지만 예약에 실패했습니다"));

        verify(seatRepository, atLeastOnce()).findById(1L);
        verify(memberRepository, never()).findByName(anyString());
        verify(reservationRepository, never()).save(any());
    }

    @Test
    @DisplayName("새로운 회원으로 좌석 예약 테스트")
    void reserveSeat_NewMember() {
        // Given
        when(seatRepository.findById(1L)).thenReturn(testSeat);
        when(memberRepository.findByName("새로운 사용자")).thenReturn(Arrays.asList());
        doNothing().when(memberRepository).save(any(Member.class));
        doNothing().when(reservationRepository).save(any(Reservation.class));
        doNothing().when(seatRepository).save(any(Seat.class));

        ReservationRequestDto newRequestDto = ReservationRequestDto.builder()
                .seatId(1L)
                .memberName("새로운 사용자")
                .build();

        // When
        ReservationResponseDto response = reservationService.reserveSeat(newRequestDto);

        // Then
        assertNotNull(response);
        assertEquals("SUCCESS", response.getStatus());

        verify(memberRepository).findByName("새로운 사용자");
        verify(memberRepository).save(any(Member.class));
    }

    @Test
    @DisplayName("빈 이름으로 예약 시도 테스트")
    void reserveSeat_EmptyName() {
        // Given
        ReservationRequestDto emptyNameRequestDto = ReservationRequestDto.builder()
                .seatId(1L)
                .memberName("")
                .build();

        // When
        ReservationResponseDto response = reservationService.reserveSeat(emptyNameRequestDto);

        // Then
        assertNotNull(response);
        assertEquals("FAILED", response.getStatus());
        assertTrue(response.getMessage().contains("여러 번 시도했지만 예약에 실패했습니다"));

        // 재시도 로직 때문에 여러 번 호출될 수 있음
        verify(seatRepository, atLeastOnce()).findById(anyLong());
        verify(memberRepository, never()).findByName(anyString());
    }

    @Test
    @DisplayName("null 이름으로 예약 시도 테스트")
    void reserveSeat_NullName() {
        // Given
        ReservationRequestDto nullNameRequestDto = ReservationRequestDto.builder()
                .seatId(1L)
                .memberName(null)
                .build();

        // When
        ReservationResponseDto response = reservationService.reserveSeat(nullNameRequestDto);

        // Then
        assertNotNull(response);
        assertEquals("FAILED", response.getStatus());
        assertTrue(response.getMessage().contains("여러 번 시도했지만 예약에 실패했습니다"));

        // 재시도 로직 때문에 여러 번 호출될 수 있음
        verify(seatRepository, atLeastOnce()).findById(anyLong());
        verify(memberRepository, never()).findByName(anyString());
    }

    @Test
    @DisplayName("예약 목록 조회 테스트")
    void findAllReservations() {
        // Given
        List<Reservation> expectedReservations = Arrays.asList(new Reservation());
        when(reservationRepository.findAll()).thenReturn(expectedReservations);

        // When
        List<Reservation> result = reservationService.findAllReservations();

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(reservationRepository).findAll();
    }

    @Test
    @DisplayName("회원별 예약 목록 조회 테스트")
    void findReservationsByMemberId() {
        // Given
        List<Reservation> expectedReservations = Arrays.asList(new Reservation());
        when(reservationRepository.findByMemberId(1L)).thenReturn(expectedReservations);

        // When
        List<Reservation> result = reservationService.findReservationsByMemberId(1L);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(reservationRepository).findByMemberId(1L);
    }

    @Test
    @DisplayName("회원별 예약 목록 조회 - null ID 테스트")
    void findReservationsByMemberId_NullId() {
        // When & Then
        assertThrows(IllegalArgumentException.class, () -> {
            reservationService.findReservationsByMemberId(null);
        });

        verify(reservationRepository, never()).findByMemberId(anyLong());
    }

    @Test
    @DisplayName("예약 상세 조회 테스트")
    void findReservationById() {
        // Given
        Reservation expectedReservation = new Reservation();
        when(reservationRepository.findById(1L)).thenReturn(expectedReservation);

        // When
        Reservation result = reservationService.findReservationById(1L);

        // Then
        assertNotNull(result);
        verify(reservationRepository).findById(1L);
    }

    @Test
    @DisplayName("예약 상세 조회 - null ID 테스트")
    void findReservationById_NullId() {
        // When & Then
        assertThrows(IllegalArgumentException.class, () -> {
            reservationService.findReservationById(null);
        });

        verify(reservationRepository, never()).findById(anyLong());
    }
}