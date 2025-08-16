package com.goodnight.ticket_service.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.goodnight.ticket_service.domain.Member;
import com.goodnight.ticket_service.domain.Reservation;
import com.goodnight.ticket_service.domain.ReservationSeat;
import com.goodnight.ticket_service.domain.Seat;
import com.goodnight.ticket_service.domain.SeatStatus;
import com.goodnight.ticket_service.dto.ReservationRequestDto;
import com.goodnight.ticket_service.dto.ReservationResponseDto;
import com.goodnight.ticket_service.exception.SeatAlreadyReservedException;
import com.goodnight.ticket_service.repository.MemberRepository;
import com.goodnight.ticket_service.repository.ReservationRepository;
import com.goodnight.ticket_service.repository.SeatRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
@Slf4j
public class ReservationService {
    private final SeatRepository seatRepository;
    private final MemberRepository memberRepository;
    private final ReservationRepository reservationRepository;
    private final Random random = new Random();

    /*
     * 좌석 예약 처리 (99% 성공, 1% 실패)
     * 실패 시 최대 3번까지 재시도
     */
    @Transactional
    public ReservationResponseDto reserveSeat(ReservationRequestDto requestDto) {
        int maxRetries = 3;
        int retryCount = 0;

        while (retryCount < maxRetries) {
            try {
                return attemptReservation(requestDto, retryCount + 1);
            } catch (Exception e) {
                retryCount++;
                log.warn("예약 시도 {} 실패: {}", retryCount, e.getMessage());

                if (retryCount >= maxRetries) {
                    return ReservationResponseDto.builder()
                            .status("FAILED")
                            .message("여러 번 시도했지만 예약에 실패했습니다. 잠시 후 다시 시도해주세요.")
                            .build();
                }

                // 잠시 대기 후 재시도
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        }

        return ReservationResponseDto.builder()
                .status("FAILED")
                .message("예약 처리 중 오류가 발생했습니다.")
                .build();
    }

    /*
     * 예약 시도
     */
    private ReservationResponseDto attemptReservation(ReservationRequestDto requestDto, int attemptNumber) {
        // 1% 확률로 의도적 실패 처리
        if (random.nextInt(100) == 0) {
            log.info("의도적 실패 발생 (시도 {}번째)", attemptNumber);
            throw new RuntimeException("시스템 일시적 오류로 예약에 실패했습니다. 다시 시도해주세요.");
        }

        // 좌석 조회 및 검증
        Seat seat = seatRepository.findById(requestDto.getSeatId());
        if (seat == null) {
            throw new IllegalArgumentException("존재하지 않는 좌석입니다.");
        }

        if (seat.isReserved()) {
            throw new SeatAlreadyReservedException("이미 예약된 좌석입니다.");
        }

        // 회원 조회 또는 생성
        Member member = findOrCreateMember(requestDto.getMemberName());

        // 예약 생성
        Reservation reservation = new Reservation(member, LocalDateTime.now());

        // 예약 좌석 연결
        ReservationSeat reservationSeat = ReservationSeat.createReservationSeat(seat, reservation);

        // 양방향 관계 설정
        reservation.setReservationSeats(List.of(reservationSeat));

        // 좌석 상태 변경
        seat.changeStatus(SeatStatus.RESERVED);

        // 저장 (Cascade로 ReservationSeat도 함께 저장됨)
        reservationRepository.save(reservation);
        seatRepository.save(seat);

        log.info("예약 성공: 좌석 {}, 회원 {}, 시도 {}번째", seat.getSeatCode(), member.getName(), attemptNumber);

        return ReservationResponseDto.builder()
                .reservationId(reservation.getId())
                .seatId(seat.getId())
                .seatCode(seat.getSeatCode())
                .memberName(member.getName())
                .status("SUCCESS")
                .reservationDate(reservation.getReservationDate())
                .message("좌석 예약이 성공적으로 완료되었습니다.")
                .build();
    }

    /*
     * 회원 조회 또는 생성
     */
    private Member findOrCreateMember(String memberName) {
        if (memberName == null || memberName.trim().isEmpty()) {
            throw new IllegalArgumentException("회원 이름은 필수입니다.");
        }

        List<Member> existingMembers = memberRepository.findByName(memberName.trim());
        if (!existingMembers.isEmpty()) {
            return existingMembers.get(0);
        }

        Member newMember = new Member(memberName.trim());
        memberRepository.save(newMember);
        log.info("새 회원 생성: {}", memberName);
        return newMember;
    }

    /*
     * 예약 목록 조회
     */
    public List<Reservation> findAllReservations() {
        return reservationRepository.findAll();
    }

    /*
     * 회원별 예약 목록 조회
     */
    public List<Reservation> findReservationsByMemberId(Long memberId) {
        if (memberId == null) {
            throw new IllegalArgumentException("회원 ID는 필수입니다.");
        }
        return reservationRepository.findByMemberId(memberId);
    }

    /*
     * 예약 상세 조회
     */
    public Reservation findReservationById(Long reservationId) {
        if (reservationId == null) {
            throw new IllegalArgumentException("예약 ID는 필수입니다.");
        }
        return reservationRepository.findById(reservationId);
    }
}