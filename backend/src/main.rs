mod models;
mod handlers;

use axum::{Router, routing::get};
use tower_http::cors::{CorsLayer, Any};

#[tokio::main]
async fn main() {
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        .route("/api/portfolio", get(handlers::get_portfolio))
        .layer(cors);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3001")
        .await
        .expect("Failed to bind to port 3001");

    println!("Backend server running on http://0.0.0.0:3001");

    axum::serve(listener, app)
        .await
        .expect("Failed to start server");
}
