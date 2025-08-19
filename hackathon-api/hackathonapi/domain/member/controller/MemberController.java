package hello.hackathonapi.domain.member.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;

import hello.hackathonapi.domain.member.dto.MemberLoginRequest;
import hello.hackathonapi.domain.member.dto.MemberLoginResponse;
import hello.hackathonapi.domain.member.dto.MemberRegisterRequest;
import hello.hackathonapi.domain.member.dto.MemberUpdateRequest;
import hello.hackathonapi.domain.member.entity.Member;
import hello.hackathonapi.domain.member.service.MemberService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/members")
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;

    @Operation(summary = "회원가입", description = "새로운 회원을 등록합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "회원가입 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청: 중복된 이메일 또는 닉네임")
    })
    @PostMapping
    public ResponseEntity<Member> registerMember(@RequestBody MemberRegisterRequest request) {
        Member createdMember = memberService.registerMember(
                request.getName(),
                request.getEmail(),
                request.getPassword()
        );
        return new ResponseEntity<>(createdMember, HttpStatus.CREATED);
    }

    @Operation(summary = "회원 로그인", description = "회원 로그인을 합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "회원 로그인 성공"),
            @ApiResponse(responseCode = "404", description = "잘못된 요청: 회원을 찾을 수 없음")
    })
    @PostMapping("/login")
    public ResponseEntity<MemberLoginResponse> loginMember(
            @RequestBody @Valid MemberLoginRequest request) {
        MemberLoginResponse response = memberService.loginMember(request);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "회원 단건 조회", description = "회원 ID로 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "회원 조회 성공"),
            @ApiResponse(responseCode = "404", description = "잘못된 요청: 회원을 찾을 수 없음")
    })
    @GetMapping("/{memberId}")
    public ResponseEntity<Member> getMember(
            @Parameter(description = "조회할 회원의 ID", required = true)
            @PathVariable Long memberId) {
        Member member = memberService.getMember(memberId);
        return new ResponseEntity<>(member, HttpStatus.OK);
    }

    @Operation(summary = "회원 전체 조회", description = "모든 회원을 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "회원 전체 조회 성공"),
            @ApiResponse(responseCode = "404", description = "잘못된 요청: 회원이 존재하지 않음")
    })
    @GetMapping
    public ResponseEntity<List<Member>> getAllMembers() {
        List<Member> members = memberService.getAllMembers();
        return new ResponseEntity<>(members, HttpStatus.OK);
    }

    @Operation(summary = "회원 정보 수정", description = "회원의 정보를 수정합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "회원 수정 성공"),
            @ApiResponse(responseCode = "404", description = "잘못된 요청: 회원을 찾을 수 없음")
    })
    @PutMapping
    public ResponseEntity<Member> updateMember(@RequestBody MemberUpdateRequest request) {
        Member member = memberService.updateMember(request);
        return new ResponseEntity<>(member, HttpStatus.OK);
    }

    @Operation(summary = "회원 삭제", description = "회원 ID로 삭제합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "회원 삭제 성공"),
            @ApiResponse(responseCode = "404", description = "잘못된 요청: 회원을 찾을 수 없음")
    })
    @DeleteMapping("/{memberId}")
    public ResponseEntity<Member> deleteMember(
            @Parameter(description = "삭제할 회원의 ID", required = true)
            @PathVariable Long memberId) {
        Member member = memberService.deleteMember(memberId);
        return new ResponseEntity<>(member, HttpStatus.OK);
    }
}