package hello.hackathonapi.domain.seat.entity;

import hello.hackathonapi.domain.concert.entity.Concert;
import hello.hackathonapi.domain.seat.dto.SeatUpdateRequest;
import hello.hackathonapi.global.error.exception.BusinessException;
import hello.hackathonapi.global.error.exception.ErrorCode;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "seats")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class Seat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "seat_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "concert_id", nullable = false)
    private Concert concert;

    @Column(name = "seat_number", nullable = false)
    private Integer number;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SeatGrade grade;

    @Column(nullable = false)
    private Integer price;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SeatStatus status;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Builder
    public Seat(Concert concert, Integer number, SeatGrade grade, Integer price, SeatStatus status) {
        this.concert = concert;
        this.number = number;
        this.grade = grade;
        this.price = price;
        this.status = status;
    }

    public void update(SeatUpdateRequest request) {
        this.number = request.getNumber();
        this.grade = request.getGrade();
        this.price = request.getPrice();
        this.status = request.getStatus();
    }

    public void validateAvailable() {
        if (this.status != SeatStatus.AVAILABLE) {
            throw new BusinessException(ErrorCode.SEAT_NOT_AVAILABLE);
        }
    }

    public void reserve() {
        validateAvailable();
        this.status = SeatStatus.RESERVED;
    }

    public void cancel() {
        this.status = SeatStatus.AVAILABLE;
    }

    // 테스트용 메서드
    public void setStatus(SeatStatus status) {
        this.status = status;
    }
}
