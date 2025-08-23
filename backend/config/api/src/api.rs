//! API configuration and router construction.
//! (Kept filename CamelCase but exposed via standard `lib.rs` as `api_config` module.)
#![allow(unused_braces)]

use once_cell::sync::Lazy;
use std::time::Duration;
use salvo::prelude::*; // Router, Handler, #[handler], SwaggerUi
use salvo::oapi::OpenApi;
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
async fn hello() -> &'static str { "공연 예약 시스템 API" }

pub fn build_router(redis_ping: impl Handler) -> Router {
    let root = Router::new()
        .push(Router::with_path("health").get(health))
        .push(Router::with_path("redis/ping").get(redis_ping))
        .push(
            Router::with_path("api/v1/seats")
                .get(seat::list_seats)
                // Global FCFS reservation endpoint (sequence based)
                .push(Router::with_path("reservation/fcfs")
                .post(seat::reserve_next_seat))
                // Admin reset (seat table + sequence)
                .push(Router::with_path("reset")
                .post(seat::admin_reset)
                )
                .push(
                    Router::with_path("{id}")
                        .get(seat::get_seat)
                        .put(seat::update_seat_status)
                )
        )
        .get(hello);

    // OpenAPI integration: merge router with OpenAPI spec
    let openapi = OpenApi::new("공연 예약 시스템 API", "1.0.0").merge_router(&root);
    root.push(openapi.into_router("/openapi.json"))
        .push(SwaggerUi::new("/openapi.json").into_router("swagger-ui"))
}

// (Removed unused alias `Config`.)