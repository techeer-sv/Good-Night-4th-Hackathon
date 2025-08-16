//! Crate root: expose items defined in `api_config.rs` via a conventional module path.

#[path = "api_config.rs"]
mod api_config;
pub use self::api_config::{ApiConfig, API_CONFIG, build_router};

