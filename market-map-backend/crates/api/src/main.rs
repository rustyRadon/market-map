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
    category: Option<String>,
    subcategory: Option<String>,
}

#[derive(Serialize)]
struct UserResponse {
    id: Option<String>,
    email: String,
    created_at: Option<String>,
    is_admin: bool,
    is_pro: bool,
}

#[derive(Deserialize)]
struct ManageAdminRequest {
    target_email: String,
}

#[derive(Deserialize)]
struct AuthHeader {
    user_id: Option<String>,
}

#[derive(Serialize)]
pub struct MarketStats {
    pub highest_price: f64,
    pub lowest_price: f64,
    pub average_price: f64,
    pub similar_count: i32,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenvy::dotenv().ok();
    println!("Testing database connection...");
    let pool = establish_connection().await;
    println!("Database connection successful!");
    
    let count: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM products")
        .fetch_one(&pool)
        .await?;
    println!("Found {} products in database", count.0);

    let app = Router::new()
        .route("/products", get(get_products))
        .route("/products/:id/stats", get(get_market_intelligence))
        .route("/register", post(register))
        .route("/login", post(login))
        .route("/users", get(get_users))
        .route("/admin/users/promote", post(promote_admin))
        .route("/admin/users/demote", post(demote_admin))
        .route("/users/upgrade-pro", post(upgrade_to_pro))
        .layer(CorsLayer::permissive())
        .with_state(pool);

    let addr = SocketAddr::from(([127, 0, 0, 1], 8080));
    println!(" MarketMap API running at http://{}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}

async fn get_market_intelligence(
    Path(id): Path<String>,
    State(pool): State<sqlx::SqlitePool>,
) -> Result<Json<MarketStats>, (StatusCode, String)> {
    let product = sqlx::query!("SELECT name FROM products WHERE id = $1", id)
        .fetch_one(&pool)
        .await
        .map_err(|_| (StatusCode::NOT_FOUND, "Product not found".into()))?;

    let stats = sqlx::query!(
        r#"
        SELECT 
            MAX(avg_price) as max_p, 
            MIN(avg_price) as min_p, 
            AVG(avg_price) as avg_p,
            COUNT(*) as count
        FROM products 
        WHERE name LIKE '%' || $1 || '%'
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
        similar_count: stats.count,
    }))
}

