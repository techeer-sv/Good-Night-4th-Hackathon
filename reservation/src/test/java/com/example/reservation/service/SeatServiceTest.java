package com.example.reservation.service;

import com.example.reservation.domain.Seat;
import com.example.reservation.domain.User;
import com.example.reservation.domain.vo.PhoneNumber;
import com.example.reservation.dto.ReservationRequestDto;
import com.example.reservation.dto.ReservationResponseDto;
import com.example.reservation.redis.RedisService;
import com.example.reservation.repository.ReservationRepository;
import com.example.reservation.repository.SeatRepository;
import com.example.reservation.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@SpringBootTest
class SeatServiceTest {

    @InjectMocks
    private SeatService seatService;

    @Mock
    private SeatRepository seatRepository;

    @Mock
    private ReservationRepository reservationRepository;

    @Mock
    private RedisService redisService;

    @Mock
    private UserRepository userRepository;

    private ReservationRequestDto requestDto;
    private Seat mockSeat;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        requestDto = new ReservationRequestDto();
        ReflectionTestUtils.setField(requestDto, "seatId", 1L);
        ReflectionTestUtils.setField(requestDto, "userName", "홍길동");
        ReflectionTestUtils.setField(requestDto, "phone", "010-1234-5678");
        ReflectionTestUtils.setField(requestDto, "sessionId", "s1");

        mockSeat = Seat.builder()
                .id(1L)
                .seatNumber("A1")
                .isReserved(false)
                .build();
    }

    @Test
    void 좌석예약_성공() {
        // given
        when(redisService.getValue("seat:1")).thenReturn("s1");
        when(seatRepository.findById(1L)).thenReturn(Optional.of(mockSeat));
        when(userRepository.findByPhone(new PhoneNumber("010-1234-5678"))).thenReturn(Optional.empty());
        when(userRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(seatRepository.save(any())).thenReturn(mockSeat);

        // when
        ReservationResponseDto response = seatService.reserveSeat(requestDto);

        // then
        assertThat(response).isNotNull();
        assertThat(response.getSeatId()).isEqualTo(1L);
        assertThat(response.getUserName()).isEqualTo("홍길동");
    }

    @Test
    void 좌석예약_권한없음_예외() {
        // given
        when(redisService.getValue("seat:1")).thenReturn("다른세션");

        // when & then
        assertThatThrownBy(() -> seatService.reserveSeat(requestDto))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("예약 권한이 없습니다");
    }

    @Test
    void 좌석예약_이미예약됨_예외() {
        // given
        mockSeat.setReserved(true);
        when(redisService.getValue("seat:1")).thenReturn("s1");
        when(seatRepository.findById(1L)).thenReturn(Optional.of(mockSeat));

        // when & then
        assertThatThrownBy(() -> seatService.reserveSeat(requestDto))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("이미 예약된 좌석입니다");
    }
}