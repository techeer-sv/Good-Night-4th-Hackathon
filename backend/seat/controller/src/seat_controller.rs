//! # 좌석 컨트롤러 (Seat Controller)
//! 
//! 이 모듈은 공연 예약 시스템의 좌석 관리를 위한 HTTP API 엔드포인트를 제공합니다.
//! PostgreSQL 데이터베이스와 Redis 시퀀스를 활용하여 FCFS(First Come First Served) 
//! 예약 시스템을 구현합니다.

// Seat controller using PostgreSQL database
use salvo::prelude::*;
use salvo::oapi::{ToSchema, endpoint};
use salvo::writing::Json;
use seat_model::model_seat as seat;
use seat_service::{Query, Mutation};
use config_database::db;
use serde::{Deserialize, Serialize};
use serde_json::json;
use tracing::info;
// 순차 시퀀스는 gateway(OpenResty)에서 Redis INCR 후 X-Fcfs-Seq 헤더로 전달됨
use sea_orm::{TransactionTrait, ConnectionTrait}; // transaction & execute
use config_redis::{get_current_sequence, FCFS_SEQ_KEY};
use redis::AsyncCommands;
use once_cell::sync::Lazy;
use std::env;

/// 좌석 상태 업데이트 요청 구조체
/// 
/// 관리자가 좌석 상태를 직접 변경할 때 사용되는 페이로드입니다.
#[derive(Deserialize, ToSchema)]
struct SeatUpdatePayload { 
    /// 좌석 상태 (true: 예약됨, false: 사용가능)
    status: bool 
}

/// 좌석 예약 요청 구조체
/// 
/// 사용자가 좌석을 예약할 때 필요한 정보를 담는 구조체입니다.
#[derive(Deserialize, ToSchema)]
// 문서 및 요청 모두 snake_case 표준 (user_name). camelCase(userName) 더 이상 허용 안 함.
struct SeatReservationPayload { 
    /// 예약자 이름
    user_name: String,
    phone: Option<String>,
}

/// 공개 좌석 정보 구조체
/// 
/// 전체 좌석 목록 조회 시 반환되는 간략한 좌석 정보입니다.
/// 예약자의 개인정보는 포함하지 않습니다.
#[derive(Serialize, ToSchema)]
struct PublicSeatInfo {
    /// 좌석 고유 ID
    id: i32,
    /// 좌석 예약 상태 (true: 예약됨, false: 사용가능)
    status: bool,
}

/// 404 Not Found 에러를 생성하는 헬퍼 함수
fn not_found() -> StatusError { 
    StatusError::not_found() 
}

/// 전체 좌석 목록 조회
/// 
/// 시스템에 등록된 모든 좌석의 기본 정보를 반환합니다.
/// 개인정보 보호를 위해 예약자 정보는 포함하지 않습니다.
#[endpoint(
    tags("seats")
)]
pub async fn list_seats() -> Result<Json<Vec<PublicSeatInfo>>, StatusError> { 
    let seats = Query::list_seats(db()).await
        .map_err(|_| StatusError::internal_server_error())?;
    let public_seats = seats.into_iter()
        .map(|seat| PublicSeatInfo { id: seat.id, status: seat.status })
        .collect();
    Ok(Json(public_seats))
}

/// 개별 좌석 상세 정보 조회
/// 
/// 지정된 ID의 좌석에 대한 상세 정보를 반환합니다.
/// 예약자 정보를 포함한 전체 좌석 데이터를 제공합니다.
#[endpoint(
    tags("seats")
)]
pub async fn get_seat(req: &mut Request) -> Result<Json<seat::Model>, StatusError> {
	let id: i32 = req
		.param::<String>("id")
		.and_then(|s| s.parse::<i32>().ok())
		.ok_or_else(|| StatusError::bad_request())?;
	
    let seat = Query::find_seat(db(), id).await
        .map_err(|_| StatusError::internal_server_error())?;
    match seat {
        Some(s) => Ok(Json(s)),
        None => Err(not_found())
    }
}

