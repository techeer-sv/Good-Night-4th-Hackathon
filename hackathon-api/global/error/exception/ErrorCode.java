package hello.hackathonapi.global.error.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum ErrorCode {

    // USER
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "USER_404", "사용자를 찾을 수 없습니다."),
    USER_LIST_EMPTY(HttpStatus.NOT_FOUND, "USER_404", "조회할 사용자가 없습니다."),
    USER_ALREADY_EXISTS(HttpStatus.CONFLICT, "USER_409", "이미 존재하는 사용자입니다."),
    INVALID_USER_INPUT(HttpStatus.BAD_REQUEST, "USER_400", "사용자 입력값이 올바르지 않습니다."),
    
    // SEAT
    SEAT_NOT_FOUND(HttpStatus.NOT_FOUND, "SEAT_404", "좌석을를 찾을 수 없습니다."),
    SEAT_LIST_EMPTY(HttpStatus.NOT_FOUND, "SEAT_404", "조회할 좌석이 없습니다."),
    INVALID_SEAT_INPUT(HttpStatus.BAD_REQUEST, "SEAT_400", "사용자 입력값이 올바르지 않습니다."),
    RESERVATION_SUCCESSFUL(HttpStatus.OK, "RESERVATION_200", "예약에 성공했습니다."),
    
    // CONCERT
    CONCERT_NOT_FOUND(HttpStatus.NOT_FOUND, "CONCERT_404", "공연을 찾을 수 없습니다."),
    CONCERT_LIST_EMPTY(HttpStatus.NOT_FOUND, "CONCERT_404", "조회할 공연이 없습니다."),
    INVALID_CONCERT_DATE(HttpStatus.BAD_REQUEST, "CONCERT_400", "공연 날짜가 올바르지 않습니다."),
    INVALID_CONCERT_INPUT(HttpStatus.BAD_REQUEST, "CONCERT_400", "공연 입력값이 올바르지 않습니다."),

    // RESERVATION
    SEAT_ALREADY_IN_PROGRESS(HttpStatus.CONFLICT, "RESERVATION_409", "해당 좌석은 현재 다른 사용자가 예약을 진행 중입니다."),
    SEAT_ALREADY_RESERVED(HttpStatus.CONFLICT, "RESERVATION_409", "이미 예약된 좌석입니다."),
    SEAT_NOT_IN_CONCERT(HttpStatus.BAD_REQUEST, "RESERVATION_400", "해당 좌석은 선택한 공연의 좌석이 아닙니다."),
    RESERVATION_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "RESERVATION_500", "예약 처리 중 오류가 발생했습니다."),
    LOCK_ACQUISITION_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "RESERVATION_500", "락 획득 중 오류가 발생했습니다."),
    RESERVATION_NOT_FOUND(HttpStatus.NOT_FOUND, "RESERVATION_404", "예약 정보를 찾을 수 없습니다."),
    RESERVATION_NOT_AUTHORIZED(HttpStatus.FORBIDDEN, "RESERVATION_403", "해당 예약에 대한 권한이 없습니다."),
    RESERVATION_NOT_IN_CONCERT(HttpStatus.BAD_REQUEST, "RESERVATION_400", "해당 예약은 선택한 공연의 예약이 아닙니다."),
    RESERVATION_CANCELLATION_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "RESERVATION_500", "예약 취소 중 오류가 발생했습니다."),
    SEAT_NOT_AVAILABLE(HttpStatus.BAD_REQUEST, "RESERVATION_400", "예약 가능한 좌석이 아닙니다.");

    private final HttpStatus httpStatus;
    private final String code;
    private final String message;
}