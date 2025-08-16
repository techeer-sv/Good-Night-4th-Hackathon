package com.goodnight.ticket_service.domain;

import java.time.LocalDateTime;
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
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
public class Reservation {

    @GeneratedValue // 자동 생성 ID
    @Id
    @Column(name = "reservation_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    // 예약과 회원은 N:1 관계이므로, 예약은 하나의 회원에 속합니다.
    private Member member;

    @OneToMany(mappedBy = "reservation", cascade = CascadeType.ALL)
    private List<ReservationSeat> reservationSeats;

    private LocalDateTime reservationDate;

}