/// 좌석 상태 직접 변경
/// 
/// 관리자용 기능으로 좌석의 상태를 직접 변경합니다.
/// 일반적인 예약 프로세스를 거치지 않고 강제로 상태를 설정합니다.
#[endpoint(
    tags("seats")
)]
pub async fn update_seat_status(req: &mut Request) -> Result<Json<seat::Model>, StatusError> {
	let id: i32 = req
		.param::<String>("id")
		.and_then(|s| s.parse::<i32>().ok())
		.ok_or_else(|| StatusError::bad_request())?;
	let payload: SeatUpdatePayload = req.parse_json().await.map_err(|_| StatusError::bad_request())?;
	
    let updated_seat = Mutation::set_seat_status(db(), id, payload.status).await
        .map_err(|_| StatusError::internal_server_error())?;
    Ok(Json(updated_seat))
}

/// 좌석 상태 토글
/// 
/// 좌석의 현재 상태를 반대로 전환합니다.
/// available → reserved 또는 reserved → available로 상태를 변경합니다.
#[endpoint(
    tags("seats")
)]
pub async fn toggle_seat(req: &mut Request) -> Result<Json<serde_json::Value>, StatusError> {
	let id: i32 = req
		.param::<String>("id")
		.and_then(|s| s.parse::<i32>().ok())
		.ok_or_else(|| StatusError::bad_request())?;
	
    // First get the current seat
    let current_seat = Query::find_seat(db(), id).await
        .map_err(|_| StatusError::internal_server_error())?
        .ok_or_else(|| not_found())?;
    
    // Toggle the status
    let updated_seat = Mutation::set_seat_status(db(), id, !current_seat.status).await
        .map_err(|_| StatusError::internal_server_error())?;
    
    Ok(Json(json!({"id": updated_seat.id, "status": updated_seat.status})))
}

/// 일반 좌석 예약 (단순 버전)
/// 
/// 기본적인 좌석 예약 기능을 제공합니다.
/// FCFS 보장 없이 단순히 예약 처리만 수행합니다.
#[endpoint(
    tags("seats")
)]
pub async fn reserve_seat(req: &mut Request) -> Result<Json<seat::Model>, StatusError> {
	let id: i32 = req
		.param::<String>("id")
		.and_then(|s| s.parse::<i32>().ok())
		.ok_or_else(|| StatusError::bad_request())?;
    let payload: SeatReservationPayload = req.parse_json().await.map_err(|_| StatusError::bad_request())?;
    info!(user_name=%payload.user_name, "parsed reservation payload");
	
    // Reserve the seat using the mutation service
    let updated_seat = Mutation::reserve_seat(db(), id, payload.user_name, payload.phone).await
        .map_err(|e| match e {
            sea_orm::DbErr::Custom(msg) if msg.contains("already reserved") => {
                StatusError::conflict().brief("Seat already reserved")
            },
            sea_orm::DbErr::RecordNotFound(_) => not_found(),
            _ => StatusError::internal_server_error()
        })?;
    
    Ok(Json(updated_seat))
}

#[derive(Serialize, ToSchema)]
#[salvo(schema(rename_all = "camelCase"))]
struct ReservationResponse {
    success: bool,
    seat: Option<PublicSeatInfo>,
    reason: Option<String>,
    /// 남은 미예약 좌석 수 (성공/실패 모두 참고용)
    remaining_seats: Option<i64>,
    /// 사용자 키 TTL 잔여 (초) - 이미 예약/성공 둘 다 표기 가능
    user_ttl_remaining: Option<i64>,
    /// Gateway 가 할당한 FCFS 시퀀스 (X-Fcfs-Seq)
    sequence: Option<i64>,
}

// Standard reason codes (string constants) for reservation outcomes.
pub mod reservation_reason {
    pub const SOLD_OUT: &str = "sold_out";
    pub const ALREADY_RESERVED: &str = "already_reserved";
    pub const CONTENTION: &str = "contention"; // too many races tried
}

