package org.own.backend.seats;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.Id;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import org.hibernate.annotations.Check;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "seats")
@Check(constraints = "(status = 'AVAILABLE' AND reserver_name IS NULL AND reserver_phone IS NULL) OR (status = 'UNAVAILABLE' AND reserver_name IS NOT NULL AND reserver_phone IS NOT NULL)")
@Getter
@Setter
@NoArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Seat {

    @Id
    @Column(name = "seat_id", nullable = false)
    private Integer seatId;

    @Column(name = "status", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private SeatStatus status = SeatStatus.AVAILABLE;

    @Column(name = "reserver_name", length = 50)
    private String reserverName;

    @Column(name = "reserver_phone", length = 20)
    private String reserverPhone;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}


