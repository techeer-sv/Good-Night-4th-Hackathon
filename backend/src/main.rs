use salvo::prelude::*;
use config_redis::CLIENT as REDIS_CLIENT;

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

#[tokio::main]
async fn main() {
    let _ = dotenvy::dotenv();
    tracing_subscriber::fmt().init();

    // Initialize PostgreSQL database
    if let Err(e) = config_database::init_db().await {
        tracing::error!(error = %e, "DB init failed");
        panic!("Database initialization failed: {}", e);
    }

    let acceptor = TcpListener::new("0.0.0.0:5800").bind().await;
    let router = config_api::build_router(redis_ping);
    
    println!("Server starting at http://localhost:5800");
    println!("OpenAPI spec at http://localhost:5800/openapi.json");
    println!("Swagger UI at http://localhost:5800/swagger-ui");
    
    Server::new(acceptor).serve(router).await;
}
