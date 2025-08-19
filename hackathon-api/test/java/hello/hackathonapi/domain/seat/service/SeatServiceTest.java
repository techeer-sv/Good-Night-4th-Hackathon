package hello.hackathonapi.domain.seat.service;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import hello.hackathonapi.domain.concert.entity.Concert;
import hello.hackathonapi.domain.concert.repository.ConcertRepository;
import hello.hackathonapi.domain.seat.dto.SeatCreateRequest;
import hello.hackathonapi.domain.seat.dto.SeatUpdateRequest;
import hello.hackathonapi.domain.seat.entity.Seat;
import hello.hackathonapi.domain.seat.entity.SeatGrade;
import hello.hackathonapi.domain.seat.entity.SeatStatus;
import hello.hackathonapi.domain.seat.repository.SeatRepository;
import hello.hackathonapi.global.error.exception.BusinessException;
import hello.hackathonapi.global.error.exception.ErrorCode;

@ExtendWith(MockitoExtension.class)
class SeatServiceTest {
    
    @Mock
    private SeatRepository seatRepository;
    
    @Mock
    private ConcertRepository concertRepository;
    
    @InjectMocks
    private SeatService seatService;
    
    @Test
    @DisplayName("좌석 생성 성공")
    void createSeat_Success() {
        // given
        Long concertId = 1L;
        Concert concert = Concert.builder()
            .name("테스트 공연")
            .description("테스트 공연 설명")
            .date("2024-03-01")
            .build();

        SeatCreateRequest request = new SeatCreateRequest();
        request.setNumber(1);
        request.setGrade(SeatGrade.VIP);
        request.setPrice(50000);
        request.setStatus(SeatStatus.AVAILABLE);
        
        Seat seat = Seat.builder()
            .concert(concert)
            .number(request.getNumber())
            .grade(request.getGrade())
            .price(request.getPrice())
            .status(request.getStatus())
            .build();

        when(concertRepository.findById(concertId)).thenReturn(Optional.of(concert));
        
        when(seatRepository.save(any(Seat.class))).thenReturn(seat);
        
        // when
        Seat result = seatService.createSeat(concertId, request);
        
        // then
        assertThat(result.getConcert()).isEqualTo(concert);
        assertThat(result.getNumber()).isEqualTo(1);
        assertThat(result.getGrade()).isEqualTo(SeatGrade.VIP);
        assertThat(result.getPrice()).isEqualTo(50000);
        assertThat(result.getStatus()).isEqualTo(SeatStatus.AVAILABLE);
        
        verify(seatRepository).save(any(Seat.class));
    }
    
    @Test
    @DisplayName("좌석 전체 조회 성공")
    void getAllSeats_Success() {
        // given
        Concert concert = Concert.builder()
            .name("테스트 공연")
            .description("테스트 공연 설명")
            .date("2024-03-01")
            .build();

        List<Seat> seats = Arrays.asList(
            Seat.builder()
                .concert(concert)
                .number(1)
                .grade(SeatGrade.VIP)
                .price(50000)
                .status(SeatStatus.AVAILABLE)
                .build(),
            Seat.builder()
                .concert(concert)
                .number(2)
                .grade(SeatGrade.NORMAL)
                .price(30000)
                .status(SeatStatus.AVAILABLE)
                .build()
        );
        
        Long concertId = 1L;
        when(concertRepository.findById(concertId)).thenReturn(Optional.of(concert));
        when(seatRepository.findByConcert(concert)).thenReturn(seats);
        
        // when
        List<Seat> result = seatService.getAllSeats(concertId);
        
        // then
        assertThat(result).hasSize(2);
        assertThat(result.get(0).getNumber()).isEqualTo(1);
        assertThat(result.get(0).getGrade()).isEqualTo(SeatGrade.VIP);
        assertThat(result.get(1).getNumber()).isEqualTo(2);
        assertThat(result.get(1).getGrade()).isEqualTo(SeatGrade.NORMAL);
        
        verify(seatRepository).findByConcert(concert);
    }
    
