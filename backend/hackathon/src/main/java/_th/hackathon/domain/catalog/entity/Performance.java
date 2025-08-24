package _th.hackathon.domain.catalog.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Entity
@Table(name="performance")
@Getter
@NoArgsConstructor(access=AccessLevel.PROTECTED) @AllArgsConstructor @Builder
public class Performance {
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="show_id", nullable=false)
    private Show show;

    @Column(name="starts_at", nullable=false)
    private LocalDateTime startsAt;
}
