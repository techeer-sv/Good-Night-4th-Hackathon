// src/main/java/_th/hackathon/domain/reservation/service/ReservationQueryService.java
package _th.hackathon.domain.reservation.service;

import _th.hackathon.domain.reservation.dto.UserReservationRes;
import _th.hackathon.domain.reservation.entity.Reservation;
import _th.hackathon.domain.reservation.repository.ReservationRepository;
import _th.hackathon.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReservationQueryService {

    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;

    public List<UserReservationRes> getUserReservations(Long userId) {
        // 필요하면 유저 존재 검증 (없으면 404 성격의 예외)
        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException("존재하지 않는 유저입니다.");
        }

        List<Reservation> list = reservationRepository.findAllByUserIdWithDetails(userId);

        return list.stream().map(r -> {
            var ps = r.getPerformanceSeat();
            var p  = ps.getPerformance();
            var s  = p.getShow();
            return new UserReservationRes(
                    r.getId(),
                    r.getStatus().name(),
                    r.getCreatedAt(),
                    ps.getId(),
                    ps.getSeatNo(),
                    p.getId(),
                    p.getStartsAt(),
                    s.getId(),
                    s.getTitle(),
                    r.getReserverName(),
                    r.getReserverPhone()
            );
        }).toList();
    }
}