    @Test
    @DisplayName("좌석 전체 조회 실패 - 좌석이 존재하지 않음")
    void getAllSeats_Fail_NoContent() {
        // given
        Long concertId = 1L;
        Concert concert = Concert.builder()
            .name("테스트 공연")
            .description("테스트 공연 설명")
            .date("2024-03-01")
            .build();

        when(concertRepository.findById(concertId)).thenReturn(Optional.of(concert));
        when(seatRepository.findByConcert(concert)).thenReturn(List.of());
        
        // when & then
        assertThatThrownBy(() -> seatService.getAllSeats(concertId))
            .isInstanceOf(BusinessException.class)
            .hasFieldOrPropertyWithValue("errorCode", ErrorCode.SEAT_LIST_EMPTY);
            
        verify(seatRepository).findByConcert(concert);
    }
    
    @Test
    @DisplayName("좌석 수정 성공")
    void updateSeat_Success() {
        // given
        Long seatId = 1L;
        Long concertId = 1L;
        Concert concert = Concert.builder()
            .name("테스트 공연")
            .description("테스트 공연 설명")
            .date("2024-03-01")
            .build();

        SeatUpdateRequest request = new SeatUpdateRequest();
        request.setNumber(2);
        request.setGrade(SeatGrade.VVIP);
        request.setPrice(100000);
        request.setStatus(SeatStatus.RESERVED);
        
        Seat existingSeat = Seat.builder()
            .concert(concert)
            .number(1)
            .grade(SeatGrade.VIP)
            .price(50000)
            .status(SeatStatus.AVAILABLE)
            .build();
        
        when(seatRepository.findById(seatId)).thenReturn(Optional.of(existingSeat));
        
        // when
        Seat result = seatService.updateSeat(seatId, concertId, request);
        
        // then
        assertThat(result.getNumber()).isEqualTo(2);
        assertThat(result.getGrade()).isEqualTo(SeatGrade.VVIP);
        assertThat(result.getPrice()).isEqualTo(100000);
        assertThat(result.getStatus()).isEqualTo(SeatStatus.RESERVED);
        
        verify(seatRepository).findById(seatId);
    }
    
    @Test
    @DisplayName("좌석 수정 실패 - 존재하지 않는 좌석")
    void updateSeat_Fail_SeatNotFound() {
        // given
        Long seatId = 999L;
        Long concertId = 1L;
        SeatUpdateRequest request = new SeatUpdateRequest();
        request.setNumber(2);
        request.setGrade(SeatGrade.VVIP);
        request.setPrice(100000);
        request.setStatus(SeatStatus.RESERVED);
        
        when(seatRepository.findById(seatId)).thenReturn(Optional.empty());
        
        // when & then
        assertThatThrownBy(() -> seatService.updateSeat(seatId, concertId, request))
            .isInstanceOf(BusinessException.class)
            .hasFieldOrPropertyWithValue("errorCode", ErrorCode.SEAT_NOT_FOUND);
            
        verify(seatRepository).findById(seatId);
    }
    
    @Test
    @DisplayName("좌석 삭제 성공")
    void deleteSeat_Success() {
        // given
        Long seatId = 1L;
        Concert concert = Concert.builder()
            .name("테스트 공연")
            .description("테스트 공연 설명")
            .date("2024-03-01")
            .build();

        Seat seat = Seat.builder()
            .concert(concert)
            .number(1)
            .grade(SeatGrade.VIP)
            .price(50000)
            .status(SeatStatus.AVAILABLE)
            .build();
        
        when(seatRepository.findById(seatId)).thenReturn(Optional.of(seat));
        
        // when
        Seat result = seatService.deleteSeat(seatId);
        
        // then
        assertThat(result.getNumber()).isEqualTo(1);
        assertThat(result.getGrade()).isEqualTo(SeatGrade.VIP);
        
        verify(seatRepository).findById(seatId);
        verify(seatRepository).delete(seat);
    }
    
    @Test
    @DisplayName("좌석 삭제 실패 - 존재하지 않는 좌석")
    void deleteSeat_Fail_SeatNotFound() {
        // given
        Long seatId = 999L;
        
        when(seatRepository.findById(seatId)).thenReturn(Optional.empty());
        
        // when & then
        assertThatThrownBy(() -> seatService.deleteSeat(seatId))
            .isInstanceOf(BusinessException.class)
            .hasFieldOrPropertyWithValue("errorCode", ErrorCode.SEAT_NOT_FOUND);
            
        verify(seatRepository).findById(seatId);
        verify(seatRepository, never()).delete(any(Seat.class));
    }
}
