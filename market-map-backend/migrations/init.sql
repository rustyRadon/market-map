CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,        
    category TEXT NOT NULL,            
    avg_price DECIMAL(12, 2) NOT NULL, 
    min_price DECIMAL(12, 2) NOT NULL,  
    max_price DECIMAL(12, 2) NOT NULL, 
    placeholder_id INT DEFAULT 1,       
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,            
    raw_title TEXT NOT NULL,
    price DECIMAL(12, 2) NOT NULL,
    url TEXT NOT NULL UNIQUE,          
    img_url TEXT,
    scraped_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE price_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    price DECIMAL(12, 2) NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_listings_platform ON listings(platform);