package com.example.demo.service;

import com.example.demo.entity.Seat;
import com.example.demo.repository.SeatRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class SeatConcurrencyTest {

    @Autowired
    private SeatService seatService;

    @Autowired
    private SeatRepository seatRepository;

    private Seat testSeat;

    @BeforeEach
    @Transactional
    void setUp() {
        // Clean up any existing data
        seatRepository.deleteAll();
        
        // Create a test seat
        testSeat = new Seat();
        testSeat.setSeatNumber(99);
        testSeat.setReserved(false);
        testSeat = seatRepository.save(testSeat);
    }

    @Test
    void testConcurrentSeatSelection_OnlyOneSucceeds() throws InterruptedException {
        // Given: Multiple threads trying to select the same seat
        int numberOfThreads = 10;
        ExecutorService executor = Executors.newFixedThreadPool(numberOfThreads);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch endLatch = new CountDownLatch(numberOfThreads);
        
        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failureCount = new AtomicInteger(0);
        List<String> successfulUsers = new ArrayList<>();
        List<Exception> exceptions = new ArrayList<>();

        // When: All threads attempt to select simultaneously
        for (int i = 0; i < numberOfThreads; i++) {
            final int threadId = i;
            executor.submit(() -> {
                try {
                    startLatch.await(); // Wait for all threads to be ready
                    Seat result = seatService.selectSeat(testSeat.getId(), "user_" + threadId);
                    successCount.incrementAndGet();
                    synchronized (successfulUsers) {
                        successfulUsers.add(result.getSelectedBy());
                    }
                } catch (Exception e) {
                    failureCount.incrementAndGet();
                    synchronized (exceptions) {
                        exceptions.add(e);
                    }
                } finally {
                    endLatch.countDown();
                }
            });
        }

        startLatch.countDown(); // Start all threads
        endLatch.await(10, TimeUnit.SECONDS); // Wait for completion
        executor.shutdown();

        // Then: Should have some successes and some failures due to concurrency control
        assertTrue(successCount.get() > 0, 
            "Expected at least 1 successful selection, but got: " + successCount.get());
        assertTrue(failureCount.get() > 0,
            "Expected some failures due to optimistic locking, but got: " + failureCount.get());
        
        // Verify the final state in database
        Seat finalState = seatRepository.findById(testSeat.getId()).orElseThrow();
        assertNotNull(finalState.getSelectedBy(), "Final state should have a selected user");
        assertTrue(successfulUsers.contains(finalState.getSelectedBy()), 
            "Database state should match one of the successful selections");
    }

    @Test
    void testConcurrentReservationWithPriority_OnlyAuthorizedSucceeds() throws InterruptedException {
        // Given: One user has selected the seat, multiple users try to reserve
        String priorityUser = "priority_user";
        seatService.selectSeat(testSeat.getId(), priorityUser);

        int numberOfAttackers = 5;
        ExecutorService executor = Executors.newFixedThreadPool(numberOfAttackers + 1);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch endLatch = new CountDownLatch(numberOfAttackers + 1);
        
        AtomicInteger authorizedSuccess = new AtomicInteger(0);
        AtomicInteger unauthorizedSuccess = new AtomicInteger(0);
        AtomicInteger priorityBlocks = new AtomicInteger(0);

        // Priority user's legitimate reservation attempt
        executor.submit(() -> {
            try {
                startLatch.await();
                Seat result = seatService.reserveSeatWithSelection(testSeat.getId(), "Priority User", priorityUser);
                if (result.isReserved()) {
                    authorizedSuccess.incrementAndGet();
                }
            } catch (Exception e) {
                // Priority user should not fail
            } finally {
                endLatch.countDown();
            }
        });

        // Unauthorized reservation attempts
        for (int i = 0; i < numberOfAttackers; i++) {
            final int attackerId = i;
            executor.submit(() -> {
                try {
                    startLatch.await();
                    Seat result = seatService.reserveSeatWithSelection(
                        testSeat.getId(), "Attacker " + attackerId, "attacker_" + attackerId);
                    if (result.isReserved()) {
                        unauthorizedSuccess.incrementAndGet();
                    }
                } catch (IllegalStateException e) {
                    if (e.getMessage().contains("priority")) {
                        priorityBlocks.incrementAndGet();
                    }
                } catch (Exception e) {
                    // Other exceptions
                } finally {
                    endLatch.countDown();
                }
            });
        }

        startLatch.countDown();
        endLatch.await(10, TimeUnit.SECONDS);
        executor.shutdown();

        // Then: Only priority user should succeed
        assertEquals(1, authorizedSuccess.get(), 
            "Priority user should succeed exactly once");
        assertEquals(0, unauthorizedSuccess.get(), 
            "No unauthorized users should succeed");
        assertEquals(numberOfAttackers, priorityBlocks.get(),
            "All attackers should be blocked by priority system");

        // Verify final database state
        Seat finalState = seatRepository.findById(testSeat.getId()).orElseThrow();
        assertTrue(finalState.isReserved(), "Seat should be reserved");
        assertEquals("Priority User", finalState.getReservedBy(), "Should be reserved by priority user");
    }

    @Test
    void testOptimisticLockingFailure_RetryMechanism() throws InterruptedException {
        // Given: Multiple threads trying to modify the same seat
        int numberOfThreads = 5;
        ExecutorService executor = Executors.newFixedThreadPool(numberOfThreads);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch endLatch = new CountDownLatch(numberOfThreads);
        
        AtomicInteger optimisticLockExceptions = new AtomicInteger(0);
        AtomicInteger successfulOperations = new AtomicInteger(0);

        for (int i = 0; i < numberOfThreads; i++) {
            final int threadId = i;
            executor.submit(() -> {
                try {
                    startLatch.await();
                    
                    // Simulate retrying on optimistic lock failure
                    boolean success = false;
                    int maxRetries = 3;
                    
                    for (int retry = 0; retry < maxRetries && !success; retry++) {
                        try {
                            seatService.selectSeat(testSeat.getId(), "user_" + threadId);
                            successfulOperations.incrementAndGet();
                            success = true;
                        } catch (OptimisticLockingFailureException e) {
                            optimisticLockExceptions.incrementAndGet();
                            if (retry < maxRetries - 1) {
                                Thread.sleep(10); // Brief pause before retry
                            }
                        }
                    }
                } catch (Exception e) {
                    // Handle other exceptions
                } finally {
                    endLatch.countDown();
                }
            });
        }

        startLatch.countDown();
        endLatch.await(15, TimeUnit.SECONDS);
        executor.shutdown();

        // Then: Should have some optimistic lock exceptions but eventual success
        assertTrue(optimisticLockExceptions.get() > 0, 
            "Should have encountered optimistic locking conflicts");
        assertTrue(successfulOperations.get() > 0, 
            "Should have at least one successful operation after retries");
        
        // Final state should be consistent
        Seat finalState = seatRepository.findById(testSeat.getId()).orElseThrow();
        assertNotNull(finalState.getSelectedBy(), "Final state should have a selected user");
    }

    @Test
    void testConcurrentSelectionCancellation_DataConsistency() throws InterruptedException {
        // Given: One user selects, multiple users try to cancel
        String originalUser = "original_user";
        seatService.selectSeat(testSeat.getId(), originalUser);

        int numberOfCancellers = 3;
        ExecutorService executor = Executors.newFixedThreadPool(numberOfCancellers);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch endLatch = new CountDownLatch(numberOfCancellers);
        
        AtomicInteger successfulCancellations = new AtomicInteger(0);
        AtomicInteger failedCancellations = new AtomicInteger(0);

        // Multiple threads trying to cancel (only original user should succeed)
        for (int i = 0; i < numberOfCancellers; i++) {
            final int threadId = i;
            final String cancelUser = (threadId == 0) ? originalUser : "fake_user_" + threadId;
            
            executor.submit(() -> {
                try {
                    startLatch.await();
                    seatService.cancelSelection(testSeat.getId(), cancelUser);
                    successfulCancellations.incrementAndGet();
                } catch (IllegalStateException e) {
                    failedCancellations.incrementAndGet();
                } catch (Exception e) {
                    failedCancellations.incrementAndGet();
                } finally {
                    endLatch.countDown();
                }
            });
        }

        startLatch.countDown();
        endLatch.await(10, TimeUnit.SECONDS);
        executor.shutdown();

        // Then: Only original user should successfully cancel
        assertEquals(1, successfulCancellations.get(),
            "Only the original user should be able to cancel");
        assertEquals(numberOfCancellers - 1, failedCancellations.get(),
            "Unauthorized cancellation attempts should fail");

        // Verify final state
        Seat finalState = seatRepository.findById(testSeat.getId()).orElseThrow();
        assertNull(finalState.getSelectedBy(), "Seat should no longer be selected");
        assertNull(finalState.getSelectedAt(), "Selection time should be cleared");
    }

    @Test
    void testRapidSelectCancelCycles_SystemStability() throws InterruptedException {
        // Given: Rapid select/cancel operations
        int numberOfCycles = 20;
        String testUser = "rapid_user";
        
        AtomicInteger successfulSelections = new AtomicInteger(0);
        AtomicInteger successfulCancellations = new AtomicInteger(0);
        AtomicInteger errors = new AtomicInteger(0);

        // When: Performing rapid select/cancel cycles
        for (int i = 0; i < numberOfCycles; i++) {
            try {
                // Select
                seatService.selectSeat(testSeat.getId(), testUser);
                successfulSelections.incrementAndGet();
                
                Thread.sleep(5); // Brief pause
                
                // Cancel
                seatService.cancelSelection(testSeat.getId(), testUser);
                successfulCancellations.incrementAndGet();
                
                Thread.sleep(5); // Brief pause
            } catch (Exception e) {
                errors.incrementAndGet();
            }
        }

        // Then: Most operations should succeed
        assertTrue(successfulSelections.get() >= numberOfCycles * 0.8, 
            "At least 80% of selections should succeed");
        assertTrue(successfulCancellations.get() >= numberOfCycles * 0.8, 
            "At least 80% of cancellations should succeed");
        assertTrue(errors.get() < numberOfCycles * 0.2, 
            "Errors should be less than 20%");

        // Final state should be clean
        Seat finalState = seatRepository.findById(testSeat.getId()).orElseThrow();
        assertNull(finalState.getSelectedBy(), "Final state should be clean");
    }

    @Test
    void testDataIntegrityUnderChaos_RandomOperations() throws InterruptedException {
        // Given: Multiple threads performing random operations
        int numberOfThreads = 8;
        int operationsPerThread = 10;
        ExecutorService executor = Executors.newFixedThreadPool(numberOfThreads);
        CountDownLatch endLatch = new CountDownLatch(numberOfThreads);
        
        AtomicInteger totalOperations = new AtomicInteger(0);
        AtomicInteger errors = new AtomicInteger(0);

        for (int t = 0; t < numberOfThreads; t++) {
            final int threadId = t;
            executor.submit(() -> {
                try {
                    for (int op = 0; op < operationsPerThread; op++) {
                        try {
                            totalOperations.incrementAndGet();
                            
                            // Random operation
                            switch (op % 3) {
                                case 0: // Select
                                    seatService.selectSeat(testSeat.getId(), "chaos_user_" + threadId);
                                    break;
                                case 1: // Cancel
                                    seatService.cancelSelection(testSeat.getId(), "chaos_user_" + threadId);
                                    break;
                                case 2: // Reserve
                                    seatService.reserveSeatWithSelection(testSeat.getId(), 
                                        "Chaos User " + threadId, "chaos_user_" + threadId);
                                    break;
                            }
                            
                            Thread.sleep(1); // Brief pause
                        } catch (Exception e) {
                            errors.incrementAndGet();
                        }
                    }
                } finally {
                    endLatch.countDown();
                }
            });
        }

        endLatch.await(30, TimeUnit.SECONDS);
        executor.shutdown();

        // Then: System should remain stable and data consistent
        assertTrue(totalOperations.get() > 0, "Should have performed operations");
        
        // Verify seat still exists and is in valid state
        Seat finalState = seatRepository.findById(testSeat.getId()).orElseThrow();
        assertNotNull(finalState, "Seat should still exist");
        assertEquals(99, finalState.getSeatNumber(), "Seat number should be unchanged");
        
        // Check logical consistency
        if (finalState.isReserved()) {
            assertNotNull(finalState.getReservedBy(), 
                "Reserved seat should have reservedBy");
            assertNotNull(finalState.getReservationTime(), 
                "Reserved seat should have reservation time");
        }
        
        System.out.println("Chaos test completed:");
        System.out.println("Total operations: " + totalOperations.get());
        System.out.println("Errors: " + errors.get());
        System.out.println("Error rate: " + (errors.get() * 100.0 / totalOperations.get()) + "%");
    }
}