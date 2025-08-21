package com.example.reservation.repository;

import com.example.reservation.domain.User;
import com.example.reservation.domain.vo.PhoneNumber;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByPhone(PhoneNumber phone);
}