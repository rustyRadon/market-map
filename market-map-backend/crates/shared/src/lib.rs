use sqlx::sqlite::SqlitePoolOptions;
use sqlx::{Pool, Sqlite};
use std::env;

pub mod models;

pub type DbPool = Pool<Sqlite>;

pub async fn establish_connection() -> DbPool {
    let database_url = env::var("DATABASE_URL")
        .unwrap_or_else(|_| "sqlite:///home/rustyradon/market-map/market-map-backend/db.sqlite".to_string());

    println!("Connecting to SQLite database URL: {}", database_url);

    let pool = SqlitePoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await;

    match pool {
        Ok(p) => p,
        Err(e) => panic!("Failed to create database connection pool: {}", e),
    }
}

pub fn clean_price(raw: &str) -> f64 {
    raw.chars()
        .filter(|c| c.is_digit(10))
        .collect::<String>()
        .parse::<f64>()
        .unwrap_or(0.0)
}
