package com.goodnight.ticket_service.domain;

import com.goodnight.ticket_service.exception.SeatAlreadyReservedException;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
public class Seat {

    @Id
    @GeneratedValue // 자동 생성 ID
    @Column(name = "seat_id")
    private Long id;

    private String seatCode; // 좌석 코드

    @Enumerated(EnumType.STRING)
    private SeatStatus status; // 좌석 상태 (예: 사용 가능 available, 예약됨 reserved)

    /*
     * 좌석 상태 변경
     */
    public void changeStatus(SeatStatus newStatus) {
        if (newStatus == null) {
            throw new IllegalArgumentException("새로운 상태는 null일 수 없습니다.");
        }

        // 이미 예약된 좌석을 다시 예약하려고 할 때 예외 발생
        if (this.status == SeatStatus.RESERVED && newStatus == SeatStatus.RESERVED) {
            throw new SeatAlreadyReservedException("이미 예약된 좌석입니다.");
        }

        this.status = newStatus;
    }

    /*
     * 좌석이 사용 가능한지 확인
     */
    public boolean isAvailable() {
        return this.status == SeatStatus.AVAILABLE;
    }

    /*
     * 좌석이 예약되었는지 확인
     */
    public boolean isReserved() {
        return this.status == SeatStatus.RESERVED;
    }
}
