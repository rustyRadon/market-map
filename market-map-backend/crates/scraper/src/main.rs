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

    println!("  MarketMap Scraper: Fetching Jumia Food Items...");

    let mut count = 0;
    let mut page = 1;
    const MAX_ITEMS: usize = 100;

    loop {
        if count >= MAX_ITEMS {
            break;
        }

        let url = if page == 1 {
            "https://www.jumia.com.ng/groceries/".to_string()
        } else {
            format!("https://www.jumia.com.ng/groceries/?page={}", page)
        };

        println!("Scraping page {}...", page);
        
        let response = client.get(&url).send().await?.text().await?;
        let document = Html::parse_document(&response);
        
        let product_selector = Selector::parse("article.prd").unwrap();
        let name_selector = Selector::parse("h3.name").unwrap();
        let price_selector = Selector::parse("div.prc").unwrap();
        let img_selector = Selector::parse("img.img").unwrap();

        let mut page_items = 0;

        for element in document.select(&product_selector) {
            if count >= MAX_ITEMS {
                break;
            }

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
                let category = if trimmed_name.to_lowercase().contains("food") || 
                               trimmed_name.to_lowercase().contains("rice") ||
                               trimmed_name.to_lowercase().contains("beans") ||
                               trimmed_name.to_lowercase().contains("oil") ||
                               trimmed_name.to_lowercase().contains("milk") ||
                               trimmed_name.to_lowercase().contains("bread") ||
                               trimmed_name.to_lowercase().contains("pasta") ||
                               trimmed_name.to_lowercase().contains("cereal") ||
                               trimmed_name.to_lowercase().contains("snack") ||
                               trimmed_name.to_lowercase().contains("drink") ||
                               trimmed_name.to_lowercase().contains("beverage") ||
                               trimmed_name.to_lowercase().contains("water") ||
                               trimmed_name.to_lowercase().contains("juice") ||
                               trimmed_name.to_lowercase().contains("soda") ||
                               trimmed_name.to_lowercase().contains("coffee") ||
                               trimmed_name.to_lowercase().contains("tea") ||
                               trimmed_name.to_lowercase().contains("sugar") ||
                               trimmed_name.to_lowercase().contains("salt") ||
                               trimmed_name.to_lowercase().contains("flour") ||
                               trimmed_name.to_lowercase().contains("spice") ||
                               trimmed_name.to_lowercase().contains("canned") ||
                               trimmed_name.to_lowercase().contains("frozen") {
                    "food"
                } else {
                    "food" // Default to food for groceries section
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
                        println!(" Saved: {} | Image Found: {}", trimmed_name, image_url.is_some());
                        count += 1;
                        page_items += 1;
                    }
                    Err(e) => eprintln!(" Error saving {}: {}", trimmed_name, e),
                }
            }
        }

        // If we didn't find any items on this page, or we've reached the limit, stop
        if page_items == 0 || count >= MAX_ITEMS {
            break;
        }

        page += 1;
        
        // Add a small delay between requests to be respectful
        tokio::time::sleep(tokio::time::Duration::from_millis(1000)).await;
    }

    println!("\n Scraping complete. Processed {} food items.", count);
    Ok(())
}