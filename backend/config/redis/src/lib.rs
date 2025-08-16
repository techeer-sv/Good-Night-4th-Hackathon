use once_cell::sync::Lazy;
use redis::AsyncCommands;
use anyhow::{Result, Context};
use serde::{Serialize, Deserialize};

// Central Redis client, composed from env similarly to other config crates
pub static CLIENT: Lazy<redis::Client> = Lazy::new(|| {
    if let Ok(url) = std::env::var("REDIS_URL") { 
        return redis::Client::open(url).expect("Invalid REDIS_URL (config_redis)");
    }
    let host = std::env::var("REDIS_HOST").unwrap_or_else(|_| "127.0.0.1".into());
    let port = std::env::var("REDIS_PORT").unwrap_or_else(|_| "6379".into());
    let pass = std::env::var("REDIS_PASSWORD").unwrap_or_else(|_| "redis_pass".into());
    let url = format!("redis://:{}@{}:{}/0", pass, host, port);
    redis::Client::open(url).expect("Invalid composed REDIS_URL (config_redis)")
});

pub const FCFS_SEQ_KEY: &str = "fcfs:seq";

#[derive(Debug, Serialize, Deserialize)]
pub struct RedisSequenceResponse {
    pub sequence: i64,
}

pub async fn incr_fcfs_sequence() -> Result<i64> {
    let mut conn = CLIENT
        .get_multiplexed_async_connection().await
        .with_context(|| "Failed to get Redis connection for sequence")?;
    let val: i64 = conn.incr(FCFS_SEQ_KEY, 1).await.with_context(|| "Redis INCR fcfs:seq failed")?;
    Ok(val)
}

pub async fn get_current_sequence() -> Result<i64> {
    let mut conn = CLIENT
        .get_multiplexed_async_connection().await
        .with_context(|| "Failed to get Redis connection for get")?;
    let val: Option<i64> = redis::cmd("GET").arg(FCFS_SEQ_KEY).query_async(&mut conn).await?;
    Ok(val.unwrap_or(0))
}

#[cfg(test)]
mod tests {
    use super::*;
    #[tokio::test]
    async fn test_increments() {
        let a = incr_fcfs_sequence().await.unwrap();
        let b = incr_fcfs_sequence().await.unwrap();
        assert!(b > a);
    }
}
