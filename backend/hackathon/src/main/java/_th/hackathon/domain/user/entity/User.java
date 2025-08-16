package _th.hackathon.domain.user.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user_account")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // PK

    @Column(nullable = false, length = 20)
    private String name; // 사용자 이름

    @Column(nullable = false, length = 100)
    private String password; // 비밀번호

    // private 생성자 - 외부에서 직접 new 사용 불가
    private User(String name, String password) {
        this.name = name;
        this.password = password;
    }

    // 정적 팩토리 메서드
    public static User createUser(String name, String password) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("이름은 필수입니다.");
        }
        if (password == null || password.isBlank()) {
            throw new IllegalArgumentException("비밀번호는 필수입니다.");
        }
        return new User(name, password);
    }
}
