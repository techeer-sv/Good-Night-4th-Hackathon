use salvo::prelude::*;
use config_redis::CLIENT as REDIS_CLIENT;
use migration::{Migrator, MigratorTrait};
use sea_orm::Database;

#[handler]
async fn redis_ping() -> String {
    match REDIS_CLIENT.get_multiplexed_async_connection().await {
        Ok(mut conn) => match redis::cmd("PING").query_async::<String>(&mut conn).await {
            Ok(pong) => pong,
            Err(e) => format!("ERR: {}", e),
        },
        Err(e) => format!("ERR: {}", e),
    }
}

// Removed temporary redis_seq_test route; sequence now used only via FCFS reservation endpoint.

async fn run_migrations() -> Result<(), sea_orm::DbErr> {
    let database_url = std::env::var("DATABASE_URL")
        .unwrap_or_else(|_| "postgresql://postgres:postgres@localhost:5432/tickettock".to_string());
    
    let db = Database::connect(&database_url).await?;
    Migrator::up(&db, None).await?;
    Ok(())
}

async fn initialize_sample_data() -> Result<(), Box<dyn std::error::Error>> {
    use seat_model::model_seat::{Entity as Seat, ActiveModel};
    use sea_orm::{Set, ActiveModelTrait, EntityTrait, PaginatorTrait};
    
    let db = config_database::db();
    
    // Check if we already have seats
    let count = Seat::find().count(db).await?;
    if count > 0 {
        println!("Database already has {} seats, skipping initialization", count);
        return Ok(());
    }
    
    println!("Initializing database with sample seats...");
    
    // Create 10 sample seats
    for i in 1..=10 {
        let seat = ActiveModel {
            id: Set(i),
            status: Set(false),
            reserved_by: Set(None),
            phone: Set(None),
        };
        seat.insert(db).await?;
    }
    
    println!("Successfully created 10 sample seats");
    Ok(())
}

#[tokio::main]
async fn main() {
    let _ = dotenvy::dotenv();
    tracing_subscriber::fmt().init();

    // Run database migrations first
    println!("Running database migrations...");
    if let Err(e) = run_migrations().await {
        tracing::error!(error = %e, "Migration failed");
        panic!("Database migration failed: {}", e);
    }
    println!("Migrations completed successfully");

    // Initialize PostgreSQL database
    if let Err(e) = config_database::init_db().await {
        tracing::error!(error = %e, "DB init failed");
        panic!("Database initialization failed: {}", e);
    }

    // Initialize database with sample data if empty
    if let Err(e) = initialize_sample_data().await {
        tracing::error!(error = %e, "Sample data initialization failed");
        panic!("Sample data initialization failed: {}", e);
    }

    let port = std::env::var("PORT").unwrap_or_else(|_| "5800".to_string());
    let bind_addr = format!("0.0.0.0:{}", port);
    let acceptor = TcpListener::new(bind_addr).bind().await;
    let router = config_api::build_router(redis_ping);
    
    println!("Server starting at http://localhost:{}", port);
    println!("OpenAPI spec at http://localhost:{}/openapi.json", port);
    println!("Swagger UI at http://localhost:{}/swagger-ui", port);
    
    Server::new(acceptor).serve(router).await;
}
