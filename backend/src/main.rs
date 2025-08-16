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

    // DB 초기화 (feature memory-seats 활성 시 no-op)
    if let Err(e) = config_database::init_db().await {
        tracing::warn!(error = %e, "DB init failed (continuing)");
    }

    // 서버 포트
    let acceptor = TcpListener::new("0.0.0.0:5800").bind().await;

    let router = config_api::build_router(redis_ping);
    Server::new(acceptor).serve(router).await;
}
