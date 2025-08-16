package _th.hackathon.domain.reservation.service;

import _th.hackathon.common.InventoryStatus;
import _th.hackathon.domain.catalog.entity.Performance;
import _th.hackathon.domain.catalog.entity.PerformanceSeat;
import _th.hackathon.domain.catalog.entity.Show;
import _th.hackathon.domain.reservation.entity.Reservation;
import _th.hackathon.domain.user.entity.User;
import _th.hackathon.domain.user.repository.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.*;
import org.springframework.test.context.transaction.TestTransaction;

@SpringBootTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY) // 실 DB 대신 H2 강제
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:testdb;MODE=MySQL;DB_CLOSE_DELAY=-1;DATABASE_TO_LOWER=TRUE",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect",
        "logging.level.org.hibernate.SQL=DEBUG"
})
@Transactional
class CasReservationServiceTest {

    @Autowired ReservationService reservationService;
    @Autowired _th.hackathon.domain.reservation.repository.ReservationRepository reservationRepo;
    @Autowired UserRepository userRepo;

    @PersistenceContext EntityManager em;

    Long userId1;
    Long userId2;
    Long psId;

    @BeforeEach
    void setUp() {
        // 사용자 2명
        User u1 = userRepo.save(User.createUser("alice", "pw"));
        User u2 = userRepo.save(User.createUser("bob",   "pw"));
        userId1 = u1.getId();
        userId2 = u2.getId();

        // 쇼/회차 생성
        Show show = Show.builder().title("Test Show").description("d").build();
        em.persist(show);

        Performance perf = Performance.builder()
                .show(show).startsAt(LocalDateTime.now().plusDays(1)).build();
        em.persist(perf);

        // 좌석 엔티티 제거됨 → 회차별 좌석 하나 생성 (seatNo = 1)
        PerformanceSeat ps = PerformanceSeat.builder()
                .performance(perf)
                .seatNo(1)
                .status(InventoryStatus.AVAILABLE)
                .build();
        em.persist(ps);
        em.flush(); em.clear();

        psId = ps.getId();
    }

    @Test
    void reserve_success() {
        Long rid = reservationService.reserve(userId1, psId, "Alice", "010-0000-0000");
        assertThat(rid).isNotNull();

        PerformanceSeat after = em.find(PerformanceSeat.class, psId);
        assertThat(after.getStatus()).isEqualTo(InventoryStatus.SOLD);

        Reservation r = reservationRepo.findById(rid).orElseThrow();
        assertThat(r.getUser().getId()).isEqualTo(userId1);
        assertThat(r.getPerformanceSeat().getId()).isEqualTo(psId);
    }

    @Test
    void reserve_conflict() {
        reservationService.reserve(userId1, psId, "Alice", "010-0000-0000");
        assertThatThrownBy(() -> reservationService.reserve(userId2, psId, "Bob", "010-1111-1111"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("이미 예매된 좌석");
    }

    @Test
    void cancel_success() {
        Long rid = reservationService.reserve(userId1, psId, "Alice", "010-0000-0000");
        reservationService.cancel(rid);
        PerformanceSeat after = em.find(PerformanceSeat.class, psId);
        assertThat(after.getStatus()).isEqualTo(InventoryStatus.AVAILABLE);
    }

    @Test
    @DisplayName("동시 1000명: 하나의 좌석만 성공")
    void concurrent_reserve_singleSeat_1000_shouldSucceedOnce() throws Exception {
        // @BeforeEach 트랜잭션을 커밋해서 다른 스레드가 데이터를 볼 수 있게 함
        if (TestTransaction.isActive()) {
            TestTransaction.flagForCommit();
            TestTransaction.end();
        }

        int threadCount = 1000;
        ExecutorService pool = Executors.newFixedThreadPool(threadCount);
        CountDownLatch start = new CountDownLatch(1);
        CountDownLatch done  = new CountDownLatch(threadCount);
        AtomicInteger success = new AtomicInteger();
        AtomicInteger fail    = new AtomicInteger();

        for (int i = 0; i < threadCount; i++) {
            int idx = i;
            pool.submit(() -> {
                try {
                    start.await();
                    reservationService.reserve(userId1, psId, "User"+idx, "010-1234-"+String.format("%04d", idx));
                    success.incrementAndGet();
                } catch (Exception e) {
                    fail.incrementAndGet();
                } finally {
                    done.countDown();
                }
            });
        }

        start.countDown();
        boolean finished = done.await(30, TimeUnit.SECONDS);
        pool.shutdownNow();
        assertThat(finished).as("작업이 타임아웃 내에 끝나야 함").isTrue();

        assertThat(success.get()).isEqualTo(1);
        assertThat(reservationRepo.count()).isEqualTo(1);
        assertThat(em.find(PerformanceSeat.class, psId).getStatus())
                .isEqualTo(InventoryStatus.SOLD);
    }
}
