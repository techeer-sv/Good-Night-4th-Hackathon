package _th.hackathon.domain.reservation.entity;

import _th.hackathon.common.ReservationStatus;
import _th.hackathon.domain.catalog.entity.PerformanceSeat;
import _th.hackathon.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Entity
@Table(name = "reservation")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Reservation {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "performance_seat_id", nullable = false)
    private PerformanceSeat performanceSeat;

    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 10)
    private ReservationStatus status; // PAID, CANCELLED

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) this.status = ReservationStatus.PAID;
    }

    public void cancel() { this.status = ReservationStatus.CANCELLED; }
}