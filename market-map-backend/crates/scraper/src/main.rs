use scraper::{Html, Selector};
use reqwest::Client;
use dotenvy::dotenv;
use shared::{establish_connection, clean_price};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenv().ok();
    let pool = establish_connection().await;
    
    let client = Client::builder()
        .user_agent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
        .build()?;

    println!("  MarketMap Scraper: Fetching Jumia Laptops + Images...");

    let url = "https://www.jumia.com.ng/laptops/";
    let response = client.get(url).send().await?.text().await?;
    let document = Html::parse_document(&response);
    
    let product_selector = Selector::parse("article.prd").unwrap();
    let name_selector = Selector::parse("h3.name").unwrap();
    let price_selector = Selector::parse("div.prc").unwrap();
    let img_selector = Selector::parse("img.img").unwrap();

    let mut count = 0;

    for element in document.select(&product_selector) {
        let name = element
            .select(&name_selector)
            .next()
            .map(|n| n.text().collect::<String>())
            .unwrap_or_default();
        
        let price_str = element
            .select(&price_selector)
            .next()
            .map(|p| p.text().collect::<String>())
            .unwrap_or_default();

        let image_url = element
            .select(&img_selector)
            .next()
            .and_then(|img| img.value().attr("data-src").or(img.value().attr("src")))
            .map(|s| s.to_string());

        if !name.is_empty() && !price_str.is_empty() {
            let price = clean_price(&price_str);
            let trimmed_name = name.trim().to_string();

            // Determine category based on product name
            let category = if name.to_lowercase().contains("laptop") || 
                           name.to_lowercase().contains("computer") ||
                           name.to_lowercase().contains("phone") ||
                           name.to_lowercase().contains("tablet") ||
                           name.to_lowercase().contains("headphone") ||
                           name.to_lowercase().contains("charger") ||
                           name.to_lowercase().contains("mouse") ||
                           name.to_lowercase().contains("keyboard") ||
                           name.to_lowercase().contains("monitor") ||
                           name.to_lowercase().contains("speaker") {
                "gadgets"
            } else {
                "gadgets" // Default to gadgets for now, can be expanded
            };

            let result = sqlx::query!(
                r#"
                INSERT INTO products (name, category, avg_price, min_price, max_price, image_url, previous_price)
                VALUES ($1, $2, $3, $3, $3, $4, $3)
                ON CONFLICT (name) DO UPDATE SET
                    previous_price = products.avg_price,
                    avg_price = EXCLUDED.avg_price,
                    image_url = EXCLUDED.image_url,
                    last_updated = datetime('now')
                RETURNING id
                "#,
                trimmed_name,
                category,
                price,
                image_url
            )
            .fetch_one(&pool)
            .await;

            match result {
                Ok(_) => {
                    println!(" Saved: {} | Image Found: {}", name.trim(), image_url.is_some());
                    count += 1;
                }
                Err(e) => eprintln!(" Error saving {}: {}", name.trim(), e),
            }
        }
    }

    println!("\n Scraping complete. Processed {} items with images.", count);
    Ok(())
}