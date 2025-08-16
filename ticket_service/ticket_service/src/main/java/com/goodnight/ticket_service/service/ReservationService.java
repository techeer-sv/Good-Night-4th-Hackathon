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

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class ReservationService {
    private final SeatRepository seatRepository;
    private final MemberRepository memberRepository;
    private final ReservationRepository reservationRepository;
    private final Random random = new Random();

    /*
     * 좌석 예약 처리 (99% 성공, 1% 실패)
     */
    @Transactional
    public ReservationResponseDto reserveSeat(ReservationRequestDto requestDto) {
        // 1% 확률로 의도적 실패 처리
        if (random.nextInt(100) == 0) {
            return ReservationResponseDto.builder()
                    .status("FAILED")
                    .message("시스템 일시적 오류로 예약에 실패했습니다. 다시 시도해주세요.")
                    .build();
        }

        try {
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
            Reservation reservation = new Reservation();
            reservation.setMember(member);
            reservation.setReservationDate(LocalDateTime.now());

            // 예약 좌석 연결
            ReservationSeat reservationSeat = new ReservationSeat();
            reservationSeat.setSeat(seat);
            reservationSeat.setReservation(reservation);

            // 좌석 상태 변경
            seat.changeStatus(SeatStatus.RESERVED);

            // 저장
            reservationRepository.save(reservation);
            seatRepository.save(seat);

            return ReservationResponseDto.builder()
                    .reservationId(reservation.getId())
                    .seatId(seat.getId())
                    .seatCode(seat.getSeatCode())
                    .memberName(member.getName())
                    .status("SUCCESS")
                    .reservationDate(reservation.getReservationDate())
                    .message("좌석 예약이 성공적으로 완료되었습니다.")
                    .build();

        } catch (Exception e) {
            return ReservationResponseDto.builder()
                    .status("FAILED")
                    .message("예약 처리 중 오류가 발생했습니다: " + e.getMessage())
                    .build();
        }
    }

    /*
     * 회원 조회 또는 생성
     */
    private Member findOrCreateMember(String memberName) {
        List<Member> existingMembers = memberRepository.findByName(memberName);
        if (!existingMembers.isEmpty()) {
            return existingMembers.get(0);
        }

        Member newMember = new Member();
        newMember.setName(memberName);
        memberRepository.save(newMember);
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
        return reservationRepository.findByMemberId(memberId);
    }

    /*
     * 예약 상세 조회
     */
    public Reservation findReservationById(Long reservationId) {
        return reservationRepository.findById(reservationId);
    }
}