-- ==========================================================
-- ELECTROHOME & REPAIR SHOP DATABASE SCHEMA
-- Compatible with MySQL 5.7+, MySQL 8.0+, MariaDB, and SQLite
-- ==========================================================

-- 1. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  phone VARCHAR(30) NOT NULL,
  address TEXT,
  zip_code VARCHAR(20),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. REPAIR ORDERS TABLE
CREATE TABLE IF NOT EXISTS repair_orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tracking_code VARCHAR(50) UNIQUE NOT NULL,
  customer_id INTEGER NOT NULL,
  device_category VARCHAR(100) NOT NULL,
  device_name VARCHAR(100) NOT NULL,
  service_type VARCHAR(50) NOT NULL DEFAULT 'home', -- 'home' or 'shop'
  issue_description TEXT,
  price_estimate DECIMAL(10, 2) DEFAULT 0.00,
  status VARCHAR(50) DEFAULT 'Booked', -- 'Booked', 'Dispatch', 'Diagnosing', 'Repairing', 'Completed', 'Cancelled'
  assigned_tech VARCHAR(100) DEFAULT 'Unassigned',
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- 3. CONTACT INQUIRIES TABLE
CREATE TABLE IF NOT EXISTS contact_inquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  phone VARCHAR(30),
  message TEXT NOT NULL,
  status VARCHAR(30) DEFAULT 'New',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. USERS TABLE (Customer Login & Signup Authentication)
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(30) UNIQUE,
  email VARCHAR(100),
  password VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

