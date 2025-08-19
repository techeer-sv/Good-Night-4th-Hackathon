package hello.hackathonapi.domain.member.service;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import hello.hackathonapi.domain.member.dto.MemberLoginRequest;
import hello.hackathonapi.domain.member.dto.MemberLoginResponse;
import hello.hackathonapi.domain.member.dto.MemberUpdateRequest;
import hello.hackathonapi.domain.member.entity.Member;
import hello.hackathonapi.domain.member.repository.MemberRepository;
import hello.hackathonapi.global.error.exception.BusinessException;
import hello.hackathonapi.global.error.exception.ErrorCode;

@ExtendWith(MockitoExtension.class)
class MemberServiceTest {
    
    @Mock
    private MemberRepository memberRepository;
    
    @InjectMocks
    private MemberService memberService;
    
    @Test
    @DisplayName("회원가입 성공 - 정상적인 데이터로 회원가입")
    void registerMember_Success() {
        // given
        String name = "testUser";
        String email = "test@test.com";
        String password = "password123";
        
        Member member = Member.builder()
            .name(name)
            .email(email)
            .password(password)
            .build();
        
        when(memberRepository.existsByEmail(email)).thenReturn(false);
        when(memberRepository.existsByName(name)).thenReturn(false);
        when(memberRepository.save(any(Member.class))).thenReturn(member);
        
        // when
        Member result = memberService.registerMember(name, email, password);
        
        // then
        assertThat(result.getName()).isEqualTo(name);
        assertThat(result.getEmail()).isEqualTo(email);
        assertThat(result.getPassword()).isEqualTo(password);
        
        verify(memberRepository).existsByEmail(email);
        verify(memberRepository).existsByName(name);
        verify(memberRepository).save(any(Member.class));
    }
    
    @Test
    @DisplayName("회원가입 실패 - 중복된 이메일")
    void registerMember_Fail_DuplicateEmail() {
        // given
        String name = "testUser";
        String email = "duplicate@test.com";
        String password = "password123";
        
        when(memberRepository.existsByEmail(email)).thenReturn(true);
        
        // when & then
        assertThatThrownBy(() -> memberService.registerMember(name, email, password))
            .isInstanceOf(BusinessException.class)
            .hasFieldOrPropertyWithValue("errorCode", ErrorCode.INVALID_USER_INPUT);
            
        verify(memberRepository).existsByEmail(email);
        verify(memberRepository, never()).save(any(Member.class));
    }
    
    @Test
    @DisplayName("회원가입 실패 - 중복된 닉네임")
    void registerMember_Fail_DuplicateName() {
        // given
        String name = "duplicateName";
        String email = "test@test.com";
        String password = "password123";
        
        when(memberRepository.existsByEmail(email)).thenReturn(false);
        when(memberRepository.existsByName(name)).thenReturn(true);
        
        // when & then
        assertThatThrownBy(() -> memberService.registerMember(name, email, password))
            .isInstanceOf(BusinessException.class)
            .hasFieldOrPropertyWithValue("errorCode", ErrorCode.INVALID_USER_INPUT);
            
        verify(memberRepository).existsByEmail(email);
        verify(memberRepository).existsByName(name);
        verify(memberRepository, never()).save(any(Member.class));
    }
    
    @Test
    @DisplayName("로그인 성공 - 올바른 이메일과 비밀번호")
    void loginMember_Success() {
        // given
        MemberLoginRequest request = new MemberLoginRequest();
        request.setEmail("test@test.com");
        request.setPassword("password123");
        
        Member member = Member.builder()
            .name("testUser")
            .email("test@test.com")
            .password("password123")
            .build();
        
        when(memberRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(member));
        
        // when
        MemberLoginResponse result = memberService.loginMember(request);
        
        // then
        assertThat(result.getName()).isEqualTo("testUser");
        assertThat(result.getEmail()).isEqualTo("test@test.com");
        
        verify(memberRepository).findByEmail(request.getEmail());
    }
    
    @Test
    @DisplayName("로그인 실패 - 존재하지 않는 이메일")
    void loginMember_Fail_EmailNotFound() {
        // given
        MemberLoginRequest request = new MemberLoginRequest();
        request.setEmail("nonexistent@test.com");
        request.setPassword("password123");
        
        when(memberRepository.findByEmail(request.getEmail())).thenReturn(Optional.empty());
        
        // when & then
        assertThatThrownBy(() -> memberService.loginMember(request))
            .isInstanceOf(BusinessException.class)
            .hasFieldOrPropertyWithValue("errorCode", ErrorCode.USER_NOT_FOUND);
            
        verify(memberRepository).findByEmail(request.getEmail());
    }
    
    @Test
    @DisplayName("로그인 실패 - 잘못된 비밀번호")
    void loginMember_Fail_WrongPassword() {
        // given
        MemberLoginRequest request = new MemberLoginRequest();
        request.setEmail("test@test.com");
        request.setPassword("wrongpassword");
        
        Member member = Member.builder()
            .name("testUser")
            .email("test@test.com")
            .password("correctpassword")
            .build();
        
        when(memberRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(member));
        
        // when & then
        assertThatThrownBy(() -> memberService.loginMember(request))
            .isInstanceOf(BusinessException.class)
            .hasFieldOrPropertyWithValue("errorCode", ErrorCode.INVALID_USER_INPUT);
            
        verify(memberRepository).findByEmail(request.getEmail());
    }
    
