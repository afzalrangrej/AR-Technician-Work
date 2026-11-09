const fs = require('fs');
const path = require('path');
require('dotenv').config();

const DB_TYPE = process.env.DB_TYPE || 'sqlite'; // 'sqlite' or 'mysql'

let dbDriver = null;

if (DB_TYPE === 'mysql') {
  const mysql = require('mysql2/promise');
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'electrohome_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  dbDriver = {
    type: 'mysql',
    async query(sql, params = []) {
      // Replace ? with ? for MySQL
      const [rows] = await pool.execute(sql, params);
      return rows;
    },
    async run(sql, params = []) {
      const [result] = await pool.execute(sql, params);
      return { lastID: result.insertId, changes: result.affectedRows };
    },
    async get(sql, params = []) {
      const [rows] = await pool.execute(sql, params);
      return rows[0] || null;
    }
  };
} else {
  // Default to SQLite (zero installation required, relational SQL DB)
  const sqlite3 = require('sqlite3').verbose();
  const dbPath = path.join(__dirname, 'database.db');
  const sqliteDb = new sqlite3.Database(dbPath);

  dbDriver = {
    type: 'sqlite',
    query(sql, params = []) {
      return new Promise((resolve, reject) => {
        sqliteDb.all(sql, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });
    },
    run(sql, params = []) {
      return new Promise((resolve, reject) => {
        sqliteDb.run(sql, params, function (err) {
          if (err) reject(err);
          else resolve({ lastID: this.lastID, changes: this.changes });
        });
      });
    },
    get(sql, params = []) {
      return new Promise((resolve, reject) => {
        sqliteDb.get(sql, params, (err, row) => {
          if (err) reject(err);
          else resolve(row || null);
        });
      });
    }
  };
}

async function initDatabase() {
  console.log(`[DB] Initializing database engine: ${dbDriver.type.toUpperCase()}`);
  
  if (dbDriver.type === 'sqlite') {
    // SQLite schema auto-creation
    await dbDriver.run(`
      CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT NOT NULL,
        address TEXT,
        zip_code TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await dbDriver.run(`
      CREATE TABLE IF NOT EXISTS repair_orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tracking_code TEXT UNIQUE NOT NULL,
        customer_id INTEGER NOT NULL,
        device_category TEXT NOT NULL,
        device_name TEXT NOT NULL,
        service_type TEXT NOT NULL DEFAULT 'home',
        issue_description TEXT,
        price_estimate REAL DEFAULT 0.00,
        status TEXT DEFAULT 'Booked',
        assigned_tech TEXT DEFAULT 'Unassigned',
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
      )
    `);

    await dbDriver.run(`
      CREATE TABLE IF NOT EXISTS contact_inquiries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        message TEXT NOT NULL,
        status TEXT DEFAULT 'New',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add optional columns if not present
    try { await dbDriver.run(`ALTER TABLE repair_orders ADD COLUMN vehicle TEXT DEFAULT 'Honda - Unicorn - GJ19 BK4745'`); } catch (e) {}
    try { await dbDriver.run(`ALTER TABLE repair_orders ADD COLUMN eta_minutes TEXT DEFAULT '15 mins'`); } catch (e) {}
    try { await dbDriver.run(`ALTER TABLE repair_orders ADD COLUMN tech_phone TEXT DEFAULT '+91 6351618067'`); } catch (e) {}

    // 4. SITE ANNOUNCEMENTS TABLE (Broadcast from Admin to User Side)
    await dbDriver.run(`
      CREATE TABLE IF NOT EXISTS site_announcements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        is_active INTEGER DEFAULT 1,
        badge_text TEXT DEFAULT 'FESTIVAL OFFER',
        message TEXT NOT NULL,
        link_url TEXT DEFAULT '#services',
        link_text TEXT DEFAULT 'Claim 20% Off',
        bg_gradient TEXT DEFAULT 'cyan',
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 4b. REGISTERED CUSTOMERS / USERS TABLE (For Website Entrance Authentication)
    await dbDriver.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT UNIQUE,
        email TEXT,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Seed default demo user if table empty
    const userCount = await dbDriver.get(`SELECT COUNT(*) as count FROM users`);
    if (userCount && userCount.count === 0) {
      await dbDriver.run(`
        INSERT INTO users (name, phone, email, password)
        VALUES ('Demo Customer', '9876543210', 'customer@example.com', '123456')
      `);
    }

    // 5. CUSTOMER REVIEWS & RATINGS TABLE
    await dbDriver.run(`
      CREATE TABLE IF NOT EXISTS customer_reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_name TEXT NOT NULL,
        location TEXT DEFAULT 'Kosamba',
        rating INTEGER DEFAULT 5,
        comment TEXT NOT NULL,
        device TEXT DEFAULT 'Smart TV & LED Display',
        is_approved INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 6. ADMIN ONLINE/OFFLINE MOOD STATUS TABLE
    await dbDriver.run(`
      CREATE TABLE IF NOT EXISTS admin_status (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        is_online INTEGER DEFAULT 1,
        status_mood TEXT DEFAULT 'ON',
        status_message TEXT DEFAULT 'Admin is Online & Available',
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const adminStatusCount = await dbDriver.get(`SELECT COUNT(*) as count FROM admin_status`);
    if (adminStatusCount && adminStatusCount.count === 0) {
      await dbDriver.run(`
        INSERT INTO admin_status (is_online, status_mood, status_message)
        VALUES (1, 'ON', 'Admin is Online & Available')
      `);
    }

    // Seed default announcement if none exists
    const annCount = await dbDriver.get(`SELECT COUNT(*) as count FROM site_announcements`);
    if (annCount && annCount.count === 0) {
      await dbDriver.run(`
        INSERT INTO site_announcements (is_active, badge_text, message, link_url, link_text, bg_gradient)
        VALUES (1, 'FESTIVAL OFFER', '⚡ Special 20% Discount on Doorstep LED TV, Inverter PCB & Microwave Repairs in Kosamba & Surat!', '#tracker', 'Track Live Tech', 'cyan')
      `);
    }

    // 7. DAILY ORDER COLLECTIONS TABLE (Manually entered by Admin daily)
    await dbDriver.run(`
      CREATE TABLE IF NOT EXISTS daily_collections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER,
        tracking_code TEXT,
        customer_name TEXT NOT NULL,
        amount REAL NOT NULL,
        payment_method TEXT DEFAULT 'Cash',
        notes TEXT,
        collection_date DATE DEFAULT (DATE('now', 'localtime')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 8. ELECTRICIAN FEEDBACK TABLE (Validated 1 submission per user + tracking code)
    await dbDriver.run(`
      CREATE TABLE IF NOT EXISTS technician_feedback (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tracking_code TEXT NOT NULL,
        customer_name TEXT NOT NULL,
        phone TEXT NOT NULL,
        technician_name TEXT DEFAULT 'Afzal (Lead Electrical Specialist)',
        rating INTEGER DEFAULT 5,
        feedback TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 9. ADMIN NOTICES / LIVE CHAT BOARD (Admin Notice Board visible on User Homepage)
    await dbDriver.run(`
      CREATE TABLE IF NOT EXISTS admin_notices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        author_name TEXT DEFAULT 'Afzal (Lead Electrical Specialist & Admin)',
        category TEXT DEFAULT '📢 General Notice',
        message TEXT NOT NULL,
        priority TEXT DEFAULT 'normal',
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Seed default starter notice if empty
    try {
      const existingNotices = await dbDriver.query(`SELECT id FROM admin_notices LIMIT 1`);
      if (!existingNotices || existingNotices.length === 0) {
        await dbDriver.run(`
          INSERT INTO admin_notices (author_name, category, message, priority, is_active)
          VALUES (
            'Afzal (Lead Electrical Specialist & Admin)',
            '📢 Workshop Notice',
            'Welcome to AR Technician Work! Doorstep repair visits are available today across Kosamba, Mangrol & Surat. For quick bookings or emergency queries, reach out directly or book via website.',
            'normal',
            1
          )
        `);
      }
    } catch (e) { }

    // Reviews, feedback, and customer orders are added only when submitted/logged manually by users
  }

  console.log('[DB] Database structure is ready.');
}

module.exports = {
  dbDriver,
  initDatabase
};
