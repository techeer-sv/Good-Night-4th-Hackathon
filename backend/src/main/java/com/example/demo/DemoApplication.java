package com.example.demo;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.util.stream.IntStream;

@SpringBootApplication
public class DemoApplication {

	public static void main(String[] args) {
		SpringApplication.run(DemoApplication.class, args);
	}

	@Bean
	public CommandLineRunner init(SeatRepository seatRepository) {
		return args -> {
			if (seatRepository.count() == 0) {
				IntStream.rangeClosed(1, 9).forEach(i -> {
					Seat seat = new Seat();
					seat.setSeatNumber(i);
					seat.setReserved(false);
					seatRepository.save(seat);
				});
			}
		};
	}
}
