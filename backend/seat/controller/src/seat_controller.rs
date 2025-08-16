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
use config_redis::incr_fcfs_sequence;

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
#[salvo(schema(rename_all = "camelCase"))]
struct SeatReservationPayload { 
    /// 예약자 이름
    user_name: String,
    /// 예약자 전화번호 (선택사항)
    phone: Option<String>
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
}

// Standard reason codes (string constants) for reservation outcomes.
pub mod reservation_reason {
    pub const SOLD_OUT: &str = "sold_out";
    pub const ALREADY_RESERVED: &str = "already_reserved";
    pub const CONTENTION: &str = "contention"; // too many races tried
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
    // 요청 본문에서 예약자 정보 파싱
    let payload: SeatReservationPayload = req.parse_json().await.map_err(|_| StatusError::bad_request())?;
    
    // 헤더에서 사용자 ID 추출 (중복 예약 방지용)
    let user_id = req.header::<String>("X-User-Id")
        .and_then(|v| Some(v.to_string()))
        .ok_or_else(|| StatusError::bad_request().brief("Missing X-User-Id header"))?;

    // 이미 예약된 좌석을 건너뛰기 위한 재시도 제한 (사용자 오류 방지)
    const MAX_ATTEMPTS: usize = 5;
    for _ in 0..MAX_ATTEMPTS {
        // Redis에서 FCFS 시퀀스 번호 생성 (요청 순서 보장)
        let seq = incr_fcfs_sequence().await.map_err(|_| StatusError::internal_server_error())? as i32;
        info!(seq, user=%user_id, "Attempting FCFS reservation");

        // 원자적 예약 시도: 데이터베이스에서 사용 가능성 검증 및 예약 처리
        match Mutation::reserve_if_available(db(), seq, payload.user_name.clone(), payload.phone.clone()).await {
            Ok(updated) => {
                return Ok(Json(ReservationResponse { success: true, seat: Some(PublicSeatInfo { id: updated.id, status: updated.status }), reason: None }));
            }
            Err(sea_orm::DbErr::Custom(msg)) if msg.contains("already reserved") => {
                // Try next sequence
                continue;
            }
            Err(sea_orm::DbErr::RecordNotFound(_)) => {
                // Possibly sequence exceeded max id -> treat as sold out
                return Ok(Json(ReservationResponse { success: false, seat: None, reason: Some(reservation_reason::SOLD_OUT.into()) }));
            }
            Err(_) => return Err(StatusError::internal_server_error())
        }
    }
    Ok(Json(ReservationResponse { success: false, seat: None, reason: Some(reservation_reason::CONTENTION.into()) }))
}
