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
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.transaction.TestTransaction;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.*;
import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("redis")
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:testdb;MODE=MySQL;DB_CLOSE_DELAY=-1;DATABASE_TO_LOWER=TRUE",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect",
        "spring.redis.host=localhost",
        "spring.redis.port=6379"
})
@Transactional
class RedisCasReservationServiceTest {

    @Autowired private RedisCasReservationService reservationService;
    @Autowired private UserRepository userRepository;
    @Autowired private ReservationRepository reservationRepository;
    @Autowired private StringRedisTemplate redisTemplate;

    @PersistenceContext EntityManager em;

    private Long userId;
    private Long seatId;
    private Long perfId;

    @BeforeEach
    void setUp() {
        // 사용자
        User user = User.createUser("tester", "pw");
        userId = userRepository.save(user).getId();

        // 쇼/공연/좌석
        Show show = Show.builder().title("테스트 공연").description("Redis CAS Test").build();
        em.persist(show);

        Performance performance = Performance.builder()
                .show(show)
                .startsAt(LocalDateTime.now().plusDays(1))
                .build();
        em.persist(performance);
        perfId = performance.getId();

        PerformanceSeat seat = PerformanceSeat.builder()
                .performance(performance)
                .seatNo(1)
                .status(InventoryStatus.AVAILABLE)
                .build();
        em.persist(seat);
        em.flush(); em.clear();
        seatId = seat.getId();

        // Redis 게이트 키 정리 (테스트 시작 전)
        String gateKey   = "resv:gate:" + perfId + ":" + seatId;
        String legacyKey = "resv:"       + perfId + ":" + seatId; // 혹시 남아있을 레거시 키
        redisTemplate.delete(gateKey);
        redisTemplate.delete(legacyKey);

        // 다른 스레드가 보도록 커밋
        commitSetupTx();
    }

    @AfterEach
    void tearDown() {
        // Redis 게이트 키 정리 (테스트 종료 후)
        String gateKey   = "resv:gate:" + perfId + ":" + seatId;
        String legacyKey = "resv:"       + perfId + ":" + seatId;
        redisTemplate.delete(gateKey);
        redisTemplate.delete(legacyKey);
    }

    @Test
    @DisplayName("동시에 1000명이 같은 좌석을 예약하면 단 1명만 성공해야 한다")
    void concurrent_1000_reserve_oneSeat() throws Exception {
        int threadCount = 1000;
        ExecutorService executor = Executors.newFixedThreadPool(100);
        CountDownLatch latch = new CountDownLatch(threadCount);
        List<Future<Long>> futures = new ArrayList<>();

        for (int i = 0; i < threadCount; i++) {
            final int idx = i;
            futures.add(executor.submit(() -> {
                try {
                    return reservationService.reserve(
                            userId, seatId, "예약자" + idx, "010-1234-" + String.format("%04d", idx)
                    );
                } catch (Exception e) {
                    return null;
                } finally {
                    latch.countDown();
                }
            }));
        }

        latch.await(30, TimeUnit.SECONDS);
        executor.shutdown();

        long successCount = futures.stream().map(f -> {
            try { return f.get(); } catch (Exception e) { return null; }
        }).filter(id -> id != null).count();

        assertThat(successCount).isEqualTo(1);
        assertThat(reservationRepository.count()).isEqualTo(1);

        PerformanceSeat reservedSeat = em.find(PerformanceSeat.class, seatId);
        assertThat(reservedSeat.getStatus()).isEqualTo(InventoryStatus.SOLD);
    }

    private void commitSetupTx() {
        if (TestTransaction.isActive()) {
            TestTransaction.flagForCommit();
            TestTransaction.end();
        }
    }
}