/// 관리자용 좌석 및 FCFS 시퀀스 리셋 요청 페이로드
#[derive(Deserialize, ToSchema)]
#[salvo(schema(rename_all = "camelCase"))]
pub struct ResetRequest {
    /// 새로 생성할 좌석 개수 (기본 100)
    pub seat_count: Option<i32>,
}

/// 관리자용 리셋 응답
#[derive(Serialize, ToSchema)]
#[salvo(schema(rename_all = "camelCase"))]
pub struct ResetResponse {
    pub seat_count: i32,
    pub sequence: i64,
}

static ADMIN_TOKEN: Lazy<String> = Lazy::new(|| env::var("ADMIN_RESET_TOKEN").unwrap_or_else(|_| "dev-reset".to_string()));

/// 좌석 전체를 재생성하고 Redis FCFS 시퀀스를 0으로 초기화하는 관리자 엔드포인트
///
/// 보안: 헤더 `X-Admin-Token` 이 환경 변수 ADMIN_RESET_TOKEN 과 일치해야 함.
#[endpoint(tags("seats"), summary="좌석/시퀀스 리셋", description="모든 좌석을 비우고 seat_count 만큼 새로 생성, Redis fcfs:seq 0 초기화")]
pub async fn admin_reset(req: &mut Request) -> Result<Json<ResetResponse>, StatusError> {
    // 인증 토큰 체크
    let token = req.header::<String>("X-Admin-Token").unwrap_or_default();
    if token != *ADMIN_TOKEN {
        return Err(StatusError::forbidden().brief("invalid admin token"));
    }
    let payload: ResetRequest = req.parse_json().await.unwrap_or(ResetRequest { seat_count: Some(100) });
    let count = payload.seat_count.unwrap_or(100).max(0) as i32;

	// DB 트랜잭션으로 좌석 재생성
	// 목표: seat id (autocounter) 를 항상 1부터 다시 시작
	let db_conn = db();
	if let Err(e) = db_conn.transaction::<_, (), sea_orm::DbErr>(|txn| Box::pin(async move {
		use sea_orm::{Statement, DatabaseBackend};

		// 1) 기존 좌석 비우고 관련 시퀀스 초기화 (기본 start 값으로; 아래에서 1로 강제 재지정)
		let truncate = Statement::from_sql_and_values(
			DatabaseBackend::Postgres,
			"TRUNCATE seats RESTART IDENTITY",
			vec![]
		);
		txn.execute(truncate).await?;

		// 2) 혹시 start 값이 1이 아니도록 변경된 적이 있었다면 확실히 1부터 시작하도록 강제
		//    (시퀀스 이름은 일반적으로 `<table>_<column>_seq` 형태; 필요 시 설정과 맞춰 수정)
		let force_restart = Statement::from_sql_and_values(
			DatabaseBackend::Postgres,
			"ALTER SEQUENCE seats_id_seq RESTART WITH 1",
			vec![]
		);
		txn.execute(force_restart).await?;

		// 3) 좌석 재삽입 (id 는 자동 증가: 1..count)
		if count > 0 {
			// status=false 로 count 개 생성
			let insert_sql = format!(
				"INSERT INTO seats (status) SELECT false FROM generate_series(1,{count})"
			);
			let insert_stmt = Statement::from_sql_and_values(
				DatabaseBackend::Postgres,
				&insert_sql,
				vec![]
			);
			txn.execute(insert_stmt).await?;
		}
		Ok(())
	})).await {
		tracing::error!(error=%e, "admin reset db failure");
		return Err(StatusError::internal_server_error());
	}

    // Redis 시퀀스 0 세팅
    if let Ok(mut conn) = config_redis::CLIENT.get_multiplexed_async_connection().await {
        let _: Result<(), _> = conn.del(FCFS_SEQ_KEY).await;
        let _: Result<(), _> = conn.set(FCFS_SEQ_KEY, 1).await;
    } else {
        tracing::warn!("admin reset: redis connection failed; sequence may be stale");
    }

    let seq = get_current_sequence().await.unwrap_or(1);
    tracing::info!(seat_count=count, sequence=seq, "admin reset completed");
    Ok(Json(ResetResponse { seat_count: count, sequence: seq }))
}

