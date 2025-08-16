package _th.hackathon.domain.reservation.controller;

import _th.hackathon.domain.reservation.service.ReservationService;
import _th.hackathon.domain.user.entity.User;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;


@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService; // 인터페이스 주입 (CAS/Redis 구현 교체 가능)

    // 요청/응답 DTO (record로 간단히)
    public record ReserveReq(Long performanceSeatId, String reserverName, String reserverPhone) {}
    public record ReserveRes(Long reservationId) {}
    public record CancelRes(Long reservationId, String status) {}

    /** 예매 생성: AVAILABLE -> SOLD (DB CAS) + 예약 이력 저장 */
    @PostMapping
    public ResponseEntity<ReserveRes> reserve(HttpSession session, @RequestBody ReserveReq req) {
        User loginUser = (User) session.getAttribute("user");
        if (loginUser == null) {
            return ResponseEntity.status(401).build(); // 로그인 안 된 경우
        }
        Long id = reservationService.reserve(
                loginUser.getId(),
                req.performanceSeatId(),
                req.reserverName(),
                req.reserverPhone()
        );
        return ResponseEntity.created(URI.create("/api/reservations/" + id))
                .body(new ReserveRes(id));
    }


    /** 예매 취소: SOLD -> AVAILABLE */
    @PostMapping("/{id}/cancel")
    public CancelRes cancel(@PathVariable Long id) {
        reservationService.cancel(id);
        return new CancelRes(id, "CANCELLED");
    }

    /** 잘못된 입력 → 400 */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleBadRequest(IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(e.getMessage());
    }

    /** 좌석 충돌 등 비즈니스 에러 → 409 */
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<String> handleConflict(IllegalStateException e) {
        return ResponseEntity.status(409).body(e.getMessage());
    }
}
