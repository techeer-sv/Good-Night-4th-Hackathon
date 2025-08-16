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

#[derive(Deserialize, ToSchema)]
struct SeatUpdatePayload { status: bool }

#[derive(Deserialize, ToSchema)]
#[salvo(schema(rename_all = "camelCase"))]
struct SeatReservationPayload { 
    user_name: String,
    phone: Option<String>
}

#[derive(Serialize, ToSchema)]
struct PublicSeatInfo {
    id: i32,
    status: bool,
}

fn not_found() -> StatusError { StatusError::not_found() }

/// 모든 좌석 목록 조회
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

/// 개별 좌석 정보 조회
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

/// 좌석 예약하기
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
/// Returns first-come-first-served seat assignment using a Redis INCR sequence.
/// Reason codes: sold_out | already_reserved | contention
#[endpoint(
    tags("seats"),
    summary = "글로벌 FCFS 좌석 예약",
    description = "Redis 전역 시퀀스를 이용해 다음 좌석을 원자적으로 예약 시도. 원자성은 DB conditional UPDATE 로 보장."
)]
pub async fn reserve_next_seat(req: &mut Request) -> Result<Json<ReservationResponse>, StatusError> {
    let payload: SeatReservationPayload = req.parse_json().await.map_err(|_| StatusError::bad_request())?;
    let user_id = req.header::<String>("X-User-Id")
        .and_then(|v| Some(v.to_string()))
        .ok_or_else(|| StatusError::bad_request().brief("Missing X-User-Id header"))?;

    // We'll attempt a bounded number of times to skip already-reserved seats (to avoid user-visible errors)
    const MAX_ATTEMPTS: usize = 5;
    for _ in 0..MAX_ATTEMPTS {
    let seq = incr_fcfs_sequence().await.map_err(|_| StatusError::internal_server_error())? as i32;
        info!(seq, user=%user_id, "Attempting FCFS reservation");

        // Attempt atomic reservation directly; rely on DB to validate availability.
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
