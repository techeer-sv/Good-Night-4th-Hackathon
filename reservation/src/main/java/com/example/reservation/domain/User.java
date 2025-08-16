package com.example.reservation.domain;

import com.example.reservation.domain.vo.PhoneNumber;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_name", nullable = false)
    private String userName;

    @Embedded
    @Column(name = "phone", nullable = false, unique = true)
    private PhoneNumber phone;
}