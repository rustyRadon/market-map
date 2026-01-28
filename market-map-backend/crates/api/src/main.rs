use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    routing::{get, post},
    Json, Router,
};
use bcrypt::{hash, verify, DEFAULT_COST};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use shared::{establish_connection, models::product::Product};
use std::net::SocketAddr;
use tower_http::cors::CorsLayer;
use uuid::Uuid;

#[derive(Deserialize)]
struct RegisterRequest {
    email: String,
    password: String,
}

#[derive(Deserialize)]
struct LoginRequest {
    email: String,
    password: String,
}

#[derive(Deserialize)]
struct SearchParams {
    search: Option<String>,
}

#[derive(Serialize)]
pub struct MarketStats {
    pub highest_price: f64,
    pub lowest_price: f64,
    pub average_price: f64,
    pub similar_count: i64,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenvy::dotenv().ok();
    let pool = establish_connection().await;

    let app = Router::new()
        .route("/products", get(get_products))
        .route("/products/:id/stats", get(get_market_intelligence))
        .route("/register", post(register))
        .route("/login", post(login))
        .layer(CorsLayer::permissive())
        .with_state(pool);

    let addr = SocketAddr::from(([127, 0, 0, 1], 8080));
    println!(" MarketMap API running at http://{}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}

async fn get_market_intelligence(
    Path(id): Path<Uuid>,
    State(pool): State<sqlx::PgPool>,
) -> Result<Json<MarketStats>, (StatusCode, String)> {
    let product = sqlx::query!("SELECT name FROM products WHERE id = $1", id)
        .fetch_one(&pool)
        .await
        .map_err(|_| (StatusCode::NOT_FOUND, "Product not found".into()))?;

    let stats = sqlx::query!(
        r#"
        SELECT 
            MAX(avg_price::float8) as max_p, 
            MIN(avg_price::float8) as min_p, 
            AVG(avg_price::float8) as avg_p,
            COUNT(*) as count
        FROM products 
        WHERE similarity(name, $1) > 0.3
        "#,
        product.name
    )
    .fetch_one(&pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok(Json(MarketStats {
        highest_price: stats.max_p.unwrap_or(0.0),
        lowest_price: stats.min_p.unwrap_or(0.0),
        average_price: stats.avg_p.unwrap_or(0.0),
        similar_count: stats.count.unwrap_or(0),
    }))
}

async fn register(
    State(pool): State<sqlx::PgPool>,
    Json(payload): Json<RegisterRequest>,
) -> Result<StatusCode, (StatusCode, String)> {
    let hashed = hash(payload.password, DEFAULT_COST)
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Failed to hash password".into()))?;

    sqlx::query!(
        "INSERT INTO users (email, password_hash) VALUES ($1, $2)",
        payload.email,
        hashed
    )
    .execute(&pool)
    .await
    .map_err(|e| (StatusCode::BAD_REQUEST, format!("Email already registered: {}", e)))?;

    Ok(StatusCode::CREATED)
}

async fn login(
    State(pool): State<sqlx::PgPool>,
    Json(payload): Json<LoginRequest>,
) -> Result<Json<Value>, (StatusCode, String)> {
   
    let user = sqlx::query!(
        "SELECT id, email, password_hash FROM users WHERE email = $1",
        payload.email
    )
    .fetch_optional(&pool)
    .await
    .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Database error".into()))?
    .ok_or((StatusCode::UNAUTHORIZED, "Invalid email or password".into()))?;

    let is_valid = verify(payload.password, &user.password_hash)
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Verification error".into()))?;

    if !is_valid {
        return Err((StatusCode::UNAUTHORIZED, "Invalid email or password".into()));
    }

    let display_name = user.email.split('@').next().unwrap_or("User").to_string();

    Ok(Json(json!({
        "id": user.id,
        "email": user.email,
        "name": display_name
    })))
}

async fn get_products(
    Query(params): Query<SearchParams>,
    State(pool): State<sqlx::PgPool>,
) -> Json<Vec<Product>> {
    let search_term = format!("%{}%", params.search.unwrap_or_default());
    
    let products = sqlx::query_as!(
        Product,
        r#"
        SELECT 
            id, name, category, avg_price, min_price, max_price, 
            image_url, previous_price, last_updated 
        FROM products 
        WHERE name ILIKE $1 OR category ILIKE $1 
        ORDER BY last_updated DESC
        "#,
        search_term
    )
    .fetch_all(&pool)
    .await
    .unwrap_or_default();

    Json(products)
}