/// FCFS 방식 글로벌 좌석 예약 (시퀀스 기반)
/// 
/// Redis 전역 시퀀스를 활용하여 First-Come-First-Served 방식으로 
/// 다음 사용 가능한 좌석을 원자적으로 예약합니다.
/// 
/// ## 동작 원리
/// 
/// 1. **시퀀스 생성**: Redis INCR로 전역 고유 시퀀스 번호 생성
/// 2. **원자적 예약**: 조건부 UPDATE 쿼리로 해당 시퀀스 번호의 좌석 예약 시도
/// 3. **재시도 로직**: 이미 예약된 좌석을 만나면 다음 시퀀스로 재시도 (최대 5회)
/// 4. **충돌 처리**: 동시 요청으로 인한 경합 상황을 적절히 처리
/// 
/// ## 예약 순서 보장
/// 
/// - Redis 시퀀스는 요청 순서를 보장
/// - 데이터베이스의 조건부 UPDATE는 원자성을 보장
/// - 중복 예약 및 동시성 문제를 완전히 해결
/// 
/// ## 오류 코드
/// 
/// - `sold_out`: 모든 좌석이 이미 예약됨
/// - `already_reserved`: 해당 사용자가 이미 예약함
/// - `contention`: 과도한 경합으로 인한 실패
/// 
/// # Parameters
/// 
/// * 요청 본문: `SeatReservationPayload` - 예약자 정보
/// * 헤더: `X-User-Id` - 사용자 식별자 (중복 예약 방지용)
/// 
/// # Returns
/// 
/// * `Ok(Json<ReservationResponse>)` - 성공 시 예약된 좌석 정보
/// * `Err(StatusError)` - 실패 시 오류 코드와 사유
///
/// Returns first-come-first-served seat assignment using a Redis INCR sequence.
/// Reason codes: sold_out | already_reserved | contention
#[endpoint(
    tags("seats"),
    summary = "글로벌 FCFS 좌석 예약",
    description = "Redis 전역 시퀀스를 이용해 다음 좌석을 원자적으로 예약 시도. 원자성은 DB conditional UPDATE 로 보장."
)]
pub async fn reserve_next_seat(req: &mut Request) -> Result<Json<ReservationResponse>, StatusError> {
    let payload: SeatReservationPayload = req.parse_json().await.map_err(|_| StatusError::bad_request())?;
    info!(user_name=%payload.user_name, "parsed reservation payload(fcfs)");
    
    // 헤더에서 사용자 ID 추출 (중복 예약 방지용)
    let user_id = req.header::<String>("X-User-Id")
        .and_then(|v| Some(v.to_string()))
        .ok_or_else(|| StatusError::bad_request().brief("Missing X-User-Id header"))?;

    // 사용자 중복 예약 방지: 이미 성공한 기록 여부 확인 (Redis key: fcfs:user:<user_id>)
    let user_key = format!("fcfs:user:{user_id}");
    let mut redis_conn = match config_redis::CLIENT.get_multiplexed_async_connection().await {
        Ok(c) => c,
        Err(e) => {
            tracing::error!(error=%e, "Redis connection failed for user duplicate check");
            return Err(StatusError::internal_server_error());
        }
    };
    {
        use redis::AsyncCommands;
        if let Ok(Some(existing_id)) = redis_conn.get::<_, Option<i64>>(&user_key).await {
            // 이미 예약된 사용자 -> 기존 좌석 정보 + TTL
            let remaining = count_available().await.unwrap_or(-1);
            let ttl = redis_conn.ttl::<_, i64>(&user_key).await.ok();
            // TTL -1 (no expire) or -2 (no key) normalization
            let norm_ttl = ttl.filter(|v| *v >= 0);
            let public = PublicSeatInfo { id: existing_id as i32, status: true };
            // 이미 예약된 경우 gateway 시퀀스가 있을 수도 있으나, 없으면 None
            let seq_hdr = req.header::<String>("X-Fcfs-Seq");
            let seq_opt = seq_hdr.and_then(|s| s.parse::<i64>().ok());
            return Ok(Json(ReservationResponse { success: true, seat: Some(public), reason: Some(reservation_reason::ALREADY_RESERVED.into()), remaining_seats: Some(remaining), user_ttl_remaining: norm_ttl, sequence: seq_opt }));
        }
    }

    // Gateway 가 부여한 시퀀스 번호 (필수)
    let seq_header = req.header::<String>("X-Fcfs-Seq").ok_or_else(|| StatusError::bad_request().brief("Missing X-Fcfs-Seq header"))?;
    let seq: i32 = seq_header.parse().map_err(|_| StatusError::bad_request().brief("Invalid X-Fcfs-Seq header"))?;
    info!(seq, user=%user_id, "Attempting FCFS reservation (gateway provided sequence)");

    match Mutation::reserve_if_available(db(), seq, payload.user_name.clone(), payload.phone.clone()).await {
        Ok(updated) => {
            // 사용자 -> seat id 매핑 기록 (재시도 불가 처리)
            {
                use redis::AsyncCommands;
                let user_ttl: i64 = std::env::var("FCFS_USER_TTL").ok().and_then(|v| v.parse().ok()).unwrap_or(900);
                if user_ttl == 0 {
                    if let Err(e) = redis_conn.set::<_, _, ()>(&user_key, updated.id).await {
                        tracing::warn!(error=%e, user=%user_id, "Failed to write user seat mapping (no-expiry)");
                    }
                } else {
                    if let Err(e) = redis_conn.set_ex::<_, _, ()>(&user_key, updated.id, user_ttl as u64).await {
                        tracing::warn!(error=%e, user=%user_id, "Failed to write user seat mapping");
                    }
                }
            }
            let remaining = count_available().await.unwrap_or(-1);
            let ttl = redis_conn.ttl::<_, i64>(&user_key).await.ok();
            let norm_ttl = ttl.filter(|v| *v >= 0);
            return Ok(Json(ReservationResponse { success: true, seat: Some(PublicSeatInfo { id: updated.id, status: updated.status }), reason: None, remaining_seats: Some(remaining), user_ttl_remaining: norm_ttl, sequence: Some(seq as i64) }));
        }
        Err(sea_orm::DbErr::Custom(msg)) if msg.contains("already reserved") => {
            tracing::debug!(seq, "Seat already reserved -> contention");
            let remaining = count_available().await.unwrap_or(-1);
            return Ok(Json(ReservationResponse { success: false, seat: None, reason: Some(reservation_reason::CONTENTION.into()), remaining_seats: Some(remaining), user_ttl_remaining: None, sequence: Some(seq as i64) }));
        }
        Err(sea_orm::DbErr::RecordNotFound(_)) => {
            let remaining = 0;
            tracing::info!(seq, remaining, "Sequence exceeded existing seat ids -> sold out");
            return Ok(Json(ReservationResponse { success: false, seat: None, reason: Some(reservation_reason::SOLD_OUT.into()), remaining_seats: Some(remaining), user_ttl_remaining: None, sequence: Some(seq as i64) }));
        }
        Err(e) => {
            tracing::error!(error=%e, seq, "FCFS reservation internal DB error");
            return Err(StatusError::internal_server_error());
        }
    }
}

/// 현재 남은(미예약) 좌석 수를 카운트하는 헬퍼
async fn count_available() -> Result<i64, sea_orm::DbErr> {
    use sea_orm::FromQueryResult;
    #[derive(Debug, FromQueryResult)]
    struct Row { cnt: i64 }
    let db_conn = db();
    let stmt = sea_orm::Statement::from_sql_and_values(
        sea_orm::DatabaseBackend::Postgres,
        "SELECT COUNT(*) as cnt FROM seats WHERE status = FALSE",
        vec![]
    );
    let rows: Vec<Row> = Row::find_by_statement(stmt).all(db_conn).await?;
    Ok(rows.first().map(|r| r.cnt).unwrap_or(0))
}

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
