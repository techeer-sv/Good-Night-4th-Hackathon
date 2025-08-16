package _th.hackathon.domain.catalog.repository;

import _th.hackathon.domain.catalog.entity.Performance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PerformanceRepository extends JpaRepository<Performance, Long> {
    List<Performance> findByShowIdOrderByStartsAtAsc(Long showId);
}