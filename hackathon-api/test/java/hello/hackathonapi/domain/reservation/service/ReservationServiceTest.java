package hello.hackathonapi.domain.reservation.service;

import hello.hackathonapi.domain.concert.entity.Concert;
import hello.hackathonapi.domain.member.entity.Member;
import hello.hackathonapi.domain.member.repository.MemberRepository;
import hello.hackathonapi.domain.reservation.entity.Reservation;
import hello.hackathonapi.domain.reservation.event.EventPublisher;
import hello.hackathonapi.domain.reservation.repository.RedisLockRepository;
import hello.hackathonapi.domain.reservation.repository.ReservationRepository;
import hello.hackathonapi.domain.seat.entity.Seat;
import hello.hackathonapi.domain.seat.entity.SeatGrade;
import hello.hackathonapi.domain.seat.entity.SeatStatus;
import hello.hackathonapi.domain.seat.repository.SeatRepository;
import hello.hackathonapi.global.error.exception.BusinessException;
import hello.hackathonapi.global.error.exception.ErrorCode;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;
import hello.hackathonapi.domain.reservation.entity.ReservationStatus;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReservationServiceTest {

    @InjectMocks
    private ReservationService reservationService;

    @Mock
    private ReservationRepository reservationRepository;
    @Mock
    private RedisLockRepository redisLockRepository;
    @Mock
    private SeatRepository seatRepository;
    @Mock
    private MemberRepository memberRepository;
    @Mock
    private EventPublisher eventPublisher;

    private Concert concert;
    private Member member;

    @BeforeEach
    void setUp() {
        // Concert 생성
        concert = Concert.builder()
            .name("테스트 공연")
            .description("테스트 공연입니다")
            .date(LocalDateTime.now().plusDays(7).toString())
            .build();
        ReflectionTestUtils.setField(concert, "id", 1L);

        // Member 생성
        member = Member.builder()
            .name("테스트 유저")
            .build();
        ReflectionTestUtils.setField(member, "id", 1L);
    }

    private Seat createAvailableSeat() {
        Seat newSeat = Seat.builder()
            .concert(concert)
            .number(1)
            .grade(SeatGrade.VIP)
            .price(100000)
            .status(SeatStatus.AVAILABLE)
            .build();
        ReflectionTestUtils.setField(newSeat, "id", 1L);
        return newSeat;
    }

    private Reservation createReservationWithoutValidation(Member member, Seat seat) {
        Reservation reservation = Reservation.builder()
            .memberId(member)
            .seatId(seat)
            .reservationNumber(UUID.randomUUID().toString())
            .status(ReservationStatus.CONFIRMED)
            .build();
        seat.setStatus(SeatStatus.RESERVED);
        return reservation;
    }

    @Test
    @DisplayName("예약 생성 성공")
    void createReservation_Success() {
        // given
        Long concertId = 1L;
        Long seatId = 1L;
        Long memberId = 1L;
        Seat availableSeat = createAvailableSeat();

        when(redisLockRepository.lock(anyString())).thenReturn(true);
        when(seatRepository.findById(seatId)).thenReturn(Optional.of(availableSeat));
        when(memberRepository.findById(memberId)).thenReturn(Optional.of(member));
        when(reservationRepository.save(any(Reservation.class))).thenAnswer(invocation -> invocation.getArgument(0));
        doNothing().when(eventPublisher).publishEvent(anyLong(), any(SeatStatus.class));

        // when
        Reservation result = reservationService.createReservation(concertId, seatId, memberId);

        // then
        assertThat(result).isNotNull();
        assertThat(result.getMemberId()).isEqualTo(member);
        assertThat(result.getSeatId()).isEqualTo(availableSeat);
        assertThat(result.getSeatId().getStatus()).isEqualTo(SeatStatus.RESERVED);
        
        verify(redisLockRepository).lock(anyString());
        verify(redisLockRepository).unlock(anyString());
        verify(reservationRepository).save(any(Reservation.class));
        verify(eventPublisher).publishEvent(anyLong(), any(SeatStatus.class));
    }

    @Test
    @DisplayName("예약 생성 실패 - 락 획득 실패")
    void createReservation_FailToAcquireLock() {
        // given
        Long concertId = 1L;
        Long seatId = 1L;
        Long memberId = 1L;

        when(redisLockRepository.lock(anyString())).thenReturn(false);

        // when & then
        assertThatThrownBy(() -> 
            reservationService.createReservation(concertId, seatId, memberId)
        ).isInstanceOf(BusinessException.class)
         .hasFieldOrPropertyWithValue("errorCode", ErrorCode.SEAT_ALREADY_IN_PROGRESS);

        verify(redisLockRepository).lock(anyString());
        verify(redisLockRepository).unlock(anyString());
        verifyNoInteractions(reservationRepository, eventPublisher);
    }

    @Test
    @DisplayName("예약 생성 실패 - 잘못된 공연")
    void createReservation_WrongConcert() {
        // given
        Long wrongConcertId = 999L;
        Long seatId = 1L;
        Long memberId = 1L;

        Seat availableSeat = createAvailableSeat();

        when(redisLockRepository.lock(anyString())).thenReturn(true);
        when(seatRepository.findById(seatId)).thenReturn(Optional.of(availableSeat));

        // when & then
        assertThatThrownBy(() -> 
            reservationService.createReservation(wrongConcertId, seatId, memberId)
        ).isInstanceOf(BusinessException.class)
         .hasFieldOrPropertyWithValue("errorCode", ErrorCode.SEAT_NOT_IN_CONCERT);

        verify(redisLockRepository).lock(anyString());
        verify(redisLockRepository).unlock(anyString());
        verifyNoInteractions(reservationRepository, eventPublisher);
    }

    @Test
    @DisplayName("예약 취소 성공")
    void cancelReservation_Success() {
        // given
        Long concertId = 1L;
        Long reservationId = 1L;
        Long memberId = 1L;
        
        Seat reservedSeat = createAvailableSeat();
        Reservation existingReservation = createReservationWithoutValidation(member, reservedSeat);
        ReflectionTestUtils.setField(existingReservation, "id", reservationId);

        when(redisLockRepository.lock(anyString())).thenReturn(true);
        when(reservationRepository.findById(reservationId)).thenReturn(Optional.of(existingReservation));
        when(reservationRepository.save(any(Reservation.class))).thenAnswer(invocation -> invocation.getArgument(0));
        doNothing().when(eventPublisher).publishEvent(anyLong(), any(SeatStatus.class));

        // when
        Reservation result = reservationService.cancelReservation(concertId, reservationId, memberId);

        // then
        assertThat(result).isNotNull();
        assertThat(result.getSeatId().getStatus()).isEqualTo(SeatStatus.AVAILABLE);
        
        verify(redisLockRepository).lock(anyString());
        verify(redisLockRepository).unlock(anyString());
        verify(reservationRepository).save(any(Reservation.class));
        verify(eventPublisher).publishEvent(anyLong(), any(SeatStatus.class));
    }

    @Test
    @DisplayName("예약 취소 실패 - 권한 없음")
    void cancelReservation_NotAuthorized() {
        // given
        Long concertId = 1L;
        Long reservationId = 1L;
        Long wrongMemberId = 999L;

        Seat reservedSeat = createAvailableSeat();
        Reservation existingReservation = createReservationWithoutValidation(member, reservedSeat);
        ReflectionTestUtils.setField(existingReservation, "id", reservationId);

        when(redisLockRepository.lock(anyString())).thenReturn(true);
        when(reservationRepository.findById(reservationId)).thenReturn(Optional.of(existingReservation));

        // when & then
        assertThatThrownBy(() -> 
            reservationService.cancelReservation(concertId, reservationId, wrongMemberId)
        ).isInstanceOf(BusinessException.class)
         .hasFieldOrPropertyWithValue("errorCode", ErrorCode.RESERVATION_NOT_AUTHORIZED);

        verify(redisLockRepository).lock(anyString());
        verify(redisLockRepository).unlock(anyString());
        verifyNoInteractions(eventPublisher);
    }
}
