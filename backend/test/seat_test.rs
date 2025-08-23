// -----------------------------
// Tests
// -----------------------------
#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn seat_reservation_payload_deserialize_snake_case_ok() {
        let v = json!({"user_name":"Alice","phone":"010"});
        let s: SeatReservationPayload = serde_json::from_value(v).expect("snake_case should deserialize");
        assert_eq!(s.user_name, "Alice");
        assert_eq!(s.phone.as_deref(), Some("010"));
    }

    #[test]
    fn seat_reservation_payload_deserialize_camel_case_rejected() {
        let v = json!({"userName":"Alice"});
        let err = serde_json::from_value::<SeatReservationPayload>(v).err().expect("camelCase must fail now");
        // Error message should mention missing field user_name
        let msg = err.to_string();
        assert!(msg.contains("user_name"), "unexpected error msg: {msg}");
    }
}
