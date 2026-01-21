use axum::{
    extract::{Query, State},
    http::StatusCode,
    routing::{get, post},
    Json, Router,
};
use bcrypt::{hash, verify, DEFAULT_COST};
use serde::Deserialize;
use serde_json::{json, Value};
use shared::{establish_connection, models::product::Product};
use std::net::SocketAddr;
use tower_http::cors::CorsLayer;

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

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenvy::dotenv().ok();
    let pool = establish_connection().await;

    let app = Router::new()
        .route("/products", get(get_products))
        .route("/register", post(register))
        .route("/login", post(login))
        .layer(CorsLayer::permissive())
        .with_state(pool);

    let addr = SocketAddr::from(([127, 0, 0, 1], 8080));
    println!("🚀 MarketMap API running at http://{}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
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
    // 1. Fetch user by email
    let user = sqlx::query!(
        "SELECT id, email, password_hash FROM users WHERE email = $1",
        payload.email
    )
    .fetch_optional(&pool)
    .await
    .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Database error".into()))?
    .ok_or((StatusCode::UNAUTHORIZED, "Invalid email or password".into()))?;

    // 2. Verify password
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