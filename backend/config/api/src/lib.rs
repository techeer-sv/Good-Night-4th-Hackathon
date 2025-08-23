//! Crate root: expose items defined in `config_api` via a conventional module path.

#[path = "api.rs"]
mod api;
pub use self::api::{ApiConfig, API_CONFIG, build_router};

