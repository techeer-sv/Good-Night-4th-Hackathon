package hello.hackathonapi.domain.seat.dto;

import hello.hackathonapi.domain.seat.entity.SeatGrade;
import hello.hackathonapi.domain.seat.entity.SeatStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SeatUpdateRequest {
    private Long concertId;
    private Integer number;
    private SeatGrade grade;
    private Integer price;
    private SeatStatus status;
}
