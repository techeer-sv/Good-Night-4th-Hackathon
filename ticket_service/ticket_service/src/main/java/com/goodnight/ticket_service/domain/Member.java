package com.goodnight.ticket_service.domain;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
public class Member {
    @Id
    @GeneratedValue // 자동 생성 ID
    @Column(name = "member_id")
    private Long id;

    private String name;

    @OneToMany(mappedBy = "member")
    // 예약과 회원은 1:N 관계이므로, 회원이 여러 예약을 가질 수 있습니다.
    private List<Reservation> reservations = new ArrayList<>();

}
