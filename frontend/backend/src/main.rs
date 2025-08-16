use once_cell::sync::Lazy;
use salvo::prelude::*;

static REDIS_CLIENT: Lazy<redis::Client> = Lazy::new(|| {
    let url = std::env::var("REDIS_URL")
        .unwrap_or_else(|_| "redis://:redis_pass@127.0.0.1:6379/0".to_string());
    redis::Client::open(url).expect("Invalid REDIS_URL")
});

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

#[tokio::main]
async fn main() {
    let _ = dotenvy::dotenv();
    tracing_subscriber::fmt().init();

    // Skip DB init for now until SQLite driver issues resolved
    // if let Err(e) = config_database::init_db().await {
    //     tracing::warn!(error = %e, "DB init failed (continuing)");
    // }

    let acceptor = TcpListener::new("0.0.0.0:5800").bind().await;
    let router = config_api::build_router(redis_ping);
    
    println!("Server starting at http://localhost:5800");
    println!("OpenAPI spec at http://localhost:5800/openapi.json");
    println!("Swagger UI at http://localhost:5800/swagger-ui");
    
    Server::new(acceptor).serve(router).await;
}
