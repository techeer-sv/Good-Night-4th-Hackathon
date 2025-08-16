package _th.hackathon.domain.user.service;

import _th.hackathon.domain.user.dto.UserForm;
import _th.hackathon.domain.user.entity.User;
import _th.hackathon.domain.user.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.*;

@SpringBootTest
@Transactional // 각 테스트 후 롤백
class UserServiceTest {

    @Autowired
    UserService userService;

    @Autowired
    UserRepository userRepository;

    private UserForm form(String name, String password) {
        // UserForm에 @Builder가 있다면 ↓ 사용
        return UserForm.builder()
                .name(name)
                .password(password)
                .build();

        // Builder가 없다면 생성자/정적팩토리로 맞게 변경:
        // return new UserForm(name, password);
    }

    @Test
    @DisplayName("회원가입 성공")
    void signUp_success() {
        // given
        UserForm f = form("alice", "pw1");

        // when
        User saved = userService.signUp(f);

        // then
        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getName()).isEqualTo("alice");
        assertThat(userRepository.findByName("alice")).isPresent();
    }

    @Test
    @DisplayName("회원가입 실패 - 중복 이름")
    void signUp_fail_duplicateName() {
        // given
        userService.signUp(form("bob", "pw1"));

        // when & then
        assertThatThrownBy(() -> userService.signUp(form("bob", "pw2")))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("이미 존재하는 이름");
    }

    @Test
    @DisplayName("로그인 성공")
    void signin_success() {
        // given
        userService.signUp(form("carol", "1234"));

        // when
        User loginUser = userService.signin("carol", "1234");

        // then
        assertThat(loginUser.getName()).isEqualTo("carol");
    }

    @Test
    @DisplayName("로그인 실패 - 비밀번호 불일치")
    void signin_fail_wrongPassword() {
        // given
        userService.signUp(form("dave", "abcd"));

        // when & then
        assertThatThrownBy(() -> userService.signin("dave", "xxxx"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("이름 또는 비밀번호가 잘못되었습니다");
    }

    @Test
    @DisplayName("로그인 실패 - 존재하지 않는 이름")
    void signin_fail_nameNotFound() {
        assertThatThrownBy(() -> userService.signin("nope", "pw"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("이름 또는 비밀번호가 잘못되었습니다");
    }

    @Test
    @DisplayName("전체 조회 / 단건 조회")
    void findMembers_and_findOne() {
        // given
        User u1 = userService.signUp(form("eve", "1"));
        User u2 = userService.signUp(form("frank", "2"));

        // when
        var all = userService.findMembers();
        var one = userService.findOne(u1.getId());

        // then
        assertThat(all).extracting("name")
                .contains("eve", "frank");
        assertThat(one.getName()).isEqualTo("eve");
    }
}
