use scraper::{Html, Selector};
use reqwest::Client;
use dotenvy::dotenv;
use shared::{establish_connection, clean_price};

fn normalize_category(base_category: &str, item_name: &str) -> String {
    let name = item_name.to_lowercase();

    if base_category == "food" {
        let fruit_keywords = ["fruit", "banana", "apple", "orange", "mango", "pineapple", "plantain", "grape", "watermelon", "berry", "papaya"];
        if fruit_keywords.iter().any(|kw| name.contains(kw)) {
            "food-fruits".to_string()
        } else {
            "food-groceries".to_string()
        }
    } else if base_category == "gadgets" {
        if name.contains("phone") || name.contains("mobile") || name.contains("smartphone") {
            "gadgets-phone".to_string()
        } else if name.contains("laptop") || name.contains("notebook") || name.contains("macbook") || name.contains("dell") || name.contains("hp") {
            "gadgets-laptop".to_string()
        } else {
            "gadgets-other".to_string()
        }
    } else {
        base_category.to_string()
    }
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenv().ok();
    let pool = establish_connection().await;
    
    let client = Client::builder()
        .user_agent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
        .build()?;

    let targets = vec![
        ("food", "https://www.jumia.com.ng/groceries"),
        ("gadgets", "https://www.jumia.com.ng/mobile-phones"),
        ("gadgets", "https://www.jumia.com.ng/laptops"),
    ];

    const MAX_PER_CATEGORY: usize = 200;
    let mut total_count = 0;

    println!("MarketMap Scraper: Fetching items from Jumia...");

    let product_selector = Selector::parse("article.prd").unwrap();
    let name_selector = Selector::parse("h3.name").unwrap();
    let price_selector = Selector::parse("div.prc").unwrap();
    let img_selector = Selector::parse("img.img").unwrap();

    for (base_category, base_url) in targets {
        let mut page = 1;
        let mut category_count = 0;

        while category_count < MAX_PER_CATEGORY {
            let url = if page == 1 {
                format!("{}/", base_url)
            } else {
                format!("{}/?page={}", base_url, page)
            };

            println!("Tracking {} page {}: {}", base_category, page, url);
            let response = client.get(&url).send().await?.text().await?;
            let document = Html::parse_document(&response);

            let mut page_items = 0;

            for element in document.select(&product_selector) {
                if category_count >= MAX_PER_CATEGORY {
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
                    if price <= 0.0 {
                        continue;
                    }

                    let trimmed_name = name.trim().to_string();
                    let category = normalize_category(base_category, &trimmed_name);

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
                            println!("Saved {} | Category {} | Image: {}", trimmed_name, category, image_url.is_some());
                            category_count += 1;
                            total_count += 1;
                            page_items += 1;
                        }
                        Err(e) => eprintln!("Error saving {}: {}", trimmed_name, e),
                    }
                }
            }

            if page_items == 0 {
                println!("No more items found for {} on page {}. Moving to next category.", base_category, page);
                break;
            }

            page += 1;
            tokio::time::sleep(tokio::time::Duration::from_millis(1200)).await;
        }

        println!("{}: {} items processed for category {}.", base_category, category_count, category_count);
    }

    println!("\nScraping complete. Total items saved: {}", total_count);
    Ok(())
}
