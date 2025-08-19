package hello.hackathonapi.domain.reservation.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import hello.hackathonapi.domain.member.entity.Member;
import hello.hackathonapi.domain.member.repository.MemberRepository;
import hello.hackathonapi.domain.reservation.entity.Reservation;
import hello.hackathonapi.domain.reservation.event.EventPublisher;
import hello.hackathonapi.domain.reservation.repository.RedisLockRepository;
import hello.hackathonapi.domain.reservation.repository.ReservationRepository;
import hello.hackathonapi.domain.seat.entity.Seat;
import hello.hackathonapi.domain.seat.repository.SeatRepository;
import hello.hackathonapi.global.error.exception.BusinessException;
import hello.hackathonapi.global.error.exception.ErrorCode;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReservationService {
    private static final String LOCK_PREFIX = "seat:";
    
    private final ReservationRepository reservationRepository;
    private final RedisLockRepository redisLockRepository;
    private final SeatRepository seatRepository;
    private final MemberRepository memberRepository;
    private final EventPublisher eventPublisher;

    // 예약 취소
    @Transactional
    public Reservation cancelReservation(Long concertId, Long reservationId, Long memberId) {
        // 1. 예약 조회 및 검증 (락 획득 전에 먼저 조회)
        Reservation reservation = reservationRepository.findById(reservationId)
            .orElseThrow(() -> new BusinessException(ErrorCode.RESERVATION_NOT_FOUND));
            
        // 2. 좌석 ID로 락 키 생성
        String lockKey = LOCK_PREFIX + reservation.getSeatId().getId();
        
        try {
            // 3. 락 획득 시도
            if (!redisLockRepository.lock(lockKey)) {
                throw new BusinessException(ErrorCode.SEAT_ALREADY_IN_PROGRESS);
            }
            
            // 4. 예약 검증
            
            // 2-1. 예약한 사용자가 맞는지 확인
            if (!reservation.getMemberId().getId().equals(memberId)) {
                throw new BusinessException(ErrorCode.RESERVATION_NOT_AUTHORIZED);
            }
            
            // 2-2. 예약이 해당 공연의 것인지 확인
            if (!reservation.getSeatId().getConcert().getId().equals(concertId)) {
                throw new BusinessException(ErrorCode.RESERVATION_NOT_IN_CONCERT);
            }
            
            // 3. 예약 취소 처리
            reservation.cancel();
            
            // 4. 좌석 상태 변경 사항 저장
            seatRepository.saveAndFlush(reservation.getSeatId());
            
            // 5. 이벤트 발행
            eventPublisher.publishEvent(reservation.getSeatId().getId(), reservation.getSeatId().getStatus());
            
            return reservation; // 더티 체킹으로 인해 자동 저장됨
            
        } catch (BusinessException e) {
            log.error("Business error occurred during cancellation. concertId: {}, reservationId: {}, memberId: {}, error: {}", 
                concertId, reservationId, memberId, e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Cancellation failed. concertId: {}, reservationId: {}, memberId: {}", concertId, reservationId, memberId, e);
            throw new BusinessException(ErrorCode.RESERVATION_CANCELLATION_FAILED);
        } finally {
            // 5. 락 해제
            try {
                redisLockRepository.unlock(lockKey);
            } catch (Exception e) {
                log.error("Failed to release lock for key: {}", lockKey, e);
            }
        }
    }

    // 예약 생성
    @Transactional(noRollbackFor = BusinessException.class)
    public Reservation createReservation(Long concertId, Long seatId, Long memberId) {
        String lockKey = LOCK_PREFIX + seatId;
        
        try {
            // 1. 락 획득 시도
            if (!redisLockRepository.lock(lockKey)) {
                throw new BusinessException(ErrorCode.SEAT_ALREADY_IN_PROGRESS);
            }
            
            // 2. 엔티티 조회 및 검증
            Seat seat = seatRepository.findById(seatId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SEAT_NOT_FOUND));
            
            // 2-1. 좌석이 해당 공연의 것인지 확인
            if (!seat.getConcert().getId().equals(concertId)) {
                throw new BusinessException(ErrorCode.SEAT_NOT_IN_CONCERT);
            }
                
            Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
            
            // 3. 좌석 상태 검증 및 변경
            seat.validateAvailable();
            seat.reserve();
            seatRepository.saveAndFlush(seat); // 즉시 저장 및 flush
            
            // 4. 예약 생성 및 저장
            Reservation reservation = Reservation.createReservation(member, seat);
            reservation = reservationRepository.saveAndFlush(reservation);
            
            // 5. 이벤트 발행
            eventPublisher.publishEvent(seatId, seat.getStatus());
            
            return reservation;
            
        } catch (BusinessException e) {
            log.error("Business error occurred during reservation. concertId: {}, seatId: {}, memberId: {}, error: {}", 
                concertId, seatId, memberId, e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Reservation failed. concertId: {}, seatId: {}, memberId: {}", concertId, seatId, memberId, e);
            throw new BusinessException(ErrorCode.RESERVATION_FAILED);
        } finally {
            // 5. 락 해제
            try {
                redisLockRepository.unlock(lockKey);
            } catch (Exception e) {
                log.error("Failed to release lock for key: {}", lockKey, e);
            }
        }
    }
}