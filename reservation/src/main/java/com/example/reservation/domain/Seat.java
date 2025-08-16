package com.example.reservation.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "seat")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Seat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "seat_number", length = 20, nullable = false, unique = true)
    private String seatNumber;

    @Column(name = "is_reserved", nullable = false)
    private boolean isReserved;
}