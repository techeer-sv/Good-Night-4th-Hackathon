package _th.hackathon.domain.catalog.repository;

import _th.hackathon.common.InventoryStatus;
import _th.hackathon.domain.catalog.entity.PerformanceSeat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PerformanceSeatRepository extends JpaRepository<PerformanceSeat, Long> {

    // 좌석번호 기준으로 정렬
    List<PerformanceSeat> findByPerformanceIdOrderBySeatNoAsc(Long performanceId);

    // CAS: AVAILABLE -> SOLD (원자적)
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = "UPDATE performance_seat SET status='SOLD' WHERE id=:psId AND status='AVAILABLE'", nativeQuery = true)
    int tryMarkSold(@Param("psId") Long performanceSeatId);

    // CAS: SOLD -> AVAILABLE (멱등)
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = "UPDATE performance_seat SET status='AVAILABLE' WHERE id=:psId AND status='SOLD'", nativeQuery = true)
    int releaseSold(@Param("psId") Long performanceSeatId);

    // (선택) 좌석 자동 생성 유틸 등에 유용
    long countByPerformanceId(Long performanceId);
}