package com.example.demo;

import com.example.demo.config.SeatConstants;
import com.example.demo.entity.Seat;
import com.example.demo.repository.SeatRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.util.stream.IntStream;

@SpringBootApplication
@EnableScheduling
public class DemoApplication {

	public static void main(String[] args) {
		SpringApplication.run(DemoApplication.class, args);
	}

	@Bean
	public CommandLineRunner init(SeatRepository seatRepository) {
		return args -> {
			if (seatRepository.count() == 0) {
				IntStream.rangeClosed(1, SeatConstants.INITIAL_SEAT_COUNT).forEach(i -> {
					Seat seat = new Seat();
					seat.setSeatNumber(i);
					seat.setReserved(false);
					seatRepository.save(seat);
				});
			}
		};
	}
}
