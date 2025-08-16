package org.own.backend.seats;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class SeatIntegrationTest {

    @LocalServerPort
    int port;

    @Autowired
    TestRestTemplate rest;


    @Test
    void testApplicationStartsAndSeatsEndpointWorks() {
        // Given: 컨테이너 전체 구동 (SeatInitializer로 9개 좌석 생성됨)
        
        // When: 좌석 목록 조회
        ResponseEntity<Seat[]> response = rest.getForEntity("http://localhost:" + port + "/api/seats", Seat[].class);
        
        // Then: 응답이 정상이고 좌석이 존재함
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody()).hasSize(9);
        
        // 첫 번째 좌석 확인
        Seat firstSeat = response.getBody()[0];
        assertThat(firstSeat.getSeatId()).isNotNull();
        assertThat(firstSeat.getStatus()).isNotNull();
    }

    @Test
    void testReservationEndpoint() {
        // Given: HTTP를 통한 실제 요청
        ResponseEntity<Seat[]> listResp = rest.getForEntity("http://localhost:" + port + "/api/seats", Seat[].class);
        assertThat(listResp.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(listResp.getBody()).isNotEmpty();

        // 첫 번째 좌석으로 예약 시도
        int seatId = listResp.getBody()[0].getSeatId();

        // When: 좌석 예약 시도
        record Req(String name, String phone) {}
        ResponseEntity<String> reserveResp = rest.postForEntity(
                "http://localhost:" + port + "/api/seats/" + seatId + "/reserve",
                new Req("integration-tester", "01012345678"),
                String.class
        );

        // Then: 성공 또는 의도적 실패(503) 또는 이미 예약됨(400) 허용
        boolean isValidResponse = reserveResp.getStatusCode().is2xxSuccessful() 
                || reserveResp.getStatusCode().value() == 503
                || reserveResp.getStatusCode().value() == 400;
        assertThat(isValidResponse).isTrue();
    }

    @Test
    void testH2DatabaseIntegration() {
        // Given: H2 메모리 DB로 애플리케이션 구동
        
        // When: 좌석 목록 조회
        ResponseEntity<Seat[]> response = rest.getForEntity("http://localhost:" + port + "/api/seats", Seat[].class);
        
        // Then: H2 DB가 정상 동작하고 있음
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        
        // SeatInitializer가 정상 동작했는지 확인
        assertThat(response.getBody()).hasSize(9);
    }

    @Test
    void testRandomPortAndRestTemplate() {
        // Given: 랜덤 포트로 서버 구동
        assertThat(port).isGreaterThan(0);
        assertThat(rest).isNotNull();
        
        // When: TestRestTemplate로 HTTP 요청
        String url = "http://localhost:" + port + "/api/seats";
        ResponseEntity<String> response = rest.getForEntity(url, String.class);
        
        // Then: 정상 응답
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).contains("seatId");
        assertThat(response.getBody()).contains("status");
    }
}