    @Test
    @DisplayName("회원 단건 조회 성공")
    void getMember_Success() {
        // given
        Long memberId = 1L;
        Member member = Member.builder()
            .name("testUser")
            .email("test@test.com")
            .password("password123")
            .build();
        
        when(memberRepository.findById(memberId)).thenReturn(Optional.of(member));
        
        // when
        Member result = memberService.getMember(memberId);
        
        // then
        assertThat(result.getName()).isEqualTo("testUser");
        
        verify(memberRepository).findById(memberId);
    }
    
    @Test
    @DisplayName("회원 단건 조회 실패 - 존재하지 않는 회원")
    void getMember_Fail_MemberNotFound() {
        // given
        Long memberId = 999L;
        
        when(memberRepository.findById(memberId)).thenReturn(Optional.empty());
        
        // when & then
        assertThatThrownBy(() -> memberService.getMember(memberId))
            .isInstanceOf(BusinessException.class)
            .hasFieldOrPropertyWithValue("errorCode", ErrorCode.USER_NOT_FOUND);
            
        verify(memberRepository).findById(memberId);
    }
    
    @Test
    @DisplayName("회원 전체 조회 성공")
    void getAllMembers_Success() {
        // given
        List<Member> members = Arrays.asList(
            Member.builder().name("user1").email("user1@test.com").password("pass1").build(),
            Member.builder().name("user2").email("user2@test.com").password("pass2").build()
        );
        
        when(memberRepository.findAll()).thenReturn(members);
        
        // when
        List<Member> result = memberService.getAllMembers();
        
        // then
        assertThat(result).hasSize(2);
        assertThat(result.get(0).getName()).isEqualTo("user1");
        assertThat(result.get(1).getName()).isEqualTo("user2");
        
        verify(memberRepository).findAll();
    }
    
    @Test
    @DisplayName("회원 전체 조회 실패 - 회원이 존재하지 않음")
    void getAllMembers_Fail_NoMembers() {
        // given
        when(memberRepository.findAll()).thenReturn(List.of());
        
        // when & then
        assertThatThrownBy(() -> memberService.getAllMembers())
            .isInstanceOf(BusinessException.class)
            .hasFieldOrPropertyWithValue("errorCode", ErrorCode.USER_LIST_EMPTY);
            
        verify(memberRepository).findAll();
    }
    
    @Test
    @DisplayName("회원 정보 수정 성공")
    void updateMember_Success() {
        // given
        MemberUpdateRequest request = new MemberUpdateRequest();
        request.setId(1L);
        request.setName("updatedName");
        request.setEmail("updated@test.com");
        request.setPassword("newpassword");
        
        Member member = Member.builder()
            .name("oldName")
            .email("old@test.com")
            .password("oldpassword")
            .build();
        
        when(memberRepository.findById(request.getId())).thenReturn(Optional.of(member));
        
        // when
        Member result = memberService.updateMember(request);
        
        // then
        assertThat(result.getName()).isEqualTo("updatedName");
        assertThat(result.getEmail()).isEqualTo("updated@test.com");
        
        verify(memberRepository).findById(request.getId());
    }
    
    @Test
    @DisplayName("회원 정보 수정 실패 - 존재하지 않는 회원")
    void updateMember_Fail_MemberNotFound() {
        // given
        MemberUpdateRequest request = new MemberUpdateRequest();
        request.setId(999L);
        request.setName("updatedName");
        request.setEmail("updated@test.com");
        request.setPassword("newpassword");
        
        when(memberRepository.findById(request.getId())).thenReturn(Optional.empty());
        
        // when & then
        assertThatThrownBy(() -> memberService.updateMember(request))
            .isInstanceOf(BusinessException.class)
            .hasFieldOrPropertyWithValue("errorCode", ErrorCode.USER_NOT_FOUND);
            
        verify(memberRepository).findById(request.getId());
    }
    
    @Test
    @DisplayName("회원 삭제 성공")
    void deleteMember_Success() {
        // given
        Long memberId = 1L;
        Member member = Member.builder()
            .name("testUser")
            .email("test@test.com")
            .password("password123")
            .build();
        
        when(memberRepository.findById(memberId)).thenReturn(Optional.of(member));
        
        // when
        Member result = memberService.deleteMember(memberId);
        
        // then
        assertThat(result.getName()).isEqualTo("testUser");
        
        verify(memberRepository).findById(memberId);
        verify(memberRepository).delete(member);
    }
    
    @Test
    @DisplayName("회원 삭제 실패 - 존재하지 않는 회원")
    void deleteMember_Fail_MemberNotFound() {
        // given
        Long memberId = 999L;
        
        when(memberRepository.findById(memberId)).thenReturn(Optional.empty());
        
        // when & then
        assertThatThrownBy(() -> memberService.deleteMember(memberId))
            .isInstanceOf(BusinessException.class)
            .hasFieldOrPropertyWithValue("errorCode", ErrorCode.USER_NOT_FOUND);
            
        verify(memberRepository).findById(memberId);
        verify(memberRepository, never()).delete(any(Member.class));
    }
}
