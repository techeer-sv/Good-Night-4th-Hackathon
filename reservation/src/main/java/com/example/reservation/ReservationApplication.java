package com.example.reservation;

import com.example.reservation.domain.Seat;
import com.example.reservation.repository.SeatRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class ReservationApplication {

	public static void main(String[] args) {
		SpringApplication.run(ReservationApplication.class, args);
	}

	@Bean
	public CommandLineRunner initData(SeatRepository seatRepository) {
		return args -> {
			if (seatRepository.count() == 0) {
				char row = 'A';
				for (int i = 0; i < 3; i++) {
					for (int j = 1; j <= 3; j++) {
						String seatNumber = String.valueOf(row) + j;
						Seat seat = Seat.builder()
								.seatNumber(seatNumber)
								.isReserved(false)
								.build();
						seatRepository.save(seat);
					}
					row++;
				}
			}
		};
	}
}