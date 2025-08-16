package _th.hackathon.domain.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserForm {
    @NotBlank
    @Size(max = 20)
    private String name;

    @NotBlank
    @Size(min = 4, max = 100)
    private String password;
}