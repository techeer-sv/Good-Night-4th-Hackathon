package hello.hackathonapi.domain.member.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class MemberLoginResponse {
    private Long id;
    private String name;
    private String email;
}
