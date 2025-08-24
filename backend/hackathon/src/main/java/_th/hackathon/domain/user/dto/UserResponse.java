package _th.hackathon.domain.user.dto;

import _th.hackathon.domain.user.entity.User;
import lombok.Value;

@Value
public class UserResponse {
    Long id;
    String name;

    public static UserResponse of(User u) {
        return new UserResponse(u.getId(), u.getName());
    }
}