package _th.hackathon.domain.user.service;

import _th.hackathon.domain.user.dto.UserForm;
import _th.hackathon.domain.user.entity.User;
import _th.hackathon.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;

    /** 회원 가입 */
    public User signUp(UserForm form) {
        userRepository.findByName(form.getName())
                .ifPresent(u -> { throw new IllegalStateException("이미 존재하는 이름입니다."); });

        // 정적 팩토리로 엔티티 생성 (Form은 빌더로 만들어 전달)
        User user = User.createUser(form.getName(), form.getPassword());
        return userRepository.save(user);
    }

    /** 로그인 */
    @Transactional(readOnly = true)
    public User signin(String name, String password) {
        User user = userRepository.findByName(name)
                .orElseThrow(() -> new IllegalStateException("이름 또는 비밀번호가 잘못되었습니다."));
        if (!user.getPassword().equals(password)) {
            throw new IllegalStateException("이름 또는 비밀번호가 잘못되었습니다.");
        }
        return user;
    }

    /** 전체 조회 */
    @Transactional(readOnly = true)
    public List<User> findMembers() {
        return userRepository.findAll();
    }

    /** 단건 조회 */
    @Transactional(readOnly = true)
    public User findOne(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("회원이 존재하지 않습니다."));
    }
}
