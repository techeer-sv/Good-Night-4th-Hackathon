package com.example.demo.integration;

import com.example.demo.dto.ReservationRequest;
import com.example.demo.dto.SelectionRequest;
import com.example.demo.entity.Seat;
import com.example.demo.repository.SeatRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.*;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.Map;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@DisplayName("Seat Reservation Integration Tests")
public class SeatIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private SeatRepository seatRepository;

    private String baseUrl() {
        return "http://localhost:" + port + "/api";
    }

    @BeforeEach
    void setUp() {
        // Reset all seats before each test
        seatRepository.findAll().forEach(seat -> {
            seat.setReserved(false);
            seat.setReservedBy(null);
            seat.setReservationTime(null);
            seat.setSelectedBy(null);
            seat.setSelectedAt(null);
            seatRepository.save(seat);
        });
    }

    @Test
    @DisplayName("TEST 1: Concurrency Control")
    void testConcurrencyControl() throws Exception {
        // Test 1.1: Concurrent seat selection attempts
        Long seatId = getAvailableSeatId();
        assertThat(seatId).isNotNull();

        ExecutorService executor = Executors.newFixedThreadPool(2);
        
        CompletableFuture<ResponseEntity<Seat>> selection1 = CompletableFuture.supplyAsync(() -> {
            SelectionRequest request = new SelectionRequest();
            request.setSelectedBy("user1");
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<SelectionRequest> entity = new HttpEntity<>(request, headers);
            
            return restTemplate.exchange(
                baseUrl() + "/seats/" + seatId + "/select",
                HttpMethod.POST,
                entity,
                Seat.class
            );
        }, executor);

        CompletableFuture<ResponseEntity<Seat>> selection2 = CompletableFuture.supplyAsync(() -> {
            SelectionRequest request = new SelectionRequest();
            request.setSelectedBy("user2");
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<SelectionRequest> entity = new HttpEntity<>(request, headers);
            
            return restTemplate.exchange(
                baseUrl() + "/seats/" + seatId + "/select",
                HttpMethod.POST,
                entity,
                Seat.class
            );
        }, executor);

        ResponseEntity<Seat> result1 = selection1.get(5, TimeUnit.SECONDS);
        ResponseEntity<Seat> result2 = selection2.get(5, TimeUnit.SECONDS);

        // One should succeed, one should fail
        boolean oneSucceeded = result1.getStatusCode().is2xxSuccessful() || result2.getStatusCode().is2xxSuccessful();
        boolean bothSucceeded = result1.getStatusCode().is2xxSuccessful() && result2.getStatusCode().is2xxSuccessful();
        
        assertThat(oneSucceeded).isTrue();
        assertThat(bothSucceeded).isFalse();

        executor.shutdown();
    }

    @Test
    @DisplayName("TEST 2: Selection Priority System")
    void testSelectionPriority() {
        Long seatId = getAvailableSeatId();
        
        // User1 selects
        SelectionRequest selectionRequest = new SelectionRequest();
        selectionRequest.setSelectedBy("priority_user1");
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<SelectionRequest> entity = new HttpEntity<>(selectionRequest, headers);
        
        ResponseEntity<Seat> selectionResponse = restTemplate.exchange(
            baseUrl() + "/seats/" + seatId + "/select",
            HttpMethod.POST,
            entity,
            Seat.class
        );
        
        assertThat(selectionResponse.getStatusCode()).isEqualTo(HttpStatus.OK);

        // User2 tries to reserve without proper selection
        ReservationRequest reservationRequest = new ReservationRequest();
        reservationRequest.setReservedBy("Blocked User");
        reservationRequest.setSelectedBy("priority_user2");
        
        HttpEntity<ReservationRequest> reserveEntity = new HttpEntity<>(reservationRequest, headers);
        
        ResponseEntity<String> reserveResponse = restTemplate.exchange(
            baseUrl() + "/seats/" + seatId + "/reserve",
            HttpMethod.POST,
            reserveEntity,
            String.class
        );
        
        // Should be blocked (could be BAD_REQUEST or CONFLICT)
        assertThat(reserveResponse.getStatusCode().is4xxClientError()).isTrue();

        // Authorized user can reserve
        ReservationRequest authorizedRequest = new ReservationRequest();
        authorizedRequest.setReservedBy("Authorized User");
        authorizedRequest.setSelectedBy("priority_user1");
        
        HttpEntity<ReservationRequest> authEntity = new HttpEntity<>(authorizedRequest, headers);
        
        ResponseEntity<Seat> authResponse = restTemplate.exchange(
            baseUrl() + "/seats/" + seatId + "/reserve",
            HttpMethod.POST,
            authEntity,
            Seat.class
        );
        
        assertThat(authResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(authResponse.getBody().isReserved()).isTrue();
    }

    @Test
    @DisplayName("TEST 3: Real-time Updates")
    void testRealTimeUpdates() {
        // Get initial hash
        ResponseEntity<String> initialStatusResponse = restTemplate.getForEntity(
            baseUrl() + "/seats/status", String.class
        );
        assertThat(initialStatusResponse.getStatusCode()).isEqualTo(HttpStatus.OK);

        // Make a change
        Long seatId = getAvailableSeatId();
        SelectionRequest request = new SelectionRequest();
        request.setSelectedBy("hashtest");
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<SelectionRequest> entity = new HttpEntity<>(request, headers);
        
        ResponseEntity<Seat> selectionResponse = restTemplate.exchange(
            baseUrl() + "/seats/" + seatId + "/select",
            HttpMethod.POST,
            entity,
            Seat.class
        );
        
        assertThat(selectionResponse.getStatusCode()).isEqualTo(HttpStatus.OK);

        // Check if hash changed
        ResponseEntity<String> newStatusResponse = restTemplate.getForEntity(
            baseUrl() + "/seats/status", String.class
        );
        
        assertThat(newStatusResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(newStatusResponse.getBody()).isNotEqualTo(initialStatusResponse.getBody());
    }

    @Test
    @DisplayName("TEST 4: Cleanup System")
    void testCleanupSystem() {
        Long seatId = getAvailableSeatId();
        
        // Select a seat
        SelectionRequest request = new SelectionRequest();
        request.setSelectedBy("expiry_test");
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<SelectionRequest> entity = new HttpEntity<>(request, headers);
        
        ResponseEntity<Seat> selectionResponse = restTemplate.exchange(
            baseUrl() + "/seats/" + seatId + "/select",
            HttpMethod.POST,
            entity,
            Seat.class
        );
        
        assertThat(selectionResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(selectionResponse.getBody().getSelectedBy()).isEqualTo("expiry_test");

        // Cancel the selection
        ResponseEntity<Seat> cancelResponse = restTemplate.exchange(
            baseUrl() + "/seats/" + seatId + "/cancel",
            HttpMethod.POST,
            entity,
            Seat.class
        );
        
        assertThat(cancelResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(cancelResponse.getBody().getSelectedBy()).isNull();
    }

    @Test
    @DisplayName("TEST 5: Edge Cases")
    void testEdgeCases() {
        // Test double selection by same user
        Long seatId = getAvailableSeatId();
        
        SelectionRequest request = new SelectionRequest();
        request.setSelectedBy("double_user");
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<SelectionRequest> entity = new HttpEntity<>(request, headers);
        
        // First selection
        ResponseEntity<Seat> response1 = restTemplate.exchange(
            baseUrl() + "/seats/" + seatId + "/select",
            HttpMethod.POST,
            entity,
            Seat.class
        );
        assertThat(response1.getStatusCode()).isEqualTo(HttpStatus.OK);

        // Second selection by same user - should succeed gracefully
        ResponseEntity<Seat> response2 = restTemplate.exchange(
            baseUrl() + "/seats/" + seatId + "/select",
            HttpMethod.POST,
            entity,
            Seat.class
        );
        assertThat(response2.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response2.getBody().getSelectedBy()).isEqualTo("double_user");

        // Cancel non-existent selection
        Long emptySeatId = getAvailableSeatId();
        SelectionRequest cancelRequest = new SelectionRequest();
        cancelRequest.setSelectedBy("nonexistent");
        
        HttpEntity<SelectionRequest> cancelEntity = new HttpEntity<>(cancelRequest, headers);
        
        ResponseEntity<String> cancelResponse = restTemplate.exchange(
            baseUrl() + "/seats/" + emptySeatId + "/cancel",
            HttpMethod.POST,
            cancelEntity,
            String.class
        );
        
        assertThat(cancelResponse.getStatusCode().is4xxClientError()).isTrue();
    }

    @Test
    @DisplayName("TEST 6: Reset Functionality")
    void testResetFunctionality() {
        // Set up some reservations and selections
        Long seatId1 = getAvailableSeatId();
        
        // Select and reserve seat 1
        SelectionRequest selection1 = new SelectionRequest();
        selection1.setSelectedBy("user1");
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<SelectionRequest> selectionEntity = new HttpEntity<>(selection1, headers);
        
        ResponseEntity<Seat> selectionResponse = restTemplate.exchange(
            baseUrl() + "/seats/" + seatId1 + "/select",
            HttpMethod.POST,
            selectionEntity,
            Seat.class
        );
        assertThat(selectionResponse.getStatusCode()).isEqualTo(HttpStatus.OK);

        ReservationRequest reservation1 = new ReservationRequest();
        reservation1.setReservedBy("Test User 1");
        reservation1.setSelectedBy("user1");
        
        HttpEntity<ReservationRequest> reservationEntity = new HttpEntity<>(reservation1, headers);
        
        ResponseEntity<Seat> reservationResponse = restTemplate.exchange(
            baseUrl() + "/seats/" + seatId1 + "/reserve",
            HttpMethod.POST,
            reservationEntity,
            Seat.class
        );
        assertThat(reservationResponse.getStatusCode()).isEqualTo(HttpStatus.OK);

        // Reset all seats
        ResponseEntity<String> resetResponse = restTemplate.postForEntity(
            baseUrl() + "/seats/reset", null, String.class
        );
        
        assertThat(resetResponse.getStatusCode()).isEqualTo(HttpStatus.OK);

        // Verify all seats are reset
        List<Seat> allSeats = seatRepository.findAll();
        for (Seat seat : allSeats) {
            assertThat(seat.isReserved()).isFalse();
            assertThat(seat.getReservedBy()).isNull();
            assertThat(seat.getSelectedBy()).isNull();
            assertThat(seat.getSelectedAt()).isNull();
            assertThat(seat.getReservationTime()).isNull();
        }
    }

    @Test
    @DisplayName("Stress Test: Multiple Concurrent Operations")
    void testConcurrentOperations() throws Exception {
        final int numberOfThreads = 10;
        final int operationsPerThread = 10;
        
        ExecutorService executor = Executors.newFixedThreadPool(numberOfThreads);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch endLatch = new CountDownLatch(numberOfThreads);
        
        AtomicInteger successfulOperations = new AtomicInteger(0);
        AtomicInteger failedOperations = new AtomicInteger(0);
        
        for (int i = 0; i < numberOfThreads; i++) {
            final int threadId = i;
            executor.submit(() -> {
                try {
                    startLatch.await();
                    
                    for (int j = 0; j < operationsPerThread; j++) {
                        try {
                            Long seatId = getAvailableSeatId();
                            if (seatId != null) {
                                // Try to select
                                SelectionRequest request = new SelectionRequest();
                                request.setSelectedBy("thread_" + threadId + "_op_" + j);
                                
                                HttpHeaders headers = new HttpHeaders();
                                headers.setContentType(MediaType.APPLICATION_JSON);
                                HttpEntity<SelectionRequest> entity = new HttpEntity<>(request, headers);
                                
                                ResponseEntity<Seat> response = restTemplate.exchange(
                                    baseUrl() + "/seats/" + seatId + "/select",
                                    HttpMethod.POST,
                                    entity,
                                    Seat.class
                                );
                                
                                if (response.getStatusCode().is2xxSuccessful()) {
                                    successfulOperations.incrementAndGet();
                                    
                                    // Cancel immediately to free up the seat
                                    restTemplate.exchange(
                                        baseUrl() + "/seats/" + seatId + "/cancel",
                                        HttpMethod.POST,
                                        entity,
                                        Seat.class
                                    );
                                } else {
                                    failedOperations.incrementAndGet();
                                }
                            }
                            
                            Thread.sleep(ThreadLocalRandom.current().nextInt(10, 50));
                        } catch (Exception e) {
                            failedOperations.incrementAndGet();
                        }
                    }
                } catch (Exception e) {
                    // Handle errors
                } finally {
                    endLatch.countDown();
                }
            });
        }
        
        startLatch.countDown();
        boolean completed = endLatch.await(30, TimeUnit.SECONDS);
        executor.shutdown();
        
        assertThat(completed).isTrue();
        
        System.out.println("=== Concurrent Operations Test Results ===");
        System.out.println("Successful operations: " + successfulOperations.get());
        System.out.println("Failed operations: " + failedOperations.get());
        
        // At least some operations should succeed
        assertThat(successfulOperations.get()).isGreaterThan(0);
        
        // Verify no inconsistent state
        List<Seat> allSeats = seatRepository.findAll();
        for (Seat seat : allSeats) {
            // No seat should be both reserved and selected
            if (seat.isReserved()) {
                assertThat(seat.getSelectedBy()).isNull();
            }
        }
    }

    private Long getAvailableSeatId() {
        ResponseEntity<Seat[]> response = restTemplate.getForEntity(
            baseUrl() + "/seats", Seat[].class
        );
        
        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            for (Seat seat : response.getBody()) {
                if (!seat.isReserved() && seat.getSelectedBy() == null) {
                    return seat.getId();
                }
            }
        }
        return null;
    }
}