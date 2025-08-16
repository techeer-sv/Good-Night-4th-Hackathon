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

    @Column(name = "reserver_name", nullable = false, length = 50)
    private String reserverName;

    @Column(name = "reserver_phone", nullable = false, length = 20)
    private String reserverPhone;

    @PrePersist void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) this.status = ReservationStatus.PAID;
        validate();
    }

    public void cancel() { this.status = ReservationStatus.CANCELLED; }

    private void validate() {
        if (reserverName == null || reserverName.isBlank()) {
            throw new IllegalArgumentException("예약자 이름은 필수입니다.");
        }
        if (reserverPhone == null || reserverPhone.isBlank()) {
            throw new IllegalArgumentException("예약자 전화번호는 필수입니다.");
        }
        // 해커톤용 아주 간단한 형식 체크(숫자와 하이픈만, 7~20자)
        if (!reserverPhone.matches("^[0-9\\-]{7,20}$")) {
            throw new IllegalArgumentException("전화번호 형식이 올바르지 않습니다.");
        }
    }
}