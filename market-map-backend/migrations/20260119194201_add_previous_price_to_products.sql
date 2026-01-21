-- Add migration script here
ALTER TABLE products ADD COLUMN previous_price DECIMAL DEFAULT 0;