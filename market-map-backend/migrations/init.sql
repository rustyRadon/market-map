CREATE TABLE products (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    avg_price REAL NOT NULL,
    min_price REAL NOT NULL,
    max_price REAL NOT NULL,
    image_url TEXT,
    previous_price REAL,
    placeholder_id INTEGER DEFAULT 1,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE listings (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
    product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    raw_title TEXT NOT NULL,
    price REAL NOT NULL,
    url TEXT NOT NULL UNIQUE,
    img_url TEXT,
    scraped_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE price_history (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
    product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
    price REAL NOT NULL,
    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    is_pro BOOLEAN DEFAULT FALSE,
    pro_since DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_listings_platform ON listings(platform);