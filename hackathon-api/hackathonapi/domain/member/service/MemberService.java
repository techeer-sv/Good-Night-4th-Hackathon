package hello.hackathonapi.domain.member.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import hello.hackathonapi.domain.member.dto.MemberLoginRequest;
import hello.hackathonapi.domain.member.dto.MemberLoginResponse;
import hello.hackathonapi.domain.member.dto.MemberUpdateRequest;
import hello.hackathonapi.domain.member.entity.Member;
import hello.hackathonapi.domain.member.repository.MemberRepository;
import hello.hackathonapi.global.error.ErrorResponse;
import hello.hackathonapi.global.error.exception.BusinessException;
import hello.hackathonapi.global.error.exception.ErrorCode;
import lombok.RequiredArgsConstructor;


@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;

    // 회원가입
    @Transactional
    public Member registerMember(String name, String email, String password) {
        List<ErrorResponse.FieldError> errors = new ArrayList<>();
        
        if (memberRepository.existsByEmail(email)) {
            errors.add(new ErrorResponse.FieldError("email", email, "이미 사용 중인 이메일입니다."));
        }
        if (memberRepository.existsByName(name)) {
            errors.add(new ErrorResponse.FieldError("name", name, "이미 사용 중인 닉네임입니다."));
        }
        if (!errors.isEmpty()) {
            throw new BusinessException(ErrorCode.INVALID_USER_INPUT, errors);
        }

        Member member = Member.builder()
                .name(name)
                .email(email)
                .password(password)
                .build();

        return memberRepository.save(member);
    }

    // 로그인
    @Transactional
    public MemberLoginResponse loginMember(MemberLoginRequest request) {
        Member member = memberRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        if (!member.getPassword().equals(request.getPassword())) {
            throw new BusinessException(ErrorCode.INVALID_USER_INPUT);
        }

        return MemberLoginResponse.builder()
                .id(member.getId())
                .name(member.getName())
                .email(member.getEmail())
                .build();
    }

    // 회원 단건 조회
    public Member getMember(Long id) {
        return memberRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
    }

    // 회원 전체 조회
    public List<Member> getAllMembers() {
        List<Member> members = memberRepository.findAll();

        if (members.isEmpty()) {
            throw new BusinessException(ErrorCode.USER_LIST_EMPTY);
        }

        return members;
    }

    // 회원 수정
    @Transactional
    public Member updateMember(MemberUpdateRequest request) {
        Member member = memberRepository.findById(request.getId())
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        member.update(request);
        return member;
    }

    // 회원 삭제
    @Transactional
    public Member deleteMember(Long id) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        memberRepository.delete(member);
        return member;
    }
}