package _th.hackathon.domain.catalog.service;

import _th.hackathon.common.InventoryStatus;
import _th.hackathon.domain.catalog.entity.Performance;
import _th.hackathon.domain.catalog.entity.PerformanceSeat;
import _th.hackathon.domain.catalog.entity.Show;
import _th.hackathon.domain.catalog.repository.PerformanceRepository;
import _th.hackathon.domain.catalog.repository.PerformanceSeatRepository;
import _th.hackathon.domain.catalog.repository.ShowRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CatalogService {

    private final ShowRepository showRepository;
    private final PerformanceRepository performanceRepository;
    private final PerformanceSeatRepository performanceSeatRepository;

    /** 공연 목록 */
    public List<Show> getShows() {
        return showRepository.findAll();
    }

    /** 특정 공연의 회차 목록(시간 오름차순) */
    public List<Performance> getPerformances(Long showId) {
        return performanceRepository.findByShowIdOrderByStartsAtAsc(showId);
    }

    /** 특정 회차의 가용 좌석(AVAILABLE) 목록 – 등급 순 정렬 권장 */
    public List<PerformanceSeat> getAvailableSeats(Long performanceId) {
        return performanceSeatRepository
                .findByPerformanceIdAndStatusOrderBySeatNoAsc(performanceId, InventoryStatus.AVAILABLE);
    }
}