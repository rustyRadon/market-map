CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    avg_price REAL NOT NULL,
    min_price REAL NOT NULL,
    max_price REAL NOT NULL,
    last_updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS listings (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
    product_id TEXT REFERENCES products(id),
    url TEXT NOT NULL,
    site_name TEXT NOT NULL,
    price REAL NOT NULL,
    last_seen DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);