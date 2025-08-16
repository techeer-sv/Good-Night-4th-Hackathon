// Seat controller moved into its own crate (seat-controller)
use salvo::prelude::*;
use salvo::writing::Json;
use once_cell::sync::Lazy;
use tokio::sync::RwLock;
use seat_model::model_seat as seat;
use serde::{Deserialize, Serialize};
use serde_json::json;
use anyhow::Result;
use tracing;
use std::time::Duration;

#[derive(Debug, Clone)]
pub struct ApiConfig { pub base_url: String, pub timeout: Duration }
impl ApiConfig { fn from_env() -> Self { let base_url = std::env::var("API_BASE_URL").unwrap_or_else(|_| "https://example.external.api".to_string()); let timeout_ms: u64 = std::env::var("API_TIMEOUT_MS").ok().and_then(|v| v.parse().ok()).unwrap_or(2_000); Self { base_url, timeout: Duration::from_millis(timeout_ms) } } }
static API_CONFIG: Lazy<ApiConfig> = Lazy::new(ApiConfig::from_env);

#[derive(Deserialize, Serialize)]
pub struct ExternalSeat { pub id: i32, pub status: String }

pub static SEATS: Lazy<RwLock<Vec<seat::Model>>> = Lazy::new(|| (1..=9).map(|i| seat::Model { id: i, status: false }).collect::<Vec<_>>().into());
#[derive(Deserialize)] struct SeatUpdatePayload { status: bool }
fn not_found() -> StatusError { StatusError::not_found() }

async fn fetch_external_seats() -> Result<Vec<ExternalSeat>> { let client = reqwest::Client::builder().timeout(API_CONFIG.timeout).build()?; let url = format!("{}/seats", API_CONFIG.base_url); Ok(client.get(&url).send().await?.error_for_status()?.json::<Vec<ExternalSeat>>().await?) }
async fn sync_seat_to_external(seat: &seat::Model) -> Result<()> { let client = reqwest::Client::builder().timeout(API_CONFIG.timeout).build()?; let url = format!("{}/seats/{}", API_CONFIG.base_url, seat.id); let payload = ExternalSeat { id: seat.id, status: if seat.status { "occupied".into() } else { "available".into() } }; client.put(&url).json(&payload).send().await?.error_for_status()?; Ok(()) }

#[handler] pub async fn list_seats() -> Json<Vec<seat::Model>> { let seats = SEATS.read().await; Json(seats.clone()) }
#[handler]
pub async fn get_seat(req: &mut Request) -> Result<Json<seat::Model>, StatusError> {
	let id: i32 = req
		.param::<String>("id")
		.and_then(|s| s.parse::<i32>().ok())
		.ok_or_else(StatusError::bad_request)?;
	let seats = SEATS.read().await;
	if let Some(s) = seats.iter().find(|s| s.id == id) { Ok(Json(s.clone())) } else { Err(not_found()) }
}

#[handler]
pub async fn update_seat_status(req: &mut Request) -> Result<Json<seat::Model>, StatusError> {
	let id: i32 = req
		.param::<String>("id")
		.and_then(|s| s.parse::<i32>().ok())
		.ok_or_else(StatusError::bad_request)?;
	let payload: SeatUpdatePayload = req.parse_json().await.map_err(|_| StatusError::bad_request())?;
	let mut seats = SEATS.write().await;
	if let Some(s) = seats.iter_mut().find(|s| s.id == id) { s.status = payload.status; Ok(Json(s.clone())) } else { Err(not_found()) }
}

#[handler]
pub async fn toggle_seat(req: &mut Request) -> Result<Json<serde_json::Value>, StatusError> {
	let id: i32 = req
		.param::<String>("id")
		.and_then(|s| s.parse::<i32>().ok())
		.ok_or_else(StatusError::bad_request)?;
	let mut seats = SEATS.write().await;
	if let Some(s) = seats.iter_mut().find(|s| s.id == id) {
		s.status = !s.status;
		Ok(Json(json!({"id": s.id, "status": s.status})))
	} else { Err(not_found()) }
}

#[handler]
pub async fn fetch_seats_from_external() -> Result<Json<Vec<ExternalSeat>>, StatusError> {
	match fetch_external_seats().await {
		Ok(data) => Ok(Json(data)),
		Err(e) => {
			tracing::error!(error=%e, "fetch_external_seats failed");
			Err(StatusError::internal_server_error())
		}
	}
}
#[handler] pub async fn sync_all_seats() -> Json<serde_json::Value> { let seats = SEATS.read().await; let mut success_count = 0; let mut error_count = 0; for seat in seats.iter() { if sync_seat_to_external(seat).await.is_ok() { success_count += 1 } else { error_count += 1; tracing::warn!(seat_id=seat.id, "Failed to sync seat"); } } Json(json!({"synced": success_count, "errors": error_count, "total": seats.len()})) }
