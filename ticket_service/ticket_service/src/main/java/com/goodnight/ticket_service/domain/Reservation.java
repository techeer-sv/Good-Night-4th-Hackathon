package com.goodnight.ticket_service.domain;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "reservations")
public class Reservation {

    @Id
    @GeneratedValue // 자동 생성 ID
    @Column(name = "reservation_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    // 예약과 회원은 N:1 관계이므로, 예약은 하나의 회원에 속합니다.
    private Member member;

    @OneToMany(mappedBy = "reservation", cascade = CascadeType.ALL)
    // 예약과 예약 좌석은 1:N 관계이므로, 예약은 여러 예약 좌석을 가질 수 있습니다.
    private List<ReservationSeat> reservationSeats = new ArrayList<>();

    private LocalDateTime reservationDate;

    // 기본 생성자
    public Reservation() {
    }

    // 전체 생성자
    public Reservation(Member member, LocalDateTime reservationDate) {
        this.member = member;
        this.reservationDate = reservationDate;
    }

    /*
     * 연관관계 편의 메서드
     */

    public void addReservationSeat(ReservationSeat reservationSeat) {
        this.reservationSeats.add(reservationSeat);
        reservationSeat.setReservation(this); // 양방향 연관관계 설정
    }

    public void setReservationSeats(List<ReservationSeat> reservationSeats) {
        this.reservationSeats = reservationSeats;
        if (reservationSeats != null) {
            for (ReservationSeat rs : reservationSeats) {
                rs.setReservation(this);
            }
        }
    }

    // -- 비즈니스 로직 -- //
    public void cancel() {
        // 예약 취소 시 모든 예약 좌석을 취소하고 좌석을 사용 가능 상태로 변경
        this.reservationSeats.forEach(ReservationSeat::cancel);

        // 회원의 예약 목록에서 제거
        if (this.member != null && this.member.getReservations().contains(this)) {
            this.member.getReservations().remove(this);
        }
    }
}
