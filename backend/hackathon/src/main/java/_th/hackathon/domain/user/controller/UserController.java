package _th.hackathon.domain.user.controller;

import _th.hackathon.domain.user.dto.UserForm;
import _th.hackathon.domain.user.dto.UserResponse;
import _th.hackathon.domain.user.entity.User;
import _th.hackathon.domain.user.service.UserService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
public class UserController {

    private static final String SESSION_USER_KEY = "user";

    private final UserService memberService;

    /** 회원가입 */
    @PostMapping("/signup")
    public UserResponse join(@RequestBody @Valid UserForm form) {
        User saved = memberService.signUp(form);
        return UserResponse.of(saved); // 비밀번호 제외
    }

    /** 로그인: 세션에 사용자 저장 */
    @PostMapping("/signin")
    public UserResponse signin(HttpSession session, @RequestBody @Valid UserForm form) {
        User user = memberService.signin(form.getName(), form.getPassword());
        session.setAttribute(SESSION_USER_KEY, user);
        return UserResponse.of(user);
    }

    /** 로그아웃: 세션 무효화 */
    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok("로그아웃되었습니다.");
    }
}
