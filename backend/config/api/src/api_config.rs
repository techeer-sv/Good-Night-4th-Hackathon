//! API configuration and router construction.
//! (Kept filename CamelCase but exposed via standard `lib.rs` as `api_config` module.)
#![allow(unused_braces)]

use once_cell::sync::Lazy;
use std::time::Duration;
use salvo::prelude::*; // Router, Handler, #[handler]
use seat_controller as seat; // seat handlers crate

#[derive(Debug, Clone)]
pub struct ApiConfig {
    pub base_url: String,
    pub timeout: Duration,
}

impl ApiConfig {
    fn from_env() -> Self {
        let base_url = std::env::var("API_BASE_URL")
            .unwrap_or_else(|_| "https://example.external.api".to_string());
        let timeout_ms: u64 = std::env::var("API_TIMEOUT_MS")
            .ok()
            .and_then(|v| v.parse().ok())
            .unwrap_or(2_000);
        Self {
            base_url,
            timeout: Duration::from_millis(timeout_ms),
        }
    }
}

pub static API_CONFIG: Lazy<ApiConfig> = Lazy::new(ApiConfig::from_env);


#[handler]
async fn health() -> &'static str { "OK" }

#[handler]
async fn hello() -> &'static str { "Hello from config-api" }

pub fn build_router(redis_ping: impl Handler) -> Router {
    Router::new()
        .push(Router::with_path("healthz").get(health))
        .push(Router::with_path("redis/ping").get(redis_ping))
        .push(
            Router::with_path("api/seats")
                .get(seat::list_seats)
                .push(Router::with_path("external").get(seat::fetch_seats_from_external))
                .push(Router::with_path("sync").post(seat::sync_all_seats))
                .push(
                    Router::with_path("<id>")
                        .get(seat::get_seat)
                        .put(seat::update_seat_status)
                        .push(Router::with_path("toggle").post(seat::toggle_seat))
                )
        )
        .get(hello)
}

// (Removed unused alias `Config`.)