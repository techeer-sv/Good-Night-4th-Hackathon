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
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.transaction.TestTransaction;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("redis") // ✅ RedisReservationService가 주입되도록
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY)
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:testdb;MODE=MySQL;DB_CLOSE_DELAY=-1;DATABASE_TO_LOWER=TRUE",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect",
        "logging.level.org.hibernate.SQL=DEBUG",
        // ✅ 로컬 Redis로 연결 (테스트 실행 전에 redis-server 실행 필요)
        "spring.redis.host=localhost",
        "spring.redis.port=6379"
})
@Transactional
class RedisReservationServiceTest {

    @Autowired ReservationService reservationService; // Redis 구현이 와야 함
    @Autowired ReservationRepository reservationRepo;
    @Autowired UserRepository userRepo;
    @Autowired StringRedisTemplate stringRedisTemplate; // 키 정리용

    @PersistenceContext EntityManager em;

    Long userId;
    Long perfId;
    Long psId;

    @BeforeEach
    void setUp() {
        // 사용자
        User u = userRepo.save(User.createUser("redis-user", "pw"));
        userId = u.getId();

        // 쇼/회차/좌석 1개 생성
        Show show = Show.builder().title("Test Show").description("desc").build();
        em.persist(show);

        Performance perf = Performance.builder()
                .show(show)
                .startsAt(LocalDateTime.now().plusDays(1))
                .build();
        em.persist(perf);
        perfId = perf.getId();

        PerformanceSeat ps = PerformanceSeat.builder()
                .performance(perf)
                .seatNo(1)
                .status(InventoryStatus.AVAILABLE)
                .build();
        em.persist(ps);
        em.flush(); em.clear();
        psId = ps.getId();

        String gateKey = "resv:gate:" + perfId + ":" + psId;
        stringRedisTemplate.delete(gateKey);
    }

    @AfterEach
    void tearDown() {
        String gateKey   = "resv:gate:" + perfId + ":" + psId; // 현재 사용 키
        String legacyKey = "resv:"       + perfId + ":" + psId; // 혹시 남아있는 레거시 키
        stringRedisTemplate.delete(gateKey);
        stringRedisTemplate.delete(legacyKey);
    }

    @Test
    @DisplayName("동시 1000명: Redis 게이트로 정확히 1건만 성공")
    void concurrent_reserve_singleSeat_1000_shouldSucceedOnce_withRedisGate() throws Exception {
        // @BeforeEach 트랜잭션을 커밋해서 다른 스레드가 데이터를 볼 수 있게 함
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

        // ✅ 기대: Redis 게이트(INCR/SET NX)로 단 1건만 DB까지 진입해 성공
        assertThat(success.get()).isEqualTo(1);
        assertThat(reservationRepo.countByPerformanceSeatId(psId)).isEqualTo(1);
        assertThat(em.find(PerformanceSeat.class, psId).getStatus()).isEqualTo(InventoryStatus.SOLD);
    }

    /* ---------------------------------- helpers ---------------------------------- */

    private void commitSetupTx() {
        if (TestTransaction.isActive()) {
            TestTransaction.flagForCommit();
            TestTransaction.end();
        }
    }
}
