use sqlx::postgres::PgPoolOptions;
use sqlx::{Pool, Postgres};
use std::env;

pub mod models; 

pub type DbPool = Pool<Postgres>;

/// Initialize a connection pool to PostgreSQL using the DATABASE_URL environment variable.
pub async fn establish_connection() -> DbPool {
    let database_url = env::var("DATABASE_URL")
        .expect("DATABASE_URL must be set in the .env file or environment");

    PgPoolOptions::new()
        .max_connections(5) 
        .connect(&database_url)
        .await
        .expect("Failed to create database connection pool")
}

pub fn clean_price(raw: &str) -> f64 {
    raw.chars()
        .filter(|c| c.is_digit(10))
        .collect::<String>()
        .parse::<f64>()
        .unwrap_or(0.0)
}
