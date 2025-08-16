package com.goodnight.ticket_service.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.Rollback;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import com.goodnight.ticket_service.domain.Member;
import com.goodnight.ticket_service.repository.MemberRepository;

@SpringBootTest
@Transactional // 테스트에서 트랜잭션을 사용하면, 테스트가 끝난 후에 자동으로 롤백된다.
@ActiveProfiles("test") // 테스트 프로파일을 활성화하여, application-test.yml 설정을 사용한다.
public class MemberServiceTest {

    @Autowired
    MemberService memberService;
    @Autowired
    MemberRepository memberRepository;

    @Test
    @Rollback(false) // 테스트 후 롤백하지 않도록 설정
    public void 회원가입() throws Exception {
        // given
        Member member = new Member();
        member.setName("hello");

        // when
        Long saveId = memberService.join(member);

        // then
        assertEquals(member, memberRepository.findById(saveId)); // 저장된 회원과 조회된
                                                                 // 회원이 동일해야 한다.
        System.out.println("Kihong says saveId = " + saveId);

    }

    /*
     * 중복 회원 가입 테스트 => 중복된 회원 이름으로 가입을 시도할 때 IllegalStateException이 발생해야 한다.
     */
    @Test
    void 중복_회원_예외() throws Exception {
        // given
        Member member1 = new Member();
        member1.setName("spring");

        Member member2 = new Member();
        member2.setName("spring");

        // when
        memberService.join(member1);

        // then
        assertThrows(IllegalStateException.class, () -> memberService.join(member2), "예외가 발생해야 한다."); // member2를 가입하려고
                                                                                                      // 할 때
                                                                                                      // IllegalStateException이
                                                                                                      // 발생해야 한다.
    }

    @Test
    void testJoin() {

    }
}