# 📊 MarketMap: Real-Time Price Intelligence Engine

**MarketMap** is a high-performance data aggregation platform that tracks, analyzes, and visualizes price trends across the Nigerian e-commerce ecosystem. By leveraging a **Rust-based Query Engine**, it transforms messy, disparate product listings from vendors like Jumia into clean, actionable market intelligence.

---

## 📄 Resume / Portfolio Bullet Points

* **Engineered a high-performance Market Intelligence platform** using **Rust (Axum)** and **React**, featuring a custom **Query Engine** that performs real-time fuzzy-match data aggregation.
* **Developed a PostgreSQL-backed analytics suite** utilizing **Trigram Similarity algorithms** to consolidate disparate market listings into actionable "High/Low/Avg" price ranges.
* **Architected a mobile-first responsive UI** with **Framer Motion** and **Recharts**, implementing gesture-based navigation and complex data visualizations for 90-day price trends.
* **Architected an asynchronous data ingestion pipeline** using **Tokio** and **SQLx**, enabling concurrent processing of large-scale market data while maintaining strict database integrity.

---

## 🛠️ The Tech Stack

### **Backend (The "Brain")**
- **Language:** Rust 🦀
- **Framework:** Axum (Web) & Tokio (Async Runtime)
- **Database:** PostgreSQL with `sqlx` (Type-safe SQL)
- **Intelligence:** `pg_trgm` Similarity matching for product normalization.

### **Frontend (The "Face")**
- **Framework:** React 18 + Vite + TypeScript
- **Styling:** Tailwind CSS (Mobile-First design)
- **Animations:** Framer Motion (Touch-swipe interactions)
- **Charts:** Recharts (Dynamic price trend visualization)

---

## 🏛️ System Architecture

The project is structured as a Rust Workspace for maximum performance and type safety:

```text
market-map-backend/
├── crates/
│   ├── api/             # Axum REST API (The Query Engine)
│   ├── shared/          # Shared Database Models & Connection logic
│   └── market-scraper/  # Rust-based ingestion tools
fe-mm/                   # React + TypeScript Vite Application
