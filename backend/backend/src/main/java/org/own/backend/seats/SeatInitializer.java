package org.own.backend.seats;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.util.List;

@Configuration
@Profile("!test")
@RequiredArgsConstructor
public class SeatInitializer {

    private final SeatRepository seatRepository;

    @Bean
    @Transactional
    public ApplicationRunner seedSeats() {
        return args -> {
            List<Seat> newSeats = new ArrayList<>();
            for (int i = 1; i <= 9; i++) {
                if (!seatRepository.existsById(i)) { // 존재 시 건너뛰기
                    Seat seat = new Seat();
                    seat.setSeatId(i);
                    seat.setStatus(SeatStatus.AVAILABLE);
                    newSeats.add(seat);
                }
            }
            if (!newSeats.isEmpty()) {
                seatRepository.saveAll(newSeats); // 일괄 저장
            }
        };
    }
}


