package hello.hackathonapi.domain.concert.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ConcertUpdateRequest {
    private String name;
    private String description;
    private String date;
}
