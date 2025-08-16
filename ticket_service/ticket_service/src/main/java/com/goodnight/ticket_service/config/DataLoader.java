package com.goodnight.ticket_service.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.goodnight.ticket_service.domain.Seat;
import com.goodnight.ticket_service.domain.SeatStatus;
import com.goodnight.ticket_service.repository.SeatRepository;

import lombok.RequiredArgsConstructor;

/* 
 * 초기 좌석 데이터 생성
 * Spring Boot에서 애플리케이션 시작 시 자동으로 실행되는 코드 블록이에요.
 * 앱이 켜질 때 **기본 데이터(Seed Data)**를 DB에 미리 넣고 싶을 때
 * 예: 좌석 목록, 기본 관리자 계정, 테스트용 샘플 데이터
 * 개발/테스트 환경에서 편하게 데이터 초기화
 */

@Component
@RequiredArgsConstructor
@Transactional
public class DataLoader implements CommandLineRunner {

    private final SeatRepository seatRepository;

    @Override
    public void run(String... args) throws Exception {
        // 초기 좌석 데이터 생성 (A1~A10, B1~B10)
        createInitialSeats();
    }

    private void createInitialSeats() {
        // A열 좌석 생성
        for (int i = 1; i <= 3; i++) {
            Seat seat = new Seat();
            seat.setSeatCode("A" + i);
            seat.setStatus(SeatStatus.AVAILABLE);
            seatRepository.save(seat);
        }

        // B열 좌석 생성
        for (int i = 1; i <= 3; i++) {
            Seat seat = new Seat();
            seat.setSeatCode("B" + i);
            seat.setStatus(SeatStatus.AVAILABLE);
            seatRepository.save(seat);
        }

        // C열 좌석 생성
        for (int i = 1; i <= 3; i++) {
            Seat seat = new Seat();
            seat.setSeatCode("C" + i);
            seat.setStatus(SeatStatus.AVAILABLE);
            seatRepository.save(seat);
        }

    }
}