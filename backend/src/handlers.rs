use axum::{Json, response::IntoResponse};
use crate::models::Portfolio;

pub async fn get_portfolio() -> impl IntoResponse {
    let data = include_str!("data/portfolio.json");
    let portfolio: Portfolio = serde_json::from_str(data).expect("Failed to parse portfolio.json");
    Json(portfolio)
}
