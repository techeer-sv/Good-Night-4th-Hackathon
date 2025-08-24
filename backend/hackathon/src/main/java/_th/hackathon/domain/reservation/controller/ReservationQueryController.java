// src/main/java/_th/hackathon/domain/reservation/controller/ReservationQueryController.java
package _th.hackathon.domain.reservation.controller;

import _th.hackathon.domain.reservation.dto.UserReservationRes;
import _th.hackathon.domain.reservation.service.ReservationQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users/{userId}/reservations")
public class ReservationQueryController {

    private final ReservationQueryService reservationQueryService;

    @GetMapping
    public List<UserReservationRes> list(@PathVariable Long userId) {
        return reservationQueryService.getUserReservations(userId);
    }
}
