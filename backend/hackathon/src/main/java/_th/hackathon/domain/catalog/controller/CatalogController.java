package _th.hackathon.domain.catalog.controller;

import _th.hackathon.domain.catalog.dto.PerfSeatRes;
import _th.hackathon.domain.catalog.dto.PerformanceTimeRes;
import _th.hackathon.domain.catalog.dto.ShowTitleRes;
import _th.hackathon.domain.catalog.entity.Performance;
import _th.hackathon.domain.catalog.entity.PerformanceSeat;
import _th.hackathon.domain.catalog.entity.Show;
import _th.hackathon.domain.catalog.service.CatalogService;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CatalogController {

    private final CatalogService catalogService;

    // 쇼 목록: 제목만
    @GetMapping("/shows")
    public List<ShowTitleRes> shows() {
        List<Show> list = catalogService.getShows();
        return list.stream()
                .map(s -> new ShowTitleRes(s.getId(), s.getTitle()))
                .toList();
    }

    // 특정 쇼의 회차 목록: 쇼 제목 + 시작 시간
    @GetMapping("/shows/{showId}/performances")
    public List<PerformanceTimeRes> performances(@PathVariable Long showId) {
        List<Performance> list = catalogService.getPerformances(showId);
        return list.stream()
                .map(p -> new PerformanceTimeRes(
                        p.getId(),
                        p.getShow().getTitle(),
                        p.getStartsAt()
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    @GetMapping("/performances/{performanceId}/seats")
    public List<PerfSeatRes> availableSeats(@PathVariable Long performanceId) {
        return catalogService.getAvailableSeats(performanceId).stream()
                .map(ps -> new PerfSeatRes(
                        ps.getId(),
                        ps.getSeatNo()
                ))
                .toList();
    }
}