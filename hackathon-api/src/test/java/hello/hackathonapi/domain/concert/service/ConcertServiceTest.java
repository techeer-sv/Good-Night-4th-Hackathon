package hello.hackathonapi.domain.concert.service;

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

import hello.hackathonapi.domain.concert.dto.ConcertCreateRequest;
import hello.hackathonapi.domain.concert.dto.ConcertUpdateRequest;
import hello.hackathonapi.domain.concert.entity.Concert;
import hello.hackathonapi.domain.concert.repository.ConcertRepository;
import hello.hackathonapi.global.error.exception.BusinessException;
import hello.hackathonapi.global.error.exception.ErrorCode;

@ExtendWith(MockitoExtension.class)
class ConcertServiceTest {
    
    @Mock
    private ConcertRepository concertRepository;
    
    @InjectMocks
    private ConcertService concertService;
    
    @Test
    @DisplayName("공연 등록 성공")
    void createConcert_Success() {
        // given
        ConcertCreateRequest request = new ConcertCreateRequest();
        request.setName("테스트 공연");
        request.setDescription("테스트 공연 설명");
        request.setDate("2024-03-01");
        
        Concert concert = Concert.builder()
            .name(request.getName())
            .description(request.getDescription())
            .date(request.getDate())
            .build();
        
        when(concertRepository.save(any(Concert.class))).thenReturn(concert);
        
        // when
        Concert result = concertService.createConcert(request);
        
        // then
        assertThat(result.getName()).isEqualTo("테스트 공연");
        assertThat(result.getDescription()).isEqualTo("테스트 공연 설명");
        assertThat(result.getDate()).isEqualTo("2024-03-01");
        
        verify(concertRepository).save(any(Concert.class));
    }
    
    
    @Test
    @DisplayName("공연 전체 조회 성공")
    void getAllConcerts_Success() {
        // given
        List<Concert> concerts = Arrays.asList(
            Concert.builder()
                .name("공연1")
                .description("설명1")
                .date("2024-03-01")
                .build(),
            Concert.builder()
                .name("공연2")
                .description("설명2")
                .date("2024-03-15")
                .build()
        );
        
        when(concertRepository.findAll()).thenReturn(concerts);
        
        // when
        List<Concert> result = concertService.getAllConcerts();
        
        // then
        assertThat(result).hasSize(2);
        assertThat(result.get(0).getName()).isEqualTo("공연1");
        assertThat(result.get(1).getName()).isEqualTo("공연2");
        
        verify(concertRepository).findAll();
    }
    
    @Test
    @DisplayName("공연 전체 조회 실패 - 공연이 존재하지 않음")
    void getAllConcerts_Fail_NoContent() {
        // given
        when(concertRepository.findAll()).thenReturn(List.of());
        
        // when & then
        assertThatThrownBy(() -> concertService.getAllConcerts())
            .isInstanceOf(BusinessException.class)
            .hasFieldOrPropertyWithValue("errorCode", ErrorCode.CONCERT_LIST_EMPTY);
            
        verify(concertRepository).findAll();
    }
    
    @Test
    @DisplayName("공연 수정 성공")
    void updateConcert_Success() {
        // given
        Long concertId = 1L;
        ConcertUpdateRequest request = new ConcertUpdateRequest();
        request.setName("수정된 공연");
        request.setDescription("수정된 설명");
        request.setDate("2024-03-01");
        
        Concert existingConcert = Concert.builder()
            .name("기존 공연")
            .description("기존 설명")
            .date("2024-02-01")
            .build();
        
        when(concertRepository.findById(concertId)).thenReturn(Optional.of(existingConcert));
        when(concertRepository.save(any(Concert.class))).thenReturn(existingConcert);
        
        // when
        Concert result = concertService.updateConcert(concertId, request);
        
        // then
        assertThat(result.getName()).isEqualTo("수정된 공연");
        assertThat(result.getDescription()).isEqualTo("수정된 설명");
        assertThat(result.getDate()).isEqualTo("2024-03-01");
        
        verify(concertRepository).findById(concertId);
    }
    
    @Test
    @DisplayName("공연 수정 실패 - 존재하지 않는 공연")
    void updateConcert_Fail_ConcertNotFound() {
        // given
        Long concertId = 999L;
        ConcertUpdateRequest request = new ConcertUpdateRequest();
        request.setName("수정된 공연");
        request.setDescription("수정된 설명");
        request.setDate("2024-03-01");
        
        when(concertRepository.findById(concertId)).thenReturn(Optional.empty());
        
        // when & then
        assertThatThrownBy(() -> concertService.updateConcert(concertId, request))
            .isInstanceOf(BusinessException.class)
            .hasFieldOrPropertyWithValue("errorCode", ErrorCode.CONCERT_NOT_FOUND);
            
        verify(concertRepository).findById(concertId);
    }
    
    @Test
    @DisplayName("공연 삭제 성공")
    void deleteConcert_Success() {
        // given
        Long concertId = 1L;
        Concert concert = Concert.builder()
            .name("삭제할 공연")
            .description("삭제할 설명")
            .date("2024-03-01")
            .build();
        
        when(concertRepository.findById(concertId)).thenReturn(Optional.of(concert));
        
        // when
        Concert result = concertService.deleteConcert(concertId);
        
        // then
        assertThat(result.getName()).isEqualTo("삭제할 공연");
        
        verify(concertRepository).findById(concertId);
        verify(concertRepository).delete(concert);
    }
    
    @Test
    @DisplayName("공연 삭제 실패 - 존재하지 않는 공연")
    void deleteConcert_Fail_ConcertNotFound() {
        // given
        Long concertId = 999L;
        
        when(concertRepository.findById(concertId)).thenReturn(Optional.empty());
        
        // when & then
        assertThatThrownBy(() -> concertService.deleteConcert(concertId))
            .isInstanceOf(BusinessException.class)
            .hasFieldOrPropertyWithValue("errorCode", ErrorCode.CONCERT_NOT_FOUND);
            
        verify(concertRepository).findById(concertId);
        verify(concertRepository, never()).delete(any(Concert.class));
    }
}