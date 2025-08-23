//! Crate root for config-database. Exposes DB init & access helpers.
#[path = "database.rs"]
mod database;

pub use database::{init_db, db};