async fn register(
    State(pool): State<sqlx::SqlitePool>,
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
    State(pool): State<sqlx::SqlitePool>,
    Json(payload): Json<LoginRequest>,
) -> Result<Json<Value>, (StatusCode, String)> {
   
    let user = sqlx::query!(
        "SELECT id, email, password_hash, is_admin, is_pro FROM users WHERE email = $1",
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

    // Auto-promote super admin
    if user.email == "h4554n.abdul@gmail.com" {
        sqlx::query!(
            "UPDATE users SET is_admin = true WHERE email = $1",
            user.email
        )
        .execute(&pool)
        .await
        .ok(); // Ignore errors for auto-promotion
    }

    let display_name = user.email.split('@').next().unwrap_or("User").to_string();

    Ok(Json(json!({
        "id": user.id,
        "email": user.email,
        "name": display_name,
        "is_admin": user.is_admin,
        "is_pro": user.is_pro
    })))
}

async fn get_products(
    Query(params): Query<SearchParams>,
    State(pool): State<sqlx::SqlitePool>,
) -> Json<Vec<Product>> {
    let search_term = format!("%{}%", params.search.unwrap_or_default());
    let category = params.category.unwrap_or_default();
    let subcategory = params.subcategory.unwrap_or_default();

    let effective_category = if !subcategory.is_empty() {
        match category.as_str() {
            "food" => format!("food-{}", subcategory),
            "gadgets" => format!("gadgets-{}", subcategory),
            _ => subcategory.clone(),
        }
    } else {
        category.clone()
    };

    let category_clause = if !effective_category.is_empty() {
        Some(effective_category)
    } else {
        None
    };

    let products = if let Some(category_val) = category_clause {
        // main category filter for all food/gadgets when no subcategory specified
        let query_category = if category_val == "food" {
            "food%".to_string()
        } else if category_val == "gadgets" {
            "gadgets%".to_string()
        } else {
            category_val.clone()
        };

        sqlx::query_as!(
            Product,
            r#"
            SELECT 
                id, name, category, avg_price, min_price, max_price, 
                image_url, previous_price, last_updated 
            FROM products 
            WHERE (name LIKE $1 OR $1 = '') 
              AND category LIKE $2
            ORDER BY last_updated DESC
            "#,
            search_term,
            query_category
        )
        .fetch_all(&pool)
        .await
        .unwrap_or_default()
    } else {
        sqlx::query_as!(
            Product,
            r#"
            SELECT 
                id, name, category, avg_price, min_price, max_price, 
                image_url, previous_price, last_updated 
            FROM products 
            WHERE name LIKE $1 OR $1 = ''
            ORDER BY last_updated DESC
            "#,
            search_term
        )
        .fetch_all(&pool)
        .await
        .unwrap_or_default()
    };

    Json(products)
}

async fn get_users(
    State(pool): State<sqlx::SqlitePool>,
) -> Result<Json<Vec<UserResponse>>, (StatusCode, String)> {
    let users = sqlx::query!(
        "SELECT id, email, created_at, is_admin, is_pro FROM users ORDER BY created_at DESC"
    )
    .fetch_all(&pool)
    .await
    .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Database error".into()))?;

    let response = users
        .into_iter()
        .map(|u| UserResponse {
            id: u.id,
            email: u.email,
            created_at: u.created_at.map(|dt| dt.to_string()),
            is_admin: u.is_admin.unwrap_or(false),
            is_pro: u.is_pro.unwrap_or(false),
        })
        .collect();

    Ok(Json(response))
}

async fn promote_admin(
    State(pool): State<sqlx::SqlitePool>,
    Json(payload): Json<ManageAdminRequest>,
) -> Result<StatusCode, (StatusCode, String)> {
    let result = sqlx::query!(
        "UPDATE users SET is_admin = true WHERE email = $1",
        payload.target_email
    )
    .execute(&pool)
    .await
    .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Database error".into()))?;

    if result.rows_affected() == 0 {
        return Err((StatusCode::NOT_FOUND, "User not found".into()));
    }

    Ok(StatusCode::OK)
}

async fn demote_admin(
    State(pool): State<sqlx::SqlitePool>,
    Json(payload): Json<ManageAdminRequest>,
) -> Result<StatusCode, (StatusCode, String)> {
    let result = sqlx::query!(
        "UPDATE users SET is_admin = false WHERE email = $1",
        payload.target_email
    )
    .execute(&pool)
    .await
    .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Database error".into()))?;

    if result.rows_affected() == 0 {
        return Err((StatusCode::NOT_FOUND, "User not found".into()));
    }

    Ok(StatusCode::OK)
}

async fn upgrade_to_pro(
    State(pool): State<sqlx::SqlitePool>,
    Json(payload): Json<ManageAdminRequest>,
) -> Result<Json<UserResponse>, (StatusCode, String)> {
    let result = sqlx::query!(
        "UPDATE users SET is_pro = true, pro_since = datetime('now') WHERE email = $1 AND is_pro = false",
        payload.target_email
    )
    .execute(&pool)
    .await
    .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Database error".into()))?;

    if result.rows_affected() == 0 {
        return Err((StatusCode::BAD_REQUEST, "User not found or already pro".into()));
    }

    // Fetch updated user data
    let user = sqlx::query!(
        "SELECT id, email, created_at, is_admin, is_pro FROM users WHERE email = $1",
        payload.target_email
    )
    .fetch_one(&pool)
    .await
    .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Database error".into()))?;

    Ok(Json(UserResponse {
        id: user.id,
        email: user.email,
        created_at: user.created_at.map(|dt| dt.to_string()),
        is_admin: user.is_admin.unwrap_or(false),
        is_pro: user.is_pro.unwrap_or(false),
    }))
}