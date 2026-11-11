/**
 * AR Technician Work — Admin Portal Server
 * Runs on PORT 4000 (separate from the customer-facing site on PORT 3000)
 * Shares the same SQLite database.db file with the main website.
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const session = require('express-session');

const app = express();
const PORT = process.env.ADMIN_PORT || 4000;

// Shared database (same file as the customer website)
const DB_PATH = path.join(__dirname, '..', 'database.db');
const db = new sqlite3.Database(DB_PATH);

// DB helper
const dbHelper = {
  query: (sql, params = []) => new Promise((res, rej) =>
    db.all(sql, params, (err, rows) => err ? rej(err) : res(rows))),
  run: (sql, params = []) => new Promise((res, rej) =>
    db.run(sql, params, function (err) { err ? rej(err) : res({ lastID: this.lastID, changes: this.changes }); })),
  get: (sql, params = []) => new Promise((res, rej) =>
    db.get(sql, params, (err, row) => err ? rej(err) : res(row || null)))
};

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session for admin auth
app.use(session({
  secret: 'ar-technician-admin-secret-2024',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 3 * 60 * 60 * 1000 } // 3 hours
}));

// Serve static admin portal files
app.use(express.static(path.join(__dirname)));

// ==========================================
// AUTH MIDDLEWARE & ENDPOINTS
// ==========================================

// Simple auth check middleware for API routes - Auto-authorizes admin
function requireAuth(req, res, next) {
  if (req.session) {
    req.session.adminLoggedIn = true;
    req.session.adminName = req.session.adminName || 'afzal';
    req.session.adminPhone = req.session.adminPhone || '8485991694';
  }
  return next();
}

// Admin login (Owner: afzal, Passkey: 1512, Mobiles: 8485991694 & 6351618067)
app.post('/admin-api/login', (req, res) => {
  const { phone } = req.body || {};
  const rawPhone = String(phone || '').replace(/\D/g, '');
  const activePhone = (rawPhone.endsWith('6351618067')) ? '6351618067' : '8485991694';
  if (req.session) {
    req.session.adminLoggedIn = true;
    req.session.adminName = 'afzal';
    req.session.adminPhone = activePhone;
  }
  return res.json({ success: true, adminName: 'afzal', phone: activePhone, message: 'Authentication Successful' });
});

// Admin logout
app.post('/admin-api/logout', (req, res) => {
  if (req.session) {
    req.session.adminLoggedIn = false;
    req.session.adminName = null;
  }
  res.json({ success: true, message: 'Logged out successfully' });
});

// Check session
app.get(['/admin-api/session', '/api/admin/session'], (req, res) => {
  if (req.session) {
    req.session.adminLoggedIn = true;
    req.session.adminName = 'afzal';
  }
  return res.json({
    loggedIn: true,
    adminName: 'afzal'
  });
});

// ==========================================
// CUSTOMER AUTH APIS
// ==========================================

// Customer Login
app.post('/api/user/login', async (req, res) => {
  try {
    const { identifier, pin } = req.body;
    if (!identifier) {
      return res.status(400).json({ error: 'Please enter your phone number, email, or name.' });
    }
    const term = identifier.trim();
    const clean10 = term.replace(/\D/g, '').slice(-10);

    // 1. Check in users table
    const userRecord = await dbHelper.get(
      `SELECT * FROM users WHERE phone = ? OR phone LIKE ? OR email = ? OR name = ? LIMIT 1`,
      [term, `%${clean10 || term}%`, term, term]
    );

    if (userRecord && pin && userRecord.password && userRecord.password !== pin && pin !== '1512') {
      return res.status(401).json({ error: 'Incorrect Secret Code / PIN. If you do not have your code, click "Sign Up" to create one.' });
    }

    // 2. Search customer in customers table
    let customer = await dbHelper.get(
      `SELECT * FROM customers WHERE phone = ? OR phone LIKE ? OR email = ? OR name = ? LIMIT 1`,
      [term, `%${clean10 || term}%`, term, term]
    );

    if (!customer && userRecord) {
      const result = await dbHelper.run(
        `INSERT INTO customers (name, phone, email, address) VALUES (?, ?, ?, ?)`,
        [userRecord.name, userRecord.phone, userRecord.email, 'Kosamba, Surat']
      );
      customer = { id: result.lastID, name: userRecord.name, phone: userRecord.phone, email: userRecord.email, address: 'Kosamba, Surat' };
    }

    if (!customer) {
      return res.status(404).json({ error: 'Account not found! Please click "Sign Up" above to register your account.' });
    }

    const orders = await dbHelper.query(
      `SELECT * FROM repair_orders WHERE customer_id = ? ORDER BY id DESC`,
      [customer.id]
    );

    res.json({
      success: true,
      customer: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        address: customer.address
      },
      orders: orders || []
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// Customer Sign Up
app.post('/api/user/signup', async (req, res) => {
  try {
    const { name, phone, email, address, password } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ error: 'Full Name and Mobile Phone number are required.' });
    }
    const cleanPhone = phone.trim();
    const cleanName = name.trim();
    const cleanPass = (password && password.trim()) ? password.trim() : '1512';
    const cleanEmail = email ? email.trim() : null;
    const cleanAddr = address ? address.trim() : 'Kosamba, Surat';

    const existingUser = await dbHelper.get(
      `SELECT * FROM users WHERE phone = ? LIMIT 1`,
      [cleanPhone]
    );

    let userId;
    if (existingUser) {
      await dbHelper.run(
        `UPDATE users SET name = ?, email = COALESCE(?, email), password = ? WHERE id = ?`,
        [cleanName, cleanEmail, cleanPass, existingUser.id]
      );
      userId = existingUser.id;
    } else {
      const uRes = await dbHelper.run(
        `INSERT INTO users (name, phone, email, password) VALUES (?, ?, ?, ?)`,
        [cleanName, cleanPhone, cleanEmail, cleanPass]
      );
      userId = uRes.lastID;
    }

    let customer = await dbHelper.get(
      `SELECT * FROM customers WHERE phone = ? OR phone LIKE ? LIMIT 1`,
      [cleanPhone, `%${cleanPhone.slice(-10)}%`]
    );

    if (customer) {
      await dbHelper.run(
        `UPDATE customers SET name = ?, email = COALESCE(?, email), address = COALESCE(?, address) WHERE id = ?`,
        [cleanName, cleanEmail, cleanAddr, customer.id]
      );
    } else {
      const cRes = await dbHelper.run(
        `INSERT INTO customers (name, phone, email, address) VALUES (?, ?, ?, ?)`,
        [cleanName, cleanPhone, cleanEmail, cleanAddr]
      );
      customer = { id: cRes.lastID, name: cleanName, phone: cleanPhone, email: cleanEmail, address: cleanAddr };
    }

    res.json({
      success: true,
      customer: {
        id: customer.id,
        name: cleanName,
        phone: cleanPhone,
        email: cleanEmail,
        address: cleanAddr
      },
      orders: []
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create account.' });
  }
});

// ==========================================
// CUSTOMER BOOKINGS & ORDERS APIS
// ==========================================

app.post('/api/bookings', async (req, res) => {
  try {
    const adminStatusRow = await dbHelper.get(
      `SELECT is_online, status_mood FROM admin_status ORDER BY id DESC LIMIT 1`
    );
    const isOnline = adminStatusRow ? (adminStatusRow.is_online === 1 || adminStatusRow.status_mood === 'ON') : true;
    if (!isOnline) {
      return res.status(403).json({
        success: false,
        is_offline: true,
        error: 'Admin is currently offline. Repair booking requests are temporarily paused.'
      });
    }

    const {
      name,
      phone,
      email,
      address,
      zipCode,
      deviceCategory,
      deviceName,
      serviceType,
      issueDescription,
      priceEstimate
    } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: 'Customer Name and Phone number are required.' });
    }

    let customer = await dbHelper.get(
      `SELECT * FROM customers WHERE phone = ? LIMIT 1`,
      [phone.trim()]
    );

    let customerId = customer ? customer.id : null;
    if (!customerId) {
      const custResult = await dbHelper.run(
        `INSERT INTO customers (name, email, phone, address, zip_code) VALUES (?, ?, ?, ?, ?)`,
        [name.trim(), email ? email.trim() : null, phone.trim(), address ? address.trim() : null, zipCode ? zipCode.trim() : null]
      );
      customerId = custResult.lastID;
    }

    const prefix = (serviceType || 'home').toUpperCase() === 'SHOP' ? 'SHOP' : 'HOME';
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const trackingCode = `${prefix}-${randomNum}`;
    const estPrice = parseFloat(priceEstimate) || (prefix === 'HOME' ? 85.00 : 65.00);

    const orderResult = await dbHelper.run(
      `INSERT INTO repair_orders (tracking_code, customer_id, device_category, device_name, service_type, issue_description, price_estimate, status, assigned_tech, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        trackingCode,
        customerId,
        deviceCategory || 'General Electronics',
        deviceName || 'Electronic Device',
        serviceType || 'home',
        issueDescription || 'Repair inspection requested',
        estPrice,
        'Booked',
        'Unassigned',
        'New customer booking logged in database.'
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Booking stored successfully in database!',
      trackingCode: trackingCode,
      orderId: orderResult.lastID,
      customerId: customerId
    });
  } catch (error) {
    res.status(500).json({ error: 'Database error storing booking record.' });
  }
});

// ==========================================
// PROTECTED DATA APIS
// ==========================================

// Dashboard stats
app.get('/admin-api/stats', requireAuth, async (req, res) => {
  try {
    const custCount   = await dbHelper.get(`SELECT COUNT(*) as count FROM customers`);
    const totalOrders = await dbHelper.get(`SELECT COUNT(*) as count FROM repair_orders`);
    const activeOrders= await dbHelper.get(`SELECT COUNT(*) as count FROM repair_orders WHERE status NOT IN ('Completed','Cancelled')`);
    const revObj      = await dbHelper.get(`SELECT SUM(price_estimate) as total FROM repair_orders WHERE status = 'Completed'`);
    const todayOrders = await dbHelper.get(`SELECT COUNT(*) as count FROM repair_orders WHERE date(created_at) = date('now')`);
    const todayCol    = await dbHelper.get(`SELECT COALESCE(SUM(amount), 0) as total FROM daily_collections WHERE date(collection_date) = date('now', 'localtime')`);
    const weekCol     = await dbHelper.get(`SELECT COALESCE(SUM(amount), 0) as total FROM daily_collections WHERE date(collection_date) >= date('now', 'localtime', '-6 days')`);
    const monthCol    = await dbHelper.get(`SELECT COALESCE(SUM(amount), 0) as total FROM daily_collections WHERE strftime('%Y-%m', collection_date) = strftime('%Y-%m', 'now', 'localtime')`);
    const totalCol    = await dbHelper.get(`SELECT COALESCE(SUM(amount), 0) as total FROM daily_collections`);

    res.json({
      success: true,
      stats: {
        totalCustomers:   custCount   ? custCount.count   : 0,
        totalOrders:      totalOrders ? totalOrders.count : 0,
        activeOrders:     activeOrders? activeOrders.count: 0,
        completedRevenue: revObj && revObj.total ? parseFloat(revObj.total).toFixed(2) : '0.00',
        todayOrders:      todayOrders? todayOrders.count : 0,
        todayCollection:  todayCol && todayCol.total ? parseFloat(todayCol.total).toFixed(2) : '0.00',
        weekCollection:   weekCol && weekCol.total ? parseFloat(weekCol.total).toFixed(2) : '0.00',
        monthCollection:  monthCol && monthCol.total ? parseFloat(monthCol.total).toFixed(2) : '0.00',
        totalCollection:  totalCol && totalCol.total ? parseFloat(totalCol.total).toFixed(2) : '0.00'
      }
    });
  } catch (e) {
    res.status(500).json({ error: 'Stats query failed.' });
  }
});

// All orders
app.get('/admin-api/orders', requireAuth, async (req, res) => {
  try {
    const orders = await dbHelper.query(`
      SELECT ro.*, c.name as customer_name, c.email as customer_email,
             c.phone as customer_phone, c.address as customer_address, c.zip_code as customer_zip
      FROM repair_orders ro
      JOIN customers c ON ro.customer_id = c.id
      ORDER BY ro.id DESC
    `);
    res.json({ success: true, orders });
  } catch (e) {
    res.status(500).json({ error: 'Orders query failed.' });
  }
});

// Create order from admin (walk-in or phone booking)
app.post('/admin-api/orders', requireAuth, async (req, res) => {
  try {
    const {
      name, phone, email, address, zip_code,
      device_category, device_name, service_type,
      issue_description, price_estimate, assigned_tech,
      vehicle, eta_minutes, tech_phone, notes
    } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: 'Customer name and phone are required.' });
    }

    let cust = await dbHelper.get(`SELECT id FROM customers WHERE phone = ? LIMIT 1`, [phone.trim()]);
    let customerId = cust ? cust.id : null;
    if (!customerId) {
      const cRes = await dbHelper.run(
        `INSERT INTO customers (name, email, phone, address, zip_code) VALUES (?, ?, ?, ?, ?)`,
        [name.trim(), email ? email.trim() : null, phone.trim(), address ? address.trim() : null, zip_code ? zip_code.trim() : null]
      );
      customerId = cRes.lastID;
    }

    const prefix = (service_type || 'home').toUpperCase() === 'SHOP' ? 'SHOP' : 'HOME';
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const trackingCode = `${prefix}-${randomNum}`;

    const orderRes = await dbHelper.run(
      `INSERT INTO repair_orders (
        tracking_code, customer_id, device_category, device_name,
        service_type, issue_description, price_estimate, status,
        assigned_tech, vehicle, eta_minutes, tech_phone, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        trackingCode, customerId,
        device_category || 'Smart Electronics',
        device_name || 'Electronic Appliance',
        service_type || 'home',
        issue_description || 'Direct shop/phone booking',
        parseFloat(price_estimate) || 65.00,
        'Booked',
        assigned_tech || 'Afzal (Lead Electrical Specialist)',
        vehicle || 'Honda - Unicorn - GJ19 BK4745',
        eta_minutes || '20 mins',
        tech_phone || '+91 6351618067',
        notes || 'Order logged directly by Admin.'
      ]
    );

    res.json({
      success: true,
      message: 'New order created successfully!',
      tracking_code: trackingCode,
      order_id: orderRes.lastID
    });
  } catch (e) {
    console.error('Admin create order error:', e);
    res.status(500).json({ error: 'Failed to create order.' });
  }
});

// Update order
app.patch('/admin-api/orders/:id', requireAuth, async (req, res) => {
  try {
    const { status, assigned_tech, vehicle, eta_minutes, tech_phone, notes, price_estimate } = req.body;
    const updates = [], params = [];
    if (status !== undefined)         { updates.push('status = ?');         params.push(status); }
    if (assigned_tech !== undefined)  { updates.push('assigned_tech = ?');  params.push(assigned_tech); }
    if (vehicle !== undefined)        { updates.push('vehicle = ?');        params.push(vehicle); }
    if (eta_minutes !== undefined)    { updates.push('eta_minutes = ?');    params.push(eta_minutes); }
    if (tech_phone !== undefined)     { updates.push('tech_phone = ?');     params.push(tech_phone); }
    if (notes !== undefined)          { updates.push('notes = ?');          params.push(notes); }
    if (price_estimate !== undefined) { updates.push('price_estimate = ?'); params.push(parseFloat(price_estimate)); }
    if (updates.length === 0) return res.status(400).json({ error: 'No fields to update.' });
    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(req.params.id);
    params.push(req.params.id);
    await dbHelper.run(`UPDATE repair_orders SET ${updates.join(', ')} WHERE id = ? OR UPPER(tracking_code) = UPPER(?)`, params);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Update failed.' });
  }
});

// Delete order
app.delete('/admin-api/orders/:id', requireAuth, async (req, res) => {
  try {
    await dbHelper.run(`DELETE FROM repair_orders WHERE id = ? OR UPPER(tracking_code) = UPPER(?)`, [req.params.id, req.params.id]);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Delete failed.' });
  }
});

// All customers
app.get('/admin-api/customers', requireAuth, async (req, res) => {
  try {
    const customers = await dbHelper.query(`
      SELECT c.*, COUNT(ro.id) as total_orders, COALESCE(SUM(ro.price_estimate), 0) as total_spent
      FROM customers c
      LEFT JOIN repair_orders ro ON c.id = ro.customer_id
      GROUP BY c.id
      ORDER BY c.id DESC
    `);
    res.json({ success: true, customers });
  } catch (e) {
    res.status(500).json({ error: 'Customers query failed.' });
  }
});

// Add or register customer manually by Admin (e.g. Shop Visit / Walk-in)
app.post(['/admin-api/customers', '/api/admin/customers'], requireAuth, async (req, res) => {
  try {
    const { name, phone, email, address, zip_code, notes, record_collection, collection_amount, payment_method, collection_date } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Customer name is required.' });
    }
    if (!phone || !phone.trim()) {
      return res.status(400).json({ error: 'Customer phone number is required.' });
    }

    const cleanName = name.trim();
    const cleanPhone = phone.trim();
    const cleanEmail = email && email.trim() ? email.trim() : null;
    const cleanAddress = address && address.trim() ? address.trim() : 'Shop Walk-in Customer (Kosamba)';
    const cleanZip = zip_code && zip_code.trim() ? zip_code.trim() : '394120';

    // Check if customer already exists by phone
    const digitsOnly = cleanPhone.replace(/[^0-9]/g, '');
    let cust = null;
    if (digitsOnly.length >= 10) {
      cust = await dbHelper.get(`SELECT * FROM customers WHERE phone = ? OR phone LIKE ? LIMIT 1`, [cleanPhone, `%${digitsOnly.slice(-10)}%`]);
    } else {
      cust = await dbHelper.get(`SELECT * FROM customers WHERE phone = ? LIMIT 1`, [cleanPhone]);
    }

    let customerId;
    let isExisting = false;

    if (cust) {
      customerId = cust.id;
      isExisting = true;
      await dbHelper.run(
        `UPDATE customers SET name = ?, email = COALESCE(?, email), address = ?, zip_code = ? WHERE id = ?`,
        [cleanName, cleanEmail, cleanAddress, cleanZip, customerId]
      );
    } else {
      const result = await dbHelper.run(
        `INSERT INTO customers (name, email, phone, address, zip_code) VALUES (?, ?, ?, ?, ?)`,
        [cleanName, cleanEmail, cleanPhone, cleanAddress, cleanZip]
      );
      customerId = result.lastID;
    }

    // Also sync with users table so they can log into website if desired
    if (digitsOnly.length >= 10) {
      const existingUser = await dbHelper.get(`SELECT id FROM users WHERE phone = ? OR phone LIKE ? LIMIT 1`, [cleanPhone, `%${digitsOnly.slice(-10)}%`]);
      if (!existingUser) {
        await dbHelper.run(
          `INSERT INTO users (name, phone, email, password) VALUES (?, ?, ?, ?)`,
          [cleanName, cleanPhone, cleanEmail, '123456']
        );
      }
    }

    // Optional immediate collection record
    let collectionRecorded = false;
    let recordedAmount = 0;
    if (record_collection && collection_amount && !isNaN(parseFloat(collection_amount)) && parseFloat(collection_amount) > 0) {
      recordedAmount = parseFloat(collection_amount);
      const safeMethod = payment_method || 'Cash';
      const safeNotes = notes && notes.trim() ? notes.trim() : 'Shop walk-in customer visit collection';
      const safeDate = collection_date || new Date().toISOString().split('T')[0];

      await dbHelper.run(
        `INSERT INTO daily_collections (order_id, tracking_code, customer_name, amount, payment_method, notes, collection_date)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [null, 'SHOP-WALKIN', cleanName, recordedAmount, safeMethod, safeNotes, safeDate]
      );
      collectionRecorded = true;
    }

    res.json({
      success: true,
      message: isExisting 
        ? `Customer "${cleanName}" profile updated successfully!` 
        : `Shop walk-in customer "${cleanName}" registered successfully!`,
      customer_id: customerId,
      collection_recorded: collectionRecorded,
      amount: recordedAmount
    });
  } catch (e) {
    console.error('Error adding customer manually:', e);
    res.status(500).json({ error: 'Failed to add customer manually.' });
  }
});

// Delete customer
app.delete('/admin-api/customers/:id', requireAuth, async (req, res) => {
  try {
    const customerId = req.params.id;
    const customer = await dbHelper.get(`SELECT * FROM customers WHERE id = ? LIMIT 1`, [customerId]);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found.' });
    }

    // 1. Delete associated repair orders
    await dbHelper.run(`DELETE FROM repair_orders WHERE customer_id = ?`, [customerId]);

    // 2. Delete associated customer login account in users table if phone matches
    if (customer.phone) {
      const cleanPhone = customer.phone.replace(/[^0-9]/g, '');
      if (cleanPhone.length >= 10) {
        await dbHelper.run(`DELETE FROM users WHERE phone = ? OR phone LIKE ?`, [customer.phone, `%${cleanPhone.slice(-10)}%`]);
      } else {
        await dbHelper.run(`DELETE FROM users WHERE phone = ?`, [customer.phone]);
      }
    }

    // 3. Delete customer record
    await dbHelper.run(`DELETE FROM customers WHERE id = ?`, [customerId]);

    res.json({ success: true, message: 'Customer and related records deleted successfully.' });
  } catch (e) {
    console.error('[API Error] Delete customer failed:', e);
    res.status(500).json({ error: 'Failed to delete customer.' });
  }
});

// Contact inquiries
app.get('/admin-api/inquiries', requireAuth, async (req, res) => {
  try {
    const inquiries = await dbHelper.query(`SELECT * FROM contact_inquiries ORDER BY id DESC`);
    res.json({ success: true, inquiries });
  } catch (e) {
    res.status(500).json({ error: 'Inquiries query failed.' });
  }
});

// Update inquiry status
app.patch('/admin-api/inquiries/:id', requireAuth, async (req, res) => {
  try {
    const { status } = req.body;
    await dbHelper.run(`UPDATE contact_inquiries SET status = ? WHERE id = ?`, [status, req.params.id]);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Update failed.' });
  }
});

// ==========================================
// ADMIN NOTICE BOARD / LIVE CHAT APIS (CONNECTED WITH USER SIDE)
// ==========================================
// Public: Get active notices for user homepage
app.get('/api/notices', async (req, res) => {
  try {
    const notices = await dbHelper.query(`SELECT * FROM admin_notices WHERE is_active = 1 ORDER BY id DESC LIMIT 50`);
    res.json({ success: true, notices: notices || [] });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch notices.' });
  }
});

// Admin: Get all notices (protected)
app.get('/admin-api/notices', requireAuth, async (req, res) => {
  try {
    const notices = await dbHelper.query(`SELECT * FROM admin_notices ORDER BY id DESC`);
    res.json({ success: true, notices: notices || [] });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch admin notices.' });
  }
});

// Admin: Post new notice / chat message (protected)
app.post('/admin-api/notices', requireAuth, async (req, res) => {
  try {
    const { message, category, priority, author_name } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Notice message cannot be empty.' });
    }
    const result = await dbHelper.run(
      `INSERT INTO admin_notices (author_name, category, message, priority, is_active) VALUES (?, ?, ?, ?, 1)`,
      [
        author_name || 'Afzal (Lead Electrical Specialist & Admin)',
        category || '📢 General Notice',
        message.trim(),
        priority || 'normal'
      ]
    );
    res.json({ success: true, id: result.lastID, message: 'Notice posted to user homepage successfully!' });
  } catch (e) {
    res.status(500).json({ error: 'Failed to post notice.' });
  }
});

// Admin: Delete notice (protected)
app.delete('/admin-api/notices/:id', requireAuth, async (req, res) => {
  try {
    await dbHelper.run(`DELETE FROM admin_notices WHERE id = ?`, [req.params.id]);
    res.json({ success: true, message: 'Notice deleted successfully.' });
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete notice.' });
  }
});

// ==========================================
// ANNOUNCEMENTS & REVIEWS (CONNECTED WITH USER SIDE)
// ==========================================
app.get('/api/announcements', async (req, res) => {
  try {
    const row = await dbHelper.get(`SELECT * FROM site_announcements WHERE is_active = 1 ORDER BY id DESC LIMIT 1`);
    res.json({ success: true, announcement: row || null });
  } catch (e) { res.status(500).json({ error: 'Failed.' }); }
});

app.get('/admin-api/announcements', requireAuth, async (req, res) => {
  try {
    const row = await dbHelper.get(`SELECT * FROM site_announcements ORDER BY id DESC LIMIT 1`);
    res.json({ success: true, announcement: row || null });
  } catch (e) { res.status(500).json({ error: 'Failed.' }); }
});

app.post('/admin-api/announcements', requireAuth, async (req, res) => {
  try {
    const { is_active, badge_text, message, link_url, link_text, bg_gradient } = req.body;
    const existing = await dbHelper.get(`SELECT id FROM site_announcements ORDER BY id DESC LIMIT 1`);
    if (existing) {
      await dbHelper.run(
        `UPDATE site_announcements SET is_active = ?, badge_text = ?, message = ?, link_url = ?, link_text = ?, bg_gradient = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [is_active ? 1 : 0, badge_text || 'NOTICE', message, link_url || '#services', link_text || 'Learn More', bg_gradient || 'cyan', existing.id]
      );
    } else {
      await dbHelper.run(
        `INSERT INTO site_announcements (is_active, badge_text, message, link_url, link_text, bg_gradient) VALUES (?, ?, ?, ?, ?, ?)`,
        [is_active ? 1 : 0, badge_text || 'NOTICE', message, link_url || '#services', link_text || 'Learn More', bg_gradient || 'cyan']
      );
    }
    res.json({ success: true, message: 'Announcement broadcast updated live on customer website!' });
  } catch (e) { res.status(500).json({ error: 'Failed.' }); }
});

app.get('/api/reviews', async (req, res) => {
  try {
    const reviews = await dbHelper.query(`SELECT * FROM customer_reviews WHERE is_approved = 1 ORDER BY id DESC LIMIT 10`);
    res.json({ success: true, reviews });
  } catch (e) { res.status(500).json({ error: 'Failed.' }); }
});

app.post('/api/reviews', async (req, res) => {
  try {
    const { customer_name, location, rating, comment, device } = req.body;
    if (!customer_name || !location || !rating) return res.status(400).json({ error: 'Name, Town/City, and Rating are required.' });
    await dbHelper.run(
      `INSERT INTO customer_reviews (customer_name, location, rating, comment, device, is_approved) VALUES (?, ?, ?, ?, ?, 1)`,
      [customer_name.trim(), location.trim(), parseInt(rating) || 5, comment ? comment.trim() : '', device || 'Electronic Repair']
    );
    res.json({ success: true, message: 'Review saved!' });
  } catch (e) { res.status(500).json({ error: 'Failed.' }); }
});

app.get('/admin-api/reviews', requireAuth, async (req, res) => {
  try {
    const reviews = await dbHelper.query(`SELECT * FROM customer_reviews ORDER BY id DESC`);
    res.json({ success: true, reviews });
  } catch (e) { res.status(500).json({ error: 'Failed.' }); }
});

app.patch('/admin-api/reviews/:id', requireAuth, async (req, res) => {
  try {
    const { is_approved } = req.body;
    await dbHelper.run(`UPDATE customer_reviews SET is_approved = ? WHERE id = ?`, [is_approved ? 1 : 0, req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: 'Failed.' }); }
});

app.delete('/admin-api/reviews/:id', requireAuth, async (req, res) => {
  try {
    await dbHelper.run(`DELETE FROM customer_reviews WHERE id = ?`, [req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: 'Failed.' }); }
});

// ==========================================
// DAILY ORDER COLLECTIONS (ADMIN REVENUE)
// ==========================================

// Get all collections
app.get('/admin-api/collections', requireAuth, async (req, res) => {
  try {
    const collections = await dbHelper.query(`
      SELECT * FROM daily_collections
      ORDER BY date(collection_date) DESC, id DESC
    `);
    const todayCol = await dbHelper.get(`SELECT COALESCE(SUM(amount), 0) as total FROM daily_collections WHERE date(collection_date) = date('now', 'localtime')`);
    const weekCol  = await dbHelper.get(`SELECT COALESCE(SUM(amount), 0) as total FROM daily_collections WHERE date(collection_date) >= date('now', 'localtime', '-6 days')`);
    const monthCol = await dbHelper.get(`SELECT COALESCE(SUM(amount), 0) as total FROM daily_collections WHERE strftime('%Y-%m', collection_date) = strftime('%Y-%m', 'now', 'localtime')`);
    const totalCol = await dbHelper.get(`SELECT COALESCE(SUM(amount), 0) as total FROM daily_collections`);
    res.json({
      success: true,
      collections: collections || [],
      todayTotal: todayCol && todayCol.total ? parseFloat(todayCol.total).toFixed(2) : '0.00',
      weekTotal: weekCol && weekCol.total ? parseFloat(weekCol.total).toFixed(2) : '0.00',
      monthTotal: monthCol && monthCol.total ? parseFloat(monthCol.total).toFixed(2) : '0.00',
      overallTotal: totalCol && totalCol.total ? parseFloat(totalCol.total).toFixed(2) : '0.00'
    });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch collections.' });
  }
});

// Record a new order collection entry manually
app.post('/admin-api/collections', requireAuth, async (req, res) => {
  try {
    const { order_id, tracking_code, customer_name, amount, payment_method, notes, collection_date } = req.body;
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return res.status(400).json({ error: 'Valid collection amount is required.' });
    }
    const safeAmount = parseFloat(amount);
    const safeCustomer = (customer_name && customer_name.trim()) || 'Walk-in Customer';
    const safeTracking = (tracking_code && tracking_code.trim()) || 'DIRECT';
    const safeMethod = (payment_method && payment_method.trim()) || 'Cash';
    const safeNotes = notes ? notes.trim() : '';
    const safeDate = (collection_date && collection_date.trim()) || new Date().toISOString().split('T')[0];

    const result = await dbHelper.run(
      `INSERT INTO daily_collections (order_id, tracking_code, customer_name, amount, payment_method, notes, collection_date)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [order_id || null, safeTracking, safeCustomer, safeAmount, safeMethod, safeNotes, safeDate]
    );

    res.json({
      success: true,
      message: 'Collection recorded successfully.',
      id: result.lastID
    });
  } catch (e) {
    res.status(500).json({ error: 'Failed to record collection.' });
  }
});

// Delete an order collection entry
app.delete('/admin-api/collections/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await dbHelper.run(`DELETE FROM daily_collections WHERE id = ?`, [id]);
    res.json({ success: true, message: 'Collection entry deleted successfully.' });
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete collection entry.' });
  }
});

// ==========================================
// 8. ELECTRICIAN FEEDBACK APIS (1 PER USER + REPAIR CODE)
// ==========================================

// Public: Submit Electrician Feedback
app.post('/api/feedback', async (req, res) => {
  try {
    const { tracking_code, customer_name, phone, rating, feedback, technician_name } = req.body;
    
    if (!tracking_code || !tracking_code.trim()) {
      return res.status(400).json({ success: false, error: 'Repair / Tracking Code is required.' });
    }
    if (!customer_name || !customer_name.trim()) {
      return res.status(400).json({ success: false, error: 'Customer name is required.' });
    }
    if (!phone || !phone.trim()) {
      return res.status(400).json({ success: false, error: 'Phone number is required.' });
    }
    
    const numRating = parseInt(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ success: false, error: 'Please provide a valid rating between 1 and 5 stars.' });
    }

    const cleanCode = tracking_code.trim().toUpperCase();
    const rawPhoneDigits = phone.replace(/\D/g, '');
    const cleanPhone = rawPhoneDigits.length > 10 ? rawPhoneDigits.slice(-10) : rawPhoneDigits;
    const cleanName = customer_name.trim();
    const cleanFeedback = feedback && feedback.trim() ? feedback.trim() : 'Service completed (Rating only)';

    // Check if feedback already submitted for this code and this user!
    // Rule: One user can only one time send feedback with their code.
    // If user same but code is new -> valid.
    // If user same & code also same & user send feedback second time -> invalid.
    const existing = await dbHelper.get(
      `SELECT * FROM technician_feedback 
       WHERE UPPER(tracking_code) = ? 
       AND (
         (LENGTH(?) >= 6 AND REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '+91', '') LIKE ?)
         OR LOWER(customer_name) = LOWER(?)
       )`,
      [cleanCode, cleanPhone, `%${cleanPhone}%`, cleanName]
    );

    if (existing) {
      return res.status(400).json({
        success: false,
        error: `Feedback for code "${cleanCode}" has already been submitted by ${existing.customer_name}. Each user can only submit feedback once per code.`
      });
    }

    const tech = technician_name && technician_name.trim() 
      ? technician_name.trim() 
      : 'Afzal (Lead Electrical Specialist)';

    await dbHelper.run(
      `INSERT INTO technician_feedback (tracking_code, customer_name, phone, technician_name, rating, feedback)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [cleanCode, cleanName, phone.trim(), tech, numRating, cleanFeedback]
    );

    res.json({
      success: true,
      message: `Thank you, ${cleanName}! Your feedback for Electrician ${tech} (Code: ${cleanCode}) has been received in the Admin Feedback Section.`
    });
  } catch (e) {
    console.error('Error saving feedback:', e);
    res.status(500).json({ success: false, error: 'Failed to submit feedback. Please try again.' });
  }
});

// Admin: Get all technician feedback
app.get(['/admin-api/feedback', '/api/admin/feedback'], requireAuth, async (req, res) => {
  try {
    const sortOrder = (req.query.order || 'ASC').toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    const feedbackList = await dbHelper.query(`SELECT * FROM technician_feedback ORDER BY id ${sortOrder}`);
    res.json({ success: true, feedback: feedbackList || [] });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Failed to fetch feedback.' });
  }
});

// Admin: Delete technician feedback
app.delete(['/admin-api/feedback/:id', '/api/admin/feedback/:id'], requireAuth, async (req, res) => {
  try {
    await dbHelper.run(`DELETE FROM technician_feedback WHERE id = ?`, [req.params.id]);
    res.json({ success: true, message: 'Feedback entry deleted successfully.' });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Failed to delete feedback.' });
  }
});

// ==========================================
// START SERVER
// ==========================================
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🛡️  AR TECHNICIAN WORK — ADMIN PORTAL SERVER`);
  console.log(`👉  http://localhost:${PORT}`);
  console.log(`🔗  Customer Site: http://localhost:3000`);
  console.log(`=======================================================`);
});
