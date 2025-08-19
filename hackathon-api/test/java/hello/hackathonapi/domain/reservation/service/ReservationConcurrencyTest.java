package hello.hackathonapi.domain.reservation.service;

import hello.hackathonapi.domain.concert.entity.Concert;
import hello.hackathonapi.domain.reservation.repository.ReservationRepository;
import hello.hackathonapi.global.error.exception.ErrorCode;
import hello.hackathonapi.domain.concert.repository.ConcertRepository;
import hello.hackathonapi.domain.member.entity.Member;
import hello.hackathonapi.domain.member.repository.MemberRepository;
import hello.hackathonapi.domain.seat.entity.Seat;
import hello.hackathonapi.domain.seat.entity.SeatGrade;
import hello.hackathonapi.domain.seat.entity.SeatStatus;
import hello.hackathonapi.domain.seat.repository.SeatRepository;
import hello.hackathonapi.global.error.exception.BusinessException;
import hello.hackathonapi.global.error.exception.ErrorCode;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
class ReservationConcurrencyTest {

    private static final Logger logger = LoggerFactory.getLogger(ReservationConcurrencyTest.class);

    @Autowired
    private ReservationService reservationService;

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private ConcertRepository concertRepository;

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private SeatRepository seatRepository;

    private Concert concert;
    private Seat seat;
    private List<Member> members = new ArrayList<>();

    @Autowired
    private RedisTemplate<String, String> redisTemplate;

    @BeforeEach
    void setUp() {
        // Redis의 모든 키 삭제
        try {
            Objects.requireNonNull(redisTemplate.getConnectionFactory())
                .getConnection()
                .serverCommands()
                .flushAll();
        } catch (Exception e) {
            throw new RuntimeException("Failed to flush Redis", e);
        }
        
        // 기존 데이터 정리
        reservationRepository.deleteAll();
        seatRepository.deleteAll();
        memberRepository.deleteAll();
        concertRepository.deleteAll();
        // 테스트용 콘서트 생성
        concert = Concert.builder()
                .name("테스트 콘서트")
                .description("동시성 테스트")
                .date(LocalDateTime.now().plusDays(7).toString())
                .build();
        concert = concertRepository.save(concert);

        // 테스트용 좌석 생성
        seat = Seat.builder()
                .concert(concert)
                .number(1)
                .grade(SeatGrade.VIP)
                .price(100000)
                .status(SeatStatus.AVAILABLE)
                .build();
        seat = seatRepository.save(seat);

        // 테스트용 회원 1000명 생성
        for (int i = 0; i < 1000; i++) {
            Member member = Member.builder()
                    .name("테스트 유저 " + i)
                    .email("test" + i + "@test.com")
                    .password("password" + i)
                    .build();
            members.add(memberRepository.save(member));
        }
    }

    @Test
    @DisplayName("1000명의 사용자가 동시에 한 좌석을 예약 시도할 때 단 한 명만 성공해야 한다")
    void concurrentReservationTest() throws InterruptedException {
        // given
        int numberOfThreads = 1000;
        ExecutorService executorService = Executors.newFixedThreadPool(32);
        CountDownLatch latch = new CountDownLatch(numberOfThreads);
        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger alreadyInProgressCount = new AtomicInteger(0);
        AtomicInteger alreadyReservedCount = new AtomicInteger(0);
        AtomicInteger notAvailableCount = new AtomicInteger(0);
        AtomicInteger etcExceptionCount = new AtomicInteger(0);

        // when
        long startTime = System.currentTimeMillis();

        for (int i = 0; i < numberOfThreads; i++) {
            int finalI = i;
            executorService.submit(() -> {
                try {
                    reservationService.createReservation(
                            concert.getId(),
                            seat.getId(),
                            members.get(finalI).getId()
                    );
                    successCount.incrementAndGet();
                } catch (BusinessException e) {
                    if (e.getErrorCode() == ErrorCode.SEAT_ALREADY_IN_PROGRESS) {
                        alreadyInProgressCount.incrementAndGet();
                    } else if (e.getErrorCode() == ErrorCode.SEAT_ALREADY_RESERVED) {
                        alreadyReservedCount.incrementAndGet();
                    } else if (e.getErrorCode() == ErrorCode.SEAT_NOT_AVAILABLE) {
                        notAvailableCount.incrementAndGet();
                    } else {
                        logger.error("Unexpected business exception: {}", e.getMessage());
                        etcExceptionCount.incrementAndGet();
                    }
                } catch (Exception e) {
                    logger.error("Unexpected exception: {}", e.getMessage());
                    etcExceptionCount.incrementAndGet();
                } finally {
                    latch.countDown();
                }
            });
        }

        // 최대 30초 대기
        boolean completed = latch.await(30, TimeUnit.SECONDS);
        long endTime = System.currentTimeMillis();
        long totalTime = endTime - startTime;

        executorService.shutdown();
        boolean terminated = executorService.awaitTermination(1, TimeUnit.MINUTES);

        // then
        logger.info("============= 동시성 테스트 결과 =============");
        logger.info("테스트 완료 여부: {}", completed ? "성공" : "시간 초과");
        logger.info("스레드 풀 정상 종료: {}", terminated ? "성공" : "강제 종료됨");
        logger.info("총 소요 시간: {}ms", totalTime);
        logger.info("성공 건수: {}", successCount.get());
        logger.info("진행 중 실패: {}", alreadyInProgressCount.get());
        logger.info("이미 예약됨 실패: {}", alreadyReservedCount.get());
        logger.info("예약 불가능 실패: {}", notAvailableCount.get());
        logger.info("기타 예외: {}", etcExceptionCount.get());
        logger.info("총 요청 처리: {}", successCount.get() + alreadyInProgressCount.get() + 
                alreadyReservedCount.get() + notAvailableCount.get() + etcExceptionCount.get());
        logger.info("=========================================");

        // 검증
        assertThat(completed).withFailMessage("테스트가 시간 초과로 완료되지 않았습니다.").isTrue();
        assertThat(terminated).withFailMessage("스레드 풀이 정상적으로 종료되지 않았습니다.").isTrue();
        assertThat(successCount.get()).withFailMessage(
            "성공 건수가 1이 아닙니다. 실제 값: %d", successCount.get()
        ).isEqualTo(1);
        assertThat(successCount.get() + alreadyInProgressCount.get() + 
                alreadyReservedCount.get() + notAvailableCount.get() + etcExceptionCount.get())
                .withFailMessage(
                    "총 처리된 요청 수가 %d개가 아닙니다. 실제 값: %d (성공: %d, 진행중: %d, 이미예약: %d, 예약불가: %d, 기타: %d)",
                    numberOfThreads,
                    successCount.get() + alreadyInProgressCount.get() + alreadyReservedCount.get() + notAvailableCount.get() + etcExceptionCount.get(),
                    successCount.get(),
                    alreadyInProgressCount.get(),
                    alreadyReservedCount.get(),
                    notAvailableCount.get(),
                    etcExceptionCount.get()
                )
                .isEqualTo(numberOfThreads);
    }
}