use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;
use bigdecimal::BigDecimal;
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Product {
    pub id: Uuid,
    pub name: String,
    pub category: String,
    pub avg_price: BigDecimal,
    pub min_price: BigDecimal,
    pub max_price: BigDecimal,
    pub image_url: Option<String>,
    pub previous_price: Option<BigDecimal>,
    pub last_updated: DateTime<Utc>,
}