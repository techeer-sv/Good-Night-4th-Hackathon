package com.example.reservation.integration;

import com.example.reservation.domain.Seat;
import com.example.reservation.repository.SeatRepository;
import com.example.reservation.redis.RedisService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;

import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class SeatIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private SeatRepository seatRepository;

    @Autowired
    private RedisService redisService;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        seatRepository.save(Seat.builder().seatNumber("A1").isReserved(false).build());

        redisService.setValueWithTTL("seat:1", "s1", 200);
    }

    @Test
    void 좌석예약_통합테스트() throws Exception {
        var requestDto = new ObjectMapper().createObjectNode();
        requestDto.put("seatId", 1L);
        requestDto.put("userName", "테스트유저");
        requestDto.put("phone", "010-1111-2222");
        requestDto.put("sessionId", "s1");

        mockMvc.perform(post("/api/seats/reserve")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.seatId").value(1L))
                .andExpect(jsonPath("$.userName").value("테스트유저"));

        Optional<Seat> updated = seatRepository.findById(1L);
        assertThat(updated).isPresent();
        assertThat(updated.get().isReserved()).isTrue();
    }
}