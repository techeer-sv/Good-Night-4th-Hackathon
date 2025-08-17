package com.example.reservation.domain.vo;

import jakarta.persistence.Embeddable;
import lombok.Getter;

import java.util.Objects;
import java.util.regex.Pattern;

@Embeddable
@Getter
public class PhoneNumber {

    private static final Pattern PHONE_PATTERN = Pattern.compile("^010-\\d{4}-\\d{4}$");

    private String value;

    protected PhoneNumber() {
    }

    public PhoneNumber(String value) {
        if (!PHONE_PATTERN.matcher(value).matches()) {
            throw new IllegalArgumentException("전화번호는 '010-xxxx-xxxx' 형식이어야 합니다.");
        }
        this.value = value;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PhoneNumber)) return false;
        PhoneNumber that = (PhoneNumber) o;
        return Objects.equals(getValue(), that.getValue());
    }

    @Override
    public int hashCode() {
        return Objects.hash(getValue());
    }

    @Override
    public String toString() {
        return value;
    }
}