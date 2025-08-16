// Seat controller moved into its own crate (seat-controller)
use salvo::prelude::*;
use salvo::oapi::{ToSchema, endpoint};
use salvo::writing::Json;
use once_cell::sync::Lazy;
use tokio::sync::RwLock;
use seat_model::model_seat as seat;
use serde::Deserialize;
use serde_json::json;

pub static SEATS: Lazy<RwLock<Vec<seat::Model>>> = Lazy::new(|| (1..=9).map(|i| seat::Model { id: i, status: false, reserved_by: None, phone: None }).collect::<Vec<_>>().into());

#[derive(Deserialize, ToSchema)]
struct SeatUpdatePayload { status: bool }

#[derive(Deserialize, ToSchema)]
#[salvo(schema(rename_all = "camelCase"))]
struct SeatReservationPayload { 
    user_name: String,
    phone: Option<String>
}

fn not_found() -> StatusError { StatusError::not_found() }

/// 모든 좌석 목록 조회
#[endpoint(
    tags("seats")
)]
pub async fn list_seats() -> Json<Vec<seat::Model>> { 
    let seats = SEATS.read().await; 
    Json(seats.clone()) 
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
	let seats = SEATS.read().await;
	if let Some(s) = seats.iter().find(|s| s.id == id) { Ok(Json(s.clone())) } else { Err(not_found()) }
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
	let mut seats = SEATS.write().await;
	if let Some(s) = seats.iter_mut().find(|s| s.id == id) { 
        s.status = payload.status; 
        Ok(Json(s.clone())) 
    } else { Err(not_found()) }
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
	let mut seats = SEATS.write().await;
	if let Some(s) = seats.iter_mut().find(|s| s.id == id) {
		s.status = !s.status;
		Ok(Json(json!({"id": s.id, "status": s.status})))
	} else { Err(not_found()) }
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
	let mut seats = SEATS.write().await;
	if let Some(s) = seats.iter_mut().find(|s| s.id == id) {
		if s.status {
			return Err(StatusError::conflict().brief("Seat already reserved"));
		}
		s.status = true;
		s.reserved_by = Some(payload.user_name);
		s.phone = payload.phone;
		Ok(Json(s.clone()))
	} else { Err(not_found()) }
}
