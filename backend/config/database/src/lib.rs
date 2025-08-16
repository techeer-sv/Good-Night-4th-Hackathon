//! Crate root for config-database. Exposes DB init & access helpers.
#[path = "Database.rs"]
mod database;

pub use database::{init_db, db};
