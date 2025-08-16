package com.goodnight.ticket_service.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Table(name = "reservation_seats")
@Entity
@NoArgsConstructor(access = lombok.AccessLevel.PROTECTED)
public class ReservationSeat {

    @Id
    @GeneratedValue // 자동 생성 ID
    @Column(name = "reservation_seat_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seat_id")
    // 예약 좌석과 좌석은 N:1 관계이므로, 예약 좌석은 하나의 좌석에 속합니다.
    private Seat seat;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id")
    // 예약 좌석과 예약은 N:1 관계이므로, 예약 좌석은 하나의 예약에 속합니다.
    private Reservation reservation;

    // -- 생성자 -- //
    public static ReservationSeat createReservationSeat(Seat seat, Reservation reservation) {
        ReservationSeat reservationSeat = new ReservationSeat();
        reservationSeat.setSeat(seat);
        return reservationSeat;
    }

    // -- 연관관계 편의 메서드 -- //
    public void cancel() {

    }
}
