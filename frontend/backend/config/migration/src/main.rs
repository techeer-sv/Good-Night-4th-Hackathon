use sea_orm_migration::prelude::*;

#[tokio::main]
async fn main() {
    // Load .env if present
    let _ = dotenvy::dotenv();
    cli::run_cli(migration::Migrator).await;
}