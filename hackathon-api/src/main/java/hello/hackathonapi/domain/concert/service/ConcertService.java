package hello.hackathonapi.domain.concert.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import hello.hackathonapi.domain.concert.dto.ConcertCreateRequest;
import hello.hackathonapi.domain.concert.dto.ConcertUpdateRequest;
import hello.hackathonapi.domain.concert.entity.Concert;
import hello.hackathonapi.domain.concert.repository.ConcertRepository;
import hello.hackathonapi.global.error.ErrorResponse;
import hello.hackathonapi.global.error.exception.BusinessException;
import hello.hackathonapi.global.error.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ConcertService {
    
    private final ConcertRepository concertRepository;

    // 공연 생성
    @Transactional
    public Concert createConcert(ConcertCreateRequest request) {
        List<ErrorResponse.FieldError> errors = new ArrayList<>();

        if (!errors.isEmpty()) {
            throw new BusinessException(ErrorCode.INVALID_CONCERT_INPUT, errors);
        }

        Concert concert = Concert.builder()
        .name(request.getName())
        .description(request.getDescription())
        .date(request.getDate())
        .build();

        return concertRepository.save(concert);
    }

    // 공연 수정
    @Transactional
    public Concert updateConcert(Long id, ConcertUpdateRequest request) {
        Concert concert = concertRepository.findById(id)
        .orElseThrow(() -> new BusinessException(ErrorCode.CONCERT_NOT_FOUND));
        
        concert.update(request);

        return concertRepository.save(concert);
    }

    // 공연 전체 조회
    public List<Concert> getAllConcerts() {
        List<Concert> concerts = concertRepository.findAll();

        if (concerts.isEmpty()) {
            throw new BusinessException(ErrorCode.CONCERT_LIST_EMPTY);
        }

        return concerts;
    }

    // 공연 단건 조회
    public Concert getConcert(Long id) {
        return concertRepository.findById(id)
            .orElseThrow(() -> new BusinessException(ErrorCode.CONCERT_NOT_FOUND));
    }

    // 공연 단건 삭제
    @Transactional
    public Concert deleteConcert(Long id) {
        Concert concert = concertRepository.findById(id)
        .orElseThrow(() -> new BusinessException(ErrorCode.CONCERT_NOT_FOUND));

        concertRepository.delete(concert);
        return concert;
    }
}
