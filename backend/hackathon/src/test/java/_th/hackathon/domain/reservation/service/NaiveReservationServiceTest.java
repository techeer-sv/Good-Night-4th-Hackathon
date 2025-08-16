package _th.hackathon.domain.reservation.service;

import _th.hackathon.common.InventoryStatus;
import _th.hackathon.domain.catalog.entity.Performance;
import _th.hackathon.domain.catalog.entity.PerformanceSeat;
import _th.hackathon.domain.catalog.entity.Show;
import _th.hackathon.domain.reservation.entity.Reservation;
import _th.hackathon.domain.reservation.repository.ReservationRepository;
import _th.hackathon.domain.user.entity.User;
import _th.hackathon.domain.user.repository.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.test.context.transaction.TestTransaction;

import java.time.LocalDateTime;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("naive")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY)
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:testdb;MODE=MySQL;DB_CLOSE_DELAY=-1;DATABASE_TO_LOWER=TRUE",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect",
        "logging.level.org.hibernate.SQL=DEBUG"
})
@Transactional
class NaiveReservationServiceTest {

    @Autowired ReservationService reservationService; // Naive 구현이 와야 함
    @Autowired ReservationRepository reservationRepo;
    @Autowired UserRepository userRepo;

    @PersistenceContext EntityManager em;

    Long userId;
    Long psId;

    @BeforeEach
    void setUp() {
        // 사용자
        User u = userRepo.save(User.createUser("concurrent-user", "pw"));
        userId = u.getId();

        // 쇼/회차/좌석 1개 생성
        Show show = Show.builder().title("Test Show").description("desc").build();
        em.persist(show);

        Performance perf = Performance.builder()
                .show(show)
                .startsAt(LocalDateTime.now().plusDays(1))
                .build();
        em.persist(perf);

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
    @DisplayName("의도적 실패: 1명만 성공해야 한다(라고 가정) → 실제로는 깨진다")
    void concurrent_1000_shouldFailIfWeAssumeSingleWinner() throws Exception {
        // 다른 스레드가 셋업 데이터를 볼 수 있게 트랜잭션 종료
        commitSetupTx();

        int threadCount = 1000;
        ExecutorService pool = Executors.newFixedThreadPool(threadCount);
        CountDownLatch start = new CountDownLatch(1);
        CountDownLatch done  = new CountDownLatch(threadCount);
        AtomicInteger success = new AtomicInteger();
        AtomicInteger fail    = new AtomicInteger();

        for (int i = 0; i < threadCount; i++) {
            final int idx = i;
            pool.submit(() -> {
                try {
                    start.await();
                    reservationService.reserve(
                            userId, psId, "U" + idx, "010-1" + String.format("%08d", idx));
                    success.incrementAndGet();
                } catch (Exception e) {
                    fail.incrementAndGet();
                } finally {
                    done.countDown();
                }
            });
        }

        start.countDown();
        boolean finished = done.await(40, TimeUnit.SECONDS);
        pool.shutdownNow();
        assertThat(finished).isTrue();

        assertThat(success.get()).isEqualTo(1); // 의도적 실패 포인트

        // 보너스 체크(상태/집계) — 여기도 상황에 따라 깨질 수 있음(의도적)
        long countForSeat = reservationRepo.countByPerformanceSeatId(psId);
        assertThat(countForSeat).isEqualTo(1);
        assertThat(em.find(PerformanceSeat.class, psId).getStatus()).isEqualTo(InventoryStatus.SOLD);
    }

    private void commitSetupTx() {
        // @Transactional 클래스라 @BeforeEach가 같은 트랜잭션에서 실행됨.
        // 동시 스레드가 데이터를 보게 하려면 여기서 커밋 후 새 트랜잭션에서 테스트 수행.
        if (TestTransaction.isActive()) {
            TestTransaction.flagForCommit();
            TestTransaction.end();
        }
    }
}
