package _th.hackathon.domain.catalog.entity;

import _th.hackathon.common.InventoryStatus;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Builder;

@Entity
@Table(
        name = "performance_seat",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_perf_seatno",
                columnNames = {"performance_id", "seat_no"}
        )
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class PerformanceSeat {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "performance_id", nullable = false)
    private Performance performance;

    @Column(name = "seat_no", nullable = false)
    private Integer seatNo; // 1 ~ 9

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private InventoryStatus status; // AVAILABLE / SOLD

    @PrePersist void init(){ if (status == null) status = InventoryStatus.AVAILABLE; }
}