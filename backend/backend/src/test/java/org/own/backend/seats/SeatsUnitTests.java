package org.own.backend.seats;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

// ---------------- Repository unit test ----------------
@DataJpaTest
class SeatRepositoryTest {

    @Autowired
    SeatRepository seatRepository;

    @Test
    void findAllByOrderBySeatIdAsc_returnsSorted() {
        // Given: H2 메모리 DB로 JPA CRUD/정렬 검증
        Seat seat3 = new Seat(); 
        seat3.setSeatId(3); 
        seat3.setStatus(SeatStatus.AVAILABLE);
        
        Seat seat1 = new Seat(); 
        seat1.setSeatId(1); 
        seat1.setStatus(SeatStatus.AVAILABLE);
        
        Seat seat2 = new Seat(); 
        seat2.setSeatId(2); 
        seat2.setStatus(SeatStatus.UNAVAILABLE);
        seat2.setReserverName("tester");
        seat2.setReserverPhone("01012345678");
        
        seatRepository.saveAll(Arrays.asList(seat3, seat1, seat2));

        // When: 정렬된 순서로 조회
        List<Seat> result = seatRepository.findAllByOrderBySeatIdAsc();

        // Then: seatId 오름차순으로 정렬됨
        assertThat(result).hasSize(3);
        assertThat(result).extracting(Seat::getSeatId).containsExactly(1, 2, 3);
        assertThat(result.get(0).getStatus()).isEqualTo(SeatStatus.AVAILABLE);
        assertThat(result.get(1).getStatus()).isEqualTo(SeatStatus.UNAVAILABLE);
        assertThat(result.get(2).getStatus()).isEqualTo(SeatStatus.AVAILABLE);
    }

    @Test
    void testBasicCRUD() {
        // Create
        Seat seat = new Seat();
        seat.setSeatId(1);
        seat.setStatus(SeatStatus.AVAILABLE);
        
        Seat saved = seatRepository.save(seat);
        assertThat(saved.getSeatId()).isEqualTo(1);
        assertThat(saved.getStatus()).isEqualTo(SeatStatus.AVAILABLE);

        // Read
        Optional<Seat> found = seatRepository.findById(1);
        assertThat(found).isPresent();
        assertThat(found.get().getStatus()).isEqualTo(SeatStatus.AVAILABLE);

        // Update
        found.get().setStatus(SeatStatus.UNAVAILABLE);
        found.get().setReserverName("테스트 사용자");
        found.get().setReserverPhone("01012345678");
        Seat updated = seatRepository.save(found.get());
        assertThat(updated.getStatus()).isEqualTo(SeatStatus.UNAVAILABLE);
        assertThat(updated.getReserverName()).isEqualTo("테스트 사용자");

        // Count check
        long count = seatRepository.count();
        assertThat(count).isEqualTo(1);
    }

    @Test
    void testH2MemoryDatabase() {
        // H2 메모리 DB가 정상 동작하는지 확인
        long initialCount = seatRepository.count();
        
        Seat seat = new Seat();
        seat.setSeatId(99);
        seat.setStatus(SeatStatus.AVAILABLE);
        seatRepository.save(seat);
        
        long afterCount = seatRepository.count();
        assertThat(afterCount).isEqualTo(initialCount + 1);
        
        // 저장된 데이터 확인
        Optional<Seat> found = seatRepository.findById(99);
        assertThat(found).isPresent();
        assertThat(found.get().getStatus()).isEqualTo(SeatStatus.AVAILABLE);
    }
}