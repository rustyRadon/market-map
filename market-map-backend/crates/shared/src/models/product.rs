use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use chrono::NaiveDateTime;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Product {
    pub id: Option<String>,
    pub name: String,
    pub category: String,
    pub avg_price: f64,
    pub min_price: f64,
    pub max_price: f64,
    pub image_url: Option<String>,
    pub previous_price: Option<f64>,
    pub last_updated: Option<NaiveDateTime>,
}