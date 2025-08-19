package hello.hackathonapi.domain.reservation.entity;

import hello.hackathonapi.domain.member.entity.Member;
import hello.hackathonapi.domain.seat.entity.Seat;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "reservations")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "reservation_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member memberId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seat_id", nullable = false)
    private Seat seatId;

    @Column(name = "reservation_number", nullable = false, length = 50)
    private String reservationNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ReservationStatus status;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Builder
    private Reservation(Member memberId, Seat seatId, String reservationNumber, ReservationStatus status) {
        this.memberId = memberId;
        this.seatId = seatId;
        this.reservationNumber = reservationNumber;
        this.status = status;
    }

    public static Reservation createReservation(Member memberId, Seat seatId) {
        return Reservation.builder()
            .memberId(memberId)
            .seatId(seatId)
            .reservationNumber(UUID.randomUUID().toString())
            .status(ReservationStatus.CONFIRMED)
            .build();
    }

    public void cancel() {
        this.status = ReservationStatus.CANCELLED;
        this.seatId.cancel();
    }
}
