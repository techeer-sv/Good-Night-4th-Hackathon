package hello.hackathonapi.domain.concert.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;

import hello.hackathonapi.domain.concert.dto.ConcertCreateRequest;
import hello.hackathonapi.domain.concert.dto.ConcertUpdateRequest;
import hello.hackathonapi.domain.concert.entity.Concert;
import hello.hackathonapi.domain.concert.service.ConcertService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/concerts")
@RequiredArgsConstructor
public class ConcertController {

    private final ConcertService concertService;
    
    @Operation(summary = "공연생성", description = "새로운 공연을 등록합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "공연생성 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청: 공연 입력값이 올바르지 않음")
    })
    @PostMapping
    public ResponseEntity<Concert> createConcert(@RequestBody ConcertCreateRequest request) {
        Concert createdConcert = concertService.createConcert(request);

        return new ResponseEntity<>(createdConcert, HttpStatus.CREATED);
    }

    @Operation(summary = "공연 수정", description = "공연을 수정합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "공연 수정 성공"),
            @ApiResponse(responseCode = "404", description = "잘못된 요청: 공연을 찾을 수 없음")
    })
    @PutMapping("/{concertId}")
    public ResponseEntity<Concert> updateConcert(@PathVariable Long concertId, @RequestBody ConcertUpdateRequest request) {
        Concert updatedConcert = concertService.updateConcert(concertId, request);
        
        return new ResponseEntity<>(updatedConcert, HttpStatus.OK);
    }

    @Operation(summary = "공연 전체 조회", description = "모든 공연을 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "공연 전체 조회 성공"),
            @ApiResponse(responseCode = "404", description = "잘못된 요청: 공연이 존재하지 않음")
    })
    @GetMapping
    public ResponseEntity<List<Concert>> getAllConcerts() {
        List<Concert> concerts = concertService.getAllConcerts();

        return new ResponseEntity<>(concerts, HttpStatus.OK);
    }

    @Operation(summary = "공연 단건 조회", description = "특정 공연을 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "공연 조회 성공"),
            @ApiResponse(responseCode = "404", description = "잘못된 요청: 공연을 찾을 수 없음")
    })
    @GetMapping("/{concertId}")
    public ResponseEntity<Concert> getConcert(@PathVariable Long concertId) {
        Concert concert = concertService.getConcert(concertId);
        return new ResponseEntity<>(concert, HttpStatus.OK);
    }

    @Operation(summary = "공연 단건 삭제", description = "공연 ID로 삭제합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "공연 삭제 성공"),
            @ApiResponse(responseCode = "404", description = "잘못된 요청: 공연을 찾을 수 없음")
    })
    @DeleteMapping("/{concertId}")
    public ResponseEntity<Void> deleteConcert(@PathVariable Long concertId) {
        concertService.deleteConcert(concertId);
        
        return new ResponseEntity<>(HttpStatus.OK);
    }
}
