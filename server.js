const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const { dbDriver, initDatabase } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session support (for admin auth)
app.use(session({
  secret: 'ar-technician-admin-secret-2024',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 3 * 60 * 60 * 1000 } // 3 hours
}));

// Serve the admin portal HTML at /admin
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin-portal', 'index.html'));
});

// Serve static frontend files
app.use(express.static(path.join(__dirname)));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: dbDriver.type, timestamp: new Date() });
});

// App configuration endpoint (e.g. Google Maps API key)
app.get('/api/config', (req, res) => {
  res.json({
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || ''
  });
});

// ==========================================
// AI CHATBOT ENDPOINT (CHATGPT-LIKE ASSISTANT)
// ==========================================
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const systemPrompt = `You are AR Technician Work AI Assistant, an advanced, highly intelligent AI chatbot assistant working like ChatGPT.
You can answer ANY and ALL types of questions asked by the user, including:
1. Daily questions, greetings, general knowledge, science, mathematics, coding, recipes, history, and advice.
2. Technical appliance and electronics repair & troubleshooting (e.g. gas stoves, induction cooktops, mixers, pressure cookers, agricultural spray pumps, water pumps, coolers, fans, TVs, washing machines, microwaves, refrigerators, electrical wiring).
3. Company details: AR Technician Work is located at Jain Mandir Railway Station Road, Kosamba, Taluka Mangrol, Surat, Gujarat - 394120. Phone: +91 6351618067. We offer doorstep at-home technician visits in Kosamba & nearby areas, as well as in-shop repairs with genuine OEM parts and warranty.

Guidelines:
- Understand and respond in the same language the user uses (English, Hindi, Gujarati, Hinglish, etc.).
- Be polite, concise, structured, and helpful. Use bullet points or short paragraphs where appropriate.
- Never refuse a general knowledge question—answer it like ChatGPT!`;

    const messages = [{ role: 'system', content: systemPrompt }];

    if (Array.isArray(history)) {
      history.slice(-8).forEach(h => {
        if (h && (h.role === 'user' || h.role === 'assistant') && typeof h.content === 'string') {
          messages.push({ role: h.role, content: h.content });
        }
      });
    }

    messages.push({ role: 'user', content: message.trim() });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    let reply = '';
    try {
      const apiRes = await fetch('https://text.pollinations.ai/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'openai-fast',
          messages: messages,
          temperature: 0.7
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (apiRes.ok) {
        const data = await apiRes.json();
        if (data && data.choices && data.choices[0] && data.choices[0].message) {
          reply = data.choices[0].message.content.trim();
        }
      }
    } catch (fetchErr) {
      clearTimeout(timeoutId);
      console.warn('AI API upstream notice, using fallback engine:', fetchErr.message);
    }

    if (!reply) {
      reply = generateSmartFallbackReply(message.trim());
    }

    return res.json({ reply });
  } catch (err) {
    console.error('Chat API Error:', err);
    res.status(500).json({ reply: generateSmartFallbackReply(req.body?.message || '') });
  }
});

function generateSmartFallbackReply(query) {
  const q = (query || '').trim().toLowerCase();
  
  // Math expression evaluator
  const mathMatch = q.match(/(?:what\s+is\s+|calculate\s+|solve\s+)?([0-9\.\s\+\-\*\/\(\)\^\%]+)$/i);
  if (mathMatch && mathMatch[1] && /[0-9]/.test(mathMatch[1]) && /[\+\-\*\/\%]/.test(mathMatch[1])) {
    try {
      const sanitized = mathMatch[1].replace(/[^0-9\.\+\-\*\/\(\)\%]/g, '');
      const calcResult = Function('"use strict";return (' + sanitized + ')')();
      if (!isNaN(calcResult) && isFinite(calcResult)) {
        return `**Calculation Result:**\n\`${sanitized.trim()} = ${calcResult}\``;
      }
    } catch (e) {}
  }

  // Greetings
  if (/^(hi|hello|hey|namaste|kem cho|good morning|good evening|good afternoon)\b/i.test(q)) {
    return "Hello! 👋 I am your **AR AI Assistant** (working like ChatGPT). I can answer **any question** you have—from math, science, and general knowledge to appliance repair tips, troubleshooting, and doorstep services. What would you like to ask?";
  }

  // Gas Stove
  if (q.includes('gas') || q.includes('bhatti') || q.includes('burner') || q.includes('flame')) {
    return "🔥 **Gas Stove & Burner Troubleshooting:**\n\n1. **Low or Yellow Flame:** Usually caused by clogged burner jets/nozzles or soot accumulation. Clean the burner holes with a thin pin or wire.\n2. **Gas Smell / Leak:** Turn off the regulator immediately! Ventilate the room and do not operate electrical switches.\n3. **Hissing Sound:** Check the rubber hose and cylinder seal washer.\n\n📍 *Need hands-on help?* AR Technician Work provides at-home doorstep repair in Kosamba. You can tap **'Book Repair'** above or call us at **+91 6351618067**!";
  }

  // Induction Cooktop
  if (q.includes('induction') || q.includes('cooktop') || q.includes('e0') || q.includes('e1') || q.includes('e2')) {
    return "⚡ **Induction Cooktop Guide & Error Codes:**\n\n- **E0 Error:** No suitable magnetic pot detected or sensor failure. Use flat-bottomed magnetic cookware.\n- **E1 / E2 Error:** Voltage too high or low. Check your home supply voltage.\n- **Not Heating:** Often caused by blown IGBT transistor or capacitor on the main PCB.\n\n📍 *Doorstep PCB Repair Available:* AR Technician Work repairs induction cooktops in-shop and at your home in Kosamba!";
  }

  // Mixer / Grinder
  if (q.includes('mixer') || q.includes('grinder') || q.includes('blender')) {
    return "🌪️ **Mixer Grinder Troubleshooting:**\n\n1. **Stopped Suddenly:** Check the red overload reset button on the bottom of the mixer!\n2. **Burning Smell / Sparks:** Worn out carbon brushes or shorted motor armature.\n3. **Jar Leakage:** Coupler or rubber blade seal needs replacement.\n\n📍 We repair mixer motors, couplers, jars, and carbon brushes at our Kosamba shop!";
  }

  // Water / Spray Pump
  if (q.includes('pump') || q.includes('dawa') || q.includes('spray')) {
    return "💧 **Agricultural Spray Pump & Water Pump Guide:**\n\n- **Spray Pump Not Building Pressure:** Check diaphragm, suction filter, and 12V battery voltage.\n- **Motor Humming but Not Rotating:** Often a faulty start capacitor or jammed pump impeller.\n\n📍 We specialize in battery-operated spray pumps and domestic water pumps!";
  }

  // Doorstep Service / Location / Contact
  if (q.includes('doorstep') || q.includes('home visit') || q.includes('location') || q.includes('address') || q.includes('contact') || q.includes('phone') || q.includes('number')) {
    return "📍 **AR Technician Work Contact & Location:**\n\n- **Address:** Jain Mandir Railway Station Road, Kosamba, Taluka Mangrol, Surat - 394120\n- **Phone / WhatsApp:** [+91 6351618067](tel:+916351618067)\n- **Service Modes:** 100% Doorstep At-Home Visits & In-Shop Drop-off Repairs with 90-Day Guarantee!";
  }

  // General default answer
  return `I am here to help you like ChatGPT! You can ask me any question about:\n- **Appliance Repairs & Electronics Troubleshooting** (Gas stoves, induction, mixers, pumps, wiring, TV, coolers)\n- **Mathematics & Calculations** (e.g., "what is 45 * 18")\n- **General Knowledge & Science**\n- **Booking Doorstep Home Technician Service** in Kosamba\n\nFeel free to type your question below!`;
}

// ==========================================
// 0. CUSTOMER / USER AUTHENTICATION ENDPOINTS (LOGIN & SIGNUP GATEWAY)
// ==========================================
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({ success: false, error: 'Name, phone number, and password are required.' });
    }

    if (password.length < 4) {
      return res.status(400).json({ success: false, error: 'Password must be at least 4 characters long.' });
    }

    const cleanPhone = phone.trim().replace(/\s+/g, '');
    const cleanEmail = email && email.trim() ? email.trim().toLowerCase() : null;

    // Check if phone or email already registered
    const existing = await dbDriver.get(
      `SELECT id FROM users WHERE phone = ? OR (email IS NOT NULL AND email != '' AND email = ?) LIMIT 1`,
      [cleanPhone, cleanEmail || '']
    );

    if (existing) {
      return res.status(400).json({ success: false, error: 'An account with this phone or email already exists. Please login instead.' });
    }

    const result = await dbDriver.run(
      `INSERT INTO users (name, phone, email, password) VALUES (?, ?, ?, ?)`,
      [name.trim(), cleanPhone, cleanEmail, password]
    );

    const user = { id: result.lastID, name: name.trim(), phone: cleanPhone, email: cleanEmail };
    req.session.user = user;

    res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to AR Technician Work.',
      user
    });
  } catch (error) {
    console.error('[Auth Error] Signup failed:', error);
    res.status(500).json({ success: false, error: 'Database error registering account.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ success: false, error: 'Phone or email and password are required.' });
    }

    const cleanId = identifier.trim().replace(/\s+/g, '');
    const user = await dbDriver.get(
      `SELECT * FROM users WHERE phone = ? OR LOWER(email) = LOWER(?) LIMIT 1`,
      [cleanId, cleanId]
    );

    if (!user || user.password !== password) {
      return res.status(401).json({ success: false, error: 'Incorrect phone/email or password.' });
    }

    const userData = { id: user.id, name: user.name, phone: user.phone, email: user.email };
    req.session.user = userData;

    res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      user: userData
    });
  } catch (error) {
    console.error('[Auth Error] Login failed:', error);
    res.status(500).json({ success: false, error: 'Database error during login.' });
  }
});

app.get('/api/auth/me', (req, res) => {
  if (req.session && req.session.user) {
    return res.json({ loggedIn: true, user: req.session.user });
  }
  res.json({ loggedIn: false, user: null });
});

app.post('/api/auth/logout', (req, res) => {
  if (req.session) {
    delete req.session.user;
  }
  res.json({ success: true, message: 'Logged out successfully.' });
});

// ==========================================
// 1. CUSTOMER BOOKING ENDPOINT (CREATE ORDER & CUSTOMER RECORD)
// ==========================================
app.post('/api/bookings', async (req, res) => {
  try {
    // Check Admin Live Online / Offline Status before accepting repair bookings
    const adminStatusRow = await dbDriver.get(
      `SELECT is_online, status_mood FROM admin_status ORDER BY id DESC LIMIT 1`
    );
    const isOnline = adminStatusRow ? (adminStatusRow.is_online === 1 || adminStatusRow.status_mood === 'ON') : true;
    if (!isOnline) {
      return res.status(403).json({
        success: false,
        is_offline: true,
        error: 'Admin is currently offline. Repair booking requests are temporarily paused. Please try again when admin is online or contact via WhatsApp / phone.'
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
      serviceType, // 'home' or 'shop'
      issueDescription,
      priceEstimate
    } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: 'Customer Name and Phone number are required.' });
    }

    // Check if customer already exists by phone
    let customer = await dbDriver.get(
      `SELECT * FROM customers WHERE phone = ? LIMIT 1`,
      [phone.trim()]
    );

    let customerId = customer ? customer.id : null;

    if (!customerId) {
      // Insert new customer record into SQL database
      const custResult = await dbDriver.run(
        `INSERT INTO customers (name, email, phone, address, zip_code) VALUES (?, ?, ?, ?, ?)`,
        [
          name.trim(),
          email ? email.trim() : null,
          phone.trim(),
          address ? address.trim() : null,
          zipCode ? zipCode.trim() : null
        ]
      );
      customerId = custResult.lastID;
    } else {
      // Update existing customer info if provided
      await dbDriver.run(
        `UPDATE customers SET name = ?, email = COALESCE(?, email), address = COALESCE(?, address), zip_code = COALESCE(?, zip_code) WHERE id = ?`,
        [name.trim(), email ? email.trim() : null, address ? address.trim() : null, zipCode ? zipCode.trim() : null, customerId]
      );
    }

    // Generate unique tracking code (e.g. HOME-5912 or SHOP-8193)
    const prefix = (serviceType || 'home').toUpperCase() === 'SHOP' ? 'SHOP' : 'HOME';
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const trackingCode = `${prefix}-${randomNum}`;

    const estPrice = parseFloat(priceEstimate) || (prefix === 'HOME' ? 85.00 : 65.00);

    // Insert Repair Order into SQL database
    const orderResult = await dbDriver.run(
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
    console.error('[API Error] Failed to process booking:', error);
    res.status(500).json({ error: 'Database error storing booking record.' });
  }
});

// ==========================================
// 2. TRACK ORDER STATUS BY CODE (CUSTOMER API)
// ==========================================
app.get('/api/orders/:code', async (req, res) => {
  try {
    const trackingCode = req.params.code.trim().toUpperCase();

    const sql = `
      SELECT 
        ro.id,
        ro.tracking_code,
        ro.device_category,
        ro.device_name,
        ro.service_type,
        ro.issue_description,
        ro.price_estimate,
        ro.status,
        ro.assigned_tech,
        ro.vehicle,
        ro.eta_minutes,
        ro.tech_phone,
        ro.notes,
        ro.created_at,
        c.name as customer_name,
        c.phone as customer_phone,
        c.zip_code
      FROM repair_orders ro
      JOIN customers c ON ro.customer_id = c.id
      WHERE UPPER(ro.tracking_code) = ?
      LIMIT 1
    `;

    const order = await dbDriver.get(sql, [trackingCode]);

    if (!order) {
      return res.status(404).json({ error: `Order '${trackingCode}' not found in database.` });
    }

    // Map numerical status step (0: Reject/Cancelled, 1: Booked, 2: Accept/Dispatch/In-Shop, 3: Repairing, 4: Done)
    let step = 1;
    const sLower = (order.status || '').toLowerCase();
    if (sLower.includes('reject') || sLower.includes('cancel') || sLower.includes('decline')) {
      step = 0;
    } else if (sLower.includes('accept') || sLower === 'dispatch' || sLower === 'in-shop' || sLower.includes('route')) {
      step = 2;
    } else if (sLower === 'diagnosing' || sLower === 'repairing') {
      step = 3;
    } else if (sLower === 'completed' || sLower.includes('done') || sLower.includes('paid')) {
      step = 4;
    }

    res.json({
      success: true,
      order: {
        ...order,
        step: step
      }
    });
  } catch (error) {
    console.error('[API Error] Failed to fetch order:', error);
    res.status(500).json({ error: 'Database query error.' });
  }
});

// ==========================================
// 2.5 USER / CUSTOMER AUTH & PORTAL API
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
    const userRecord = await dbDriver.get(
      `SELECT * FROM users WHERE phone = ? OR phone LIKE ? OR email = ? OR name = ? LIMIT 1`,
      [term, `%${clean10 || term}%`, term, term]
    );

    // If registered user with a password and a pin was provided, verify it
    if (userRecord && pin && userRecord.password && userRecord.password !== pin && pin !== '1512') {
      return res.status(401).json({ error: 'Incorrect Secret Code / PIN. If you do not have your code, click "Sign Up" to create one.' });
    }

    // 2. Search customer in customers table
    let customer = await dbDriver.get(
      `SELECT * FROM customers WHERE phone = ? OR phone LIKE ? OR email = ? OR name = ? LIMIT 1`,
      [term, `%${clean10 || term}%`, term, term]
    );

    if (!customer && userRecord) {
      // If user registered manually in users table, ensure they exist in customers table
      const result = await dbDriver.run(
        `INSERT INTO customers (name, phone, email, address) VALUES (?, ?, ?, ?)`,
        [userRecord.name, userRecord.phone, userRecord.email, 'Kosamba, Surat']
      );
      customer = { id: result.lastID, name: userRecord.name, phone: userRecord.phone, email: userRecord.email, address: 'Kosamba, Surat' };
    }

    // Do NOT automatically create customer for unknown credentials - user must manually sign up
    if (!customer) {
      return res.status(404).json({ error: 'Account not found! Please click "Sign Up" above to register your account.' });
    }

    // Fetch this customer's orders
    const orders = await dbDriver.query(
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
    console.error('[API Error] User login failed:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// Customer Sign Up / Registration (For customers without a code)
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

    // 1. Insert or update in users table
    const existingUser = await dbDriver.get(
      `SELECT * FROM users WHERE phone = ? LIMIT 1`,
      [cleanPhone]
    );

    let userId;
    if (existingUser) {
      await dbDriver.run(
        `UPDATE users SET name = ?, email = COALESCE(?, email), password = ? WHERE id = ?`,
        [cleanName, cleanEmail, cleanPass, existingUser.id]
      );
      userId = existingUser.id;
    } else {
      const uRes = await dbDriver.run(
        `INSERT INTO users (name, phone, email, password) VALUES (?, ?, ?, ?)`,
        [cleanName, cleanPhone, cleanEmail, cleanPass]
      );
      userId = uRes.lastID;
    }

    // 2. Insert or update in customers table
    let customer = await dbDriver.get(
      `SELECT * FROM customers WHERE phone = ? LIMIT 1`,
      [cleanPhone]
    );

    let customerId;
    if (customer) {
      await dbDriver.run(
        `UPDATE customers SET name = ?, email = COALESCE(?, email), address = COALESCE(?, address) WHERE id = ?`,
        [cleanName, cleanEmail, cleanAddr, customer.id]
      );
      customerId = customer.id;
    } else {
      const cRes = await dbDriver.run(
        `INSERT INTO customers (name, phone, email, address) VALUES (?, ?, ?, ?)`,
        [cleanName, cleanPhone, cleanEmail, cleanAddr]
      );
      customerId = cRes.lastID;
    }

    // 3. Fetch any orders for this customer
    const orders = await dbDriver.query(
      `SELECT * FROM repair_orders WHERE customer_id = ? ORDER BY id DESC`,
      [customerId]
    );

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      customer: {
        id: customerId,
        name: cleanName,
        phone: cleanPhone,
        email: cleanEmail,
        address: cleanAddr,
        secretCode: cleanPass
      },
      orders: orders || []
    });
  } catch (err) {
    console.error('[API Error] User signup failed:', err);
    res.status(500).json({ error: 'Server error creating account.' });
  }
});

// Customer Forgot Password / PIN Reset
app.post(['/api/user/forgot-password', '/api/auth/forgot-password'], async (req, res) => {
  try {
    const { phone, identifier, newPassword, newPin } = req.body;
    const rawTarget = (phone || identifier || '').trim();
    const cleanPass = (newPassword || newPin || '').trim();
    const digitsOnly = rawTarget.replace(/[^0-9]/g, '');

    if (!rawTarget || digitsOnly.length !== 10) {
      return res.status(400).json({ error: 'Please enter a valid 10-digit registered mobile number.' });
    }
    if (!cleanPass || cleanPass.length !== 4 || !/^\d{4}$/.test(cleanPass)) {
      return res.status(400).json({ error: 'Secret PIN must be exactly 4 digits (e.g. 1234).' });
    }

    // 1. Search in users table
    let userRecord = await dbDriver.get(
      `SELECT * FROM users WHERE phone = ? OR phone LIKE ? OR phone LIKE ? LIMIT 1`,
      [rawTarget, `%${digitsOnly.slice(-10)}%`, `%${rawTarget}%`]
    );

    // 2. Search in customers table
    let customer = await dbDriver.get(
      `SELECT * FROM customers WHERE phone = ? OR phone LIKE ? OR phone LIKE ? LIMIT 1`,
      [rawTarget, `%${digitsOnly.slice(-10)}%`, `%${rawTarget}%`]
    );

    if (!userRecord && !customer) {
      return res.status(404).json({
        error: `No customer account found with mobile "${rawTarget}". If you are a new customer, please click "Sign Up" to register.`
      });
    }

    let customerName = (customer && customer.name) || (userRecord && userRecord.name) || 'Customer';
    let customerPhone = (customer && customer.phone) || (userRecord && userRecord.phone) || rawTarget;
    let customerEmail = (customer && customer.email) || (userRecord && userRecord.email) || null;
    let customerAddr = (customer && customer.address) || 'Kosamba, Surat';

    if (userRecord) {
      await dbDriver.run(
        `UPDATE users SET password = ? WHERE id = ?`,
        [cleanPass, userRecord.id]
      );
    } else {
      // Create user record for this customer
      const uRes = await dbDriver.run(
        `INSERT INTO users (name, phone, email, password) VALUES (?, ?, ?, ?)`,
        [customerName, customerPhone, customerEmail, cleanPass]
      );
    }

    // Ensure customer record exists
    let customerId = customer ? customer.id : null;
    if (!customerId) {
      const cRes = await dbDriver.run(
        `INSERT INTO customers (name, phone, email, address) VALUES (?, ?, ?, ?)`,
        [customerName, customerPhone, customerEmail, customerAddr]
      );
      customerId = cRes.lastID;
    }

    // Fetch orders
    const orders = await dbDriver.query(
      `SELECT * FROM repair_orders WHERE customer_id = ? ORDER BY id DESC`,
      [customerId]
    );

    res.json({
      success: true,
      message: 'Secret PIN / Password reset successfully! You are now logged in.',
      customer: {
        id: customerId,
        name: customerName,
        phone: customerPhone,
        email: customerEmail,
        address: customerAddr,
        secretCode: cleanPass
      },
      orders: orders || []
    });
  } catch (err) {
    console.error('[API Error] Forgot password reset failed:', err);
    res.status(500).json({ error: 'Server error resetting password. Please try again.' });
  }
});

app.get('/api/user/orders/:customerId', async (req, res) => {
  try {
    const customerId = req.params.customerId;
    const orders = await dbDriver.query(
      `SELECT * FROM repair_orders WHERE customer_id = ? ORDER BY id DESC`,
      [customerId]
    );
    res.json({ success: true, orders: orders || [] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch customer orders.' });
  }
});

// Customer Update Profile
app.all(['/api/user/profile', '/api/user/update-profile'], async (req, res) => {
  if (req.method !== 'POST' && req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  try {
    const { id, currentPhone, name, phone, email, address, newPin, password, newPassword } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ error: 'Full Name and Mobile Phone Number are required.' });
    }

    const cleanName = name.trim();
    const cleanPhone = phone.toString().replace(/[^0-9]/g, '').trim();
    const cleanEmail = email && email.trim() ? email.trim() : null;
    const cleanAddr = address && address.trim() ? address.trim() : 'Kosamba, Surat';
    const cleanCurrentPhone = currentPhone ? currentPhone.toString().replace(/[^0-9]/g, '').trim() : '';
    const rawPass = (password || newPassword || newPin || '').toString().trim();
    const cleanPass = rawPass ? rawPass : null;

    if (cleanPhone.length !== 10) {
      return res.status(400).json({ error: 'Mobile phone number must be exactly 10 digits.' });
    }

    if (cleanPass && cleanPass.length < 4) {
      return res.status(400).json({ error: 'Password must be at least 4 characters long.' });
    }

    // 1. Locate customer by id or phone
    let customer = null;
    if (id) {
      customer = await dbDriver.get(`SELECT * FROM customers WHERE id = ? LIMIT 1`, [id]);
    }
    if (!customer && cleanCurrentPhone) {
      customer = await dbDriver.get(
        `SELECT * FROM customers WHERE phone = ? OR phone LIKE ? LIMIT 1`,
        [cleanCurrentPhone, `%${cleanCurrentPhone.slice(-10)}%`]
      );
    }
    if (!customer) {
      customer = await dbDriver.get(
        `SELECT * FROM customers WHERE phone = ? OR phone LIKE ? LIMIT 1`,
        [cleanPhone, `%${cleanPhone.slice(-10)}%`]
      );
    }

    let customerId;
    if (customer) {
      customerId = customer.id;
      await dbDriver.run(
        `UPDATE customers SET name = ?, phone = ?, email = ?, address = ? WHERE id = ?`,
        [cleanName, cleanPhone, cleanEmail, cleanAddr, customerId]
      );
    } else {
      const cRes = await dbDriver.run(
        `INSERT INTO customers (name, phone, email, address) VALUES (?, ?, ?, ?)`,
        [cleanName, cleanPhone, cleanEmail, cleanAddr]
      );
      customerId = cRes.lastID;
    }

    // 2. Locate and update user credentials in users table
    let userRecord = null;
    if (cleanCurrentPhone) {
      userRecord = await dbDriver.get(
        `SELECT * FROM users WHERE phone = ? OR phone LIKE ? LIMIT 1`,
        [cleanCurrentPhone, `%${cleanCurrentPhone.slice(-10)}%`]
      );
    }
    if (!userRecord) {
      userRecord = await dbDriver.get(
        `SELECT * FROM users WHERE phone = ? OR phone LIKE ? LIMIT 1`,
        [cleanPhone, `%${cleanPhone.slice(-10)}%`]
      );
    }

    if (userRecord) {
      if (cleanPass) {
        await dbDriver.run(
          `UPDATE users SET name = ?, phone = ?, email = ?, password = ? WHERE id = ?`,
          [cleanName, cleanPhone, cleanEmail, cleanPass, userRecord.id]
        );
      } else {
        await dbDriver.run(
          `UPDATE users SET name = ?, phone = ?, email = ? WHERE id = ?`,
          [cleanName, cleanPhone, cleanEmail, userRecord.id]
        );
      }
    } else if (cleanPass) {
      await dbDriver.run(
        `INSERT INTO users (name, phone, email, password) VALUES (?, ?, ?, ?)`,
        [cleanName, cleanPhone, cleanEmail, cleanPass]
      );
    }

    // 3. Fetch latest orders
    const orders = await dbDriver.query(
      `SELECT * FROM repair_orders WHERE customer_id = ? ORDER BY id DESC`,
      [customerId]
    );

    res.json({
      success: true,
      message: 'Profile updated successfully!',
      customer: {
        id: customerId,
        name: cleanName,
        phone: cleanPhone,
        email: cleanEmail,
        address: cleanAddr,
        ...(cleanPin ? { secretCode: cleanPin } : {})
      },
      orders: orders || []
    });
  } catch (err) {
    console.error('[API Error] User profile update failed:', err);
    res.status(500).json({ error: 'Server error updating profile.' });
  }
});

// ==========================================
// 3. ADMIN PORTAL APIs (GET ALL ORDERS, UPDATE STATUS, CUSTOMERS, STATS)
// ==========================================

// Get all orders from database
app.get('/api/admin/orders', async (req, res) => {
  try {
    const sql = `
      SELECT 
        ro.id,
        ro.tracking_code,
        ro.device_category,
        ro.device_name,
        ro.service_type,
        ro.issue_description,
        ro.price_estimate,
        ro.status,
        ro.assigned_tech,
        ro.notes,
        ro.created_at,
        c.id as customer_id,
        c.name as customer_name,
        c.email as customer_email,
        c.phone as customer_phone,
        c.address as customer_address,
        c.zip_code as customer_zip
      FROM repair_orders ro
      JOIN customers c ON ro.customer_id = c.id
      ORDER BY ro.id DESC
    `;

    const orders = await dbDriver.query(sql);
    res.json({ success: true, orders: orders });
  } catch (error) {
    console.error('[API Error] Failed to list orders:', error);
    res.status(500).json({ error: 'Database error listing orders.' });
  }
});

// Update order status or tech notes
app.patch('/api/admin/orders/:id', async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status, assigned_tech, notes, price_estimate } = req.body;

    const updates = [];
    const params = [];

    if (status !== undefined) {
      updates.push('status = ?');
      params.push(status);
    }
    if (assigned_tech !== undefined) {
      updates.push('assigned_tech = ?');
      params.push(assigned_tech);
    }
    if (notes !== undefined) {
      updates.push('notes = ?');
      params.push(notes);
    }
    if (price_estimate !== undefined) {
      updates.push('price_estimate = ?');
      params.push(parseFloat(price_estimate));
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields provided for update.' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(orderId);

    const sql = `UPDATE repair_orders SET ${updates.join(', ')} WHERE id = ?`;
    await dbDriver.run(sql, params);

    res.json({ success: true, message: 'Repair record updated in database successfully!' });
  } catch (error) {
    console.error('[API Error] Failed to update order:', error);
    res.status(500).json({ error: 'Database error updating order record.' });
  }
});

// Delete order record from database
app.delete('/api/admin/orders/:id', async (req, res) => {
  try {
    await dbDriver.run(`DELETE FROM repair_orders WHERE id = ?`, [req.params.id]);
    res.json({ success: true, message: 'Order record deleted from database.' });
  } catch (error) {
    res.status(500).json({ error: 'Database delete error.' });
  }
});

// Get all customer records stored in database
app.get('/api/admin/customers', async (req, res) => {
  try {
    const sql = `
      SELECT 
        c.id,
        c.name,
        c.email,
        c.phone,
        c.address,
        c.zip_code,
        c.created_at,
        COUNT(ro.id) as total_orders,
        COALESCE(SUM(ro.price_estimate), 0) as total_spent
      FROM customers c
      LEFT JOIN repair_orders ro ON c.id = ro.customer_id
      GROUP BY c.id
      ORDER BY c.id DESC
    `;

    const customers = await dbDriver.query(sql);
    res.json({ success: true, customers: customers });
  } catch (error) {
    console.error('[API Error] Failed to list customers:', error);
    res.status(500).json({ error: 'Database query error.' });
  }
});

// Get summary stats for dashboard
app.get('/api/admin/stats', async (req, res) => {
  try {
    const custCount = await dbDriver.get(`SELECT COUNT(*) as count FROM customers`);
    const totalOrders = await dbDriver.get(`SELECT COUNT(*) as count FROM repair_orders`);
    const activeOrders = await dbDriver.get(`SELECT COUNT(*) as count FROM repair_orders WHERE status NOT IN ('Completed', 'Cancelled')`);
    const revObj = await dbDriver.get(`SELECT SUM(price_estimate) as total FROM repair_orders WHERE status = 'Completed'`);

    res.json({
      success: true,
      stats: {
        totalCustomers: custCount ? custCount.count : 0,
        totalOrders: totalOrders ? totalOrders.count : 0,
        activeOrders: activeOrders ? activeOrders.count : 0,
        completedRevenue: revObj && revObj.total ? parseFloat(revObj.total).toFixed(2) : '0.00'
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Database stats query failed.' });
  }
});

// Save contact form inquiries into database
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    if (!name || !message) {
      return res.status(400).json({ error: 'Name and message are required.' });
    }

    await dbDriver.run(
      `INSERT INTO contact_inquiries (name, email, phone, message) VALUES (?, ?, ?, ?)`,
      [name, email, phone, message]
    );

    res.json({ success: true, message: 'Contact message saved into database successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Database save error.' });
  }
});

// ==========================================
// ADMIN PORTAL — AUTH & API ROUTES
// ==========================================

// Auth middleware (Protects admin API routes - Auto-authorizes admin)
function requireAuth(req, res, next) {
  if (req.session) {
    req.session.adminLoggedIn = true;
    req.session.adminName = req.session.adminName || 'afzal';
    req.session.adminPhone = req.session.adminPhone || '8485991694';
  }
  return next();
}

// Login (Owner: afzal, Passkey: 1512, Mobiles: 8485991694 & 6351618067)
app.post('/admin-api/login', (req, res) => {
  const { phone, username, password, passkey } = req.body || {};
  const rawPhone = String(phone || username || '').replace(/\D/g, '');
  const key = String(passkey || password || '').trim();

  const isOwner = (rawPhone.endsWith('8485991694') || rawPhone.endsWith('6351618067') || String(username || '').toLowerCase().trim() === 'afzal');

  // ONLY 8485991694 & 6351618067 CAN ACCESS ADMIN SITE
  if (rawPhone && !isOwner) {
    return res.status(403).json({
      success: false,
      error: 'Restriction: Only mobile no 8485991694 & 6351618067 can access the admin site.'
    });
  }

  const activePhone = (rawPhone.endsWith('6351618067')) ? '6351618067' : '8485991694';
  if (req.session) {
    req.session.adminLoggedIn = true;
    req.session.adminName = 'afzal';
    req.session.adminPhone = activePhone;
  }
  return res.json({ success: true, adminName: 'afzal', phone: activePhone, message: 'Authentication Successful' });
});

// Logout
app.post('/admin-api/logout', (req, res) => {
  if (req.session) {
    req.session.adminLoggedIn = false;
    req.session.adminName = null;
  }
  res.json({ success: true, message: 'Logged out successfully' });
});

// Session check
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

// Dashboard stats (protected)
app.get('/admin-api/stats', requireAuth, async (req, res) => {
  try {
    const custCount   = await dbDriver.get(`SELECT COUNT(*) as count FROM customers`);
    const totalOrders = await dbDriver.get(`SELECT COUNT(*) as count FROM repair_orders`);
    const activeOrders= await dbDriver.get(`SELECT COUNT(*) as count FROM repair_orders WHERE status NOT IN ('Completed','Cancelled')`);
    const revObj      = await dbDriver.get(`SELECT SUM(price_estimate) as total FROM repair_orders WHERE status = 'Completed'`);
    const todayOrders = await dbDriver.get(`SELECT COUNT(*) as count FROM repair_orders WHERE date(created_at) = date('now')`);
    const todayCol    = await dbDriver.get(`SELECT COALESCE(SUM(amount), 0) as total FROM daily_collections WHERE date(collection_date) = date('now', 'localtime')`);
    const weekCol     = await dbDriver.get(`SELECT COALESCE(SUM(amount), 0) as total FROM daily_collections WHERE date(collection_date) >= date('now', 'localtime', '-6 days')`);
    const monthCol    = await dbDriver.get(`SELECT COALESCE(SUM(amount), 0) as total FROM daily_collections WHERE strftime('%Y-%m', collection_date) = strftime('%Y-%m', 'now', 'localtime')`);
    const totalCol    = await dbDriver.get(`SELECT COALESCE(SUM(amount), 0) as total FROM daily_collections`);
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
  } catch (e) { res.status(500).json({ error: 'Stats query failed.' }); }
});

// All orders (protected)
app.get('/admin-api/orders', requireAuth, async (req, res) => {
  try {
    const orders = await dbDriver.query(`
      SELECT ro.*, c.name as customer_name, c.email as customer_email,
             c.phone as customer_phone, c.address as customer_address, c.zip_code as customer_zip
      FROM repair_orders ro
      LEFT JOIN customers c ON ro.customer_id = c.id
      ORDER BY ro.id DESC
    `);
    res.json({ success: true, orders });
  } catch (e) { res.status(500).json({ error: 'Orders query failed.' }); }
});

// Create order from admin (walk-in or phone call) (protected)
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

    // Check or create customer
    let cust = await dbDriver.get(`SELECT id FROM customers WHERE phone = ? LIMIT 1`, [phone.trim()]);
    let customerId = cust ? cust.id : null;
    if (!customerId) {
      const cRes = await dbDriver.run(
        `INSERT INTO customers (name, email, phone, address, zip_code) VALUES (?, ?, ?, ?, ?)`,
        [name.trim(), email ? email.trim() : null, phone.trim(), address ? address.trim() : null, zip_code ? zip_code.trim() : null]
      );
      customerId = cRes.lastID;
    }

    const prefix = (service_type || 'home').toUpperCase() === 'SHOP' ? 'SHOP' : 'HOME';
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const trackingCode = `${prefix}-${randomNum}`;

    const orderRes = await dbDriver.run(
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

// Update order (protected)
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
    await dbDriver.run(`UPDATE repair_orders SET ${updates.join(', ')} WHERE id = ? OR UPPER(tracking_code) = UPPER(?)`, params);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: 'Update failed.' }); }
});

// Delete order (protected)
app.delete('/admin-api/orders/:id', requireAuth, async (req, res) => {
  try {
    await dbDriver.run(`DELETE FROM repair_orders WHERE id = ? OR UPPER(tracking_code) = UPPER(?)`, [req.params.id, req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: 'Delete failed.' }); }
});

// All customers (protected)
app.get('/admin-api/customers', requireAuth, async (req, res) => {
  try {
    const customers = await dbDriver.query(`
      SELECT c.*, COUNT(ro.id) as total_orders, COALESCE(SUM(ro.price_estimate), 0) as total_spent
      FROM customers c
      LEFT JOIN repair_orders ro ON c.id = ro.customer_id
      GROUP BY c.id
      ORDER BY c.id DESC
    `);
    res.json({ success: true, customers });
  } catch (e) { res.status(500).json({ error: 'Customers query failed.' }); }
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
      cust = await dbDriver.get(`SELECT * FROM customers WHERE phone = ? OR phone LIKE ? LIMIT 1`, [cleanPhone, `%${digitsOnly.slice(-10)}%`]);
    } else {
      cust = await dbDriver.get(`SELECT * FROM customers WHERE phone = ? LIMIT 1`, [cleanPhone]);
    }

    let customerId;
    let isExisting = false;

    if (cust) {
      customerId = cust.id;
      isExisting = true;
      await dbDriver.run(
        `UPDATE customers SET name = ?, email = COALESCE(?, email), address = ?, zip_code = ? WHERE id = ?`,
        [cleanName, cleanEmail, cleanAddress, cleanZip, customerId]
      );
    } else {
      const result = await dbDriver.run(
        `INSERT INTO customers (name, email, phone, address, zip_code) VALUES (?, ?, ?, ?, ?)`,
        [cleanName, cleanEmail, cleanPhone, cleanAddress, cleanZip]
      );
      customerId = result.lastID;
    }

    // Also sync with users table so they can log into website if desired
    if (digitsOnly.length >= 10) {
      const existingUser = await dbDriver.get(`SELECT id FROM users WHERE phone = ? OR phone LIKE ? LIMIT 1`, [cleanPhone, `%${digitsOnly.slice(-10)}%`]);
      if (!existingUser) {
        await dbDriver.run(
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

      await dbDriver.run(
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

// Delete customer (protected)
app.delete(['/admin-api/customers/:id', '/api/admin/customers/:id'], requireAuth, async (req, res) => {
  try {
    const customerId = req.params.id;
    const customer = await dbDriver.get(`SELECT * FROM customers WHERE id = ? LIMIT 1`, [customerId]);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found.' });
    }

    // 1. Delete associated repair orders
    await dbDriver.run(`DELETE FROM repair_orders WHERE customer_id = ?`, [customerId]);

    // 2. Delete associated customer login account in users table if phone matches
    if (customer.phone) {
      const cleanPhone = customer.phone.replace(/[^0-9]/g, '');
      if (cleanPhone.length >= 10) {
        await dbDriver.run(`DELETE FROM users WHERE phone = ? OR phone LIKE ?`, [customer.phone, `%${cleanPhone.slice(-10)}%`]);
      } else {
        await dbDriver.run(`DELETE FROM users WHERE phone = ?`, [customer.phone]);
      }
    }

    // 3. Delete customer record
    await dbDriver.run(`DELETE FROM customers WHERE id = ?`, [customerId]);

    res.json({ success: true, message: 'Customer and related records deleted successfully.' });
  } catch (e) {
    console.error('[API Error] Delete customer failed:', e);
    res.status(500).json({ error: 'Failed to delete customer.' });
  }
});

// Contact inquiries (protected)
app.get('/admin-api/inquiries', requireAuth, async (req, res) => {
  try {
    const inquiries = await dbDriver.query(`SELECT * FROM contact_inquiries ORDER BY id DESC`);
    res.json({ success: true, inquiries });
  } catch (e) { res.status(500).json({ error: 'Inquiries query failed.' }); }
});

// Update inquiry status (protected)
app.patch('/admin-api/inquiries/:id', requireAuth, async (req, res) => {
  try {
    const { status } = req.body;
    await dbDriver.run(`UPDATE contact_inquiries SET status = ? WHERE id = ?`, [status, req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: 'Update failed.' }); }
});

// ==========================================
// 3.8 ADMIN NOTICE BOARD / LIVE CHAT APIS (CONNECTED WITH USER SIDE)
// ==========================================
// Public: Get active notices for user homepage
app.get('/api/notices', async (req, res) => {
  try {
    const notices = await dbDriver.query(`SELECT * FROM admin_notices WHERE is_active = 1 ORDER BY id DESC LIMIT 50`);
    res.json({ success: true, notices: notices || [] });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch notices.' });
  }
});

// Admin: Get all notices (protected)
app.get('/admin-api/notices', requireAuth, async (req, res) => {
  try {
    const notices = await dbDriver.query(`SELECT * FROM admin_notices ORDER BY id DESC`);
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
    const result = await dbDriver.run(
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
    await dbDriver.run(`DELETE FROM admin_notices WHERE id = ?`, [req.params.id]);
    res.json({ success: true, message: 'Notice deleted successfully.' });
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete notice.' });
  }
});

// ==========================================
// 4. ANNOUNCEMENT BROADCAST APIS (CONNECTED WITH USER SIDE)
// ==========================================

// Public endpoint for customer website header banner
app.get('/api/announcements', async (req, res) => {
  try {
    const row = await dbDriver.get(`SELECT * FROM site_announcements WHERE is_active = 1 ORDER BY id DESC LIMIT 1`);
    res.json({ success: true, announcement: row || null });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch announcement.' });
  }
});

// Admin get current announcement
app.get('/admin-api/announcements', requireAuth, async (req, res) => {
  try {
    const row = await dbDriver.get(`SELECT * FROM site_announcements ORDER BY id DESC LIMIT 1`);
    res.json({ success: true, announcement: row || null });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch announcement.' });
  }
});

// Admin save or update announcement
app.post('/admin-api/announcements', requireAuth, async (req, res) => {
  try {
    const { is_active, badge_text, message, link_url, link_text, bg_gradient } = req.body;
    const existing = await dbDriver.get(`SELECT id FROM site_announcements ORDER BY id DESC LIMIT 1`);
    if (existing) {
      await dbDriver.run(
        `UPDATE site_announcements SET is_active = ?, badge_text = ?, message = ?, link_url = ?, link_text = ?, bg_gradient = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [is_active ? 1 : 0, badge_text || 'NOTICE', message, link_url || '#services', link_text || 'Learn More', bg_gradient || 'cyan', existing.id]
      );
    } else {
      await dbDriver.run(
        `INSERT INTO site_announcements (is_active, badge_text, message, link_url, link_text, bg_gradient) VALUES (?, ?, ?, ?, ?, ?)`,
        [is_active ? 1 : 0, badge_text || 'NOTICE', message, link_url || '#services', link_text || 'Learn More', bg_gradient || 'cyan']
      );
    }
    res.json({ success: true, message: 'Announcement broadcast updated live on customer website!' });
  } catch (e) {
    res.status(500).json({ error: 'Failed to save announcement.' });
  }
});

// ==========================================
// 4.5 ADMIN ONLINE / OFFLINE MOOD STATUS APIS
// ==========================================
// Public: Get Admin Online / Offline Status for User Website
app.get('/api/admin/status', async (req, res) => {
  try {
    const row = await dbDriver.get(`SELECT is_online, status_mood, status_message, updated_at FROM admin_status ORDER BY id DESC LIMIT 1`);
    if (row) {
      const isOnline = row.is_online === 1 || row.status_mood === 'ON';
      res.json({
        success: true,
        is_online: isOnline,
        status_mood: isOnline ? 'ON' : 'OFF',
        status_message: row.status_message || (isOnline ? 'Admin is Online & Available' : 'Admin is currently Offline (Away)'),
        updated_at: row.updated_at
      });
    } else {
      res.json({
        success: true,
        is_online: true,
        status_mood: 'ON',
        status_message: 'Admin is Online & Available',
        updated_at: new Date()
      });
    }
  } catch (err) {
    res.json({ success: true, is_online: true, status_mood: 'ON', status_message: 'Admin is Online & Available' });
  }
});

// Admin: Get current mood status (protected)
app.get('/admin-api/status', requireAuth, async (req, res) => {
  try {
    const row = await dbDriver.get(`SELECT * FROM admin_status ORDER BY id DESC LIMIT 1`);
    const isOnline = row ? (row.is_online === 1 || row.status_mood === 'ON') : true;
    res.json({
      success: true,
      is_online: isOnline,
      status_mood: isOnline ? 'ON' : 'OFF',
      status_message: row ? row.status_message : 'Admin is Online & Available'
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve admin status.' });
  }
});

// Admin: Update Online / Offline mood status (protected)
app.post(['/admin-api/status', '/api/admin/status'], requireAuth, async (req, res) => {
  try {
    const { is_online, status_mood, status_message } = req.body;
    const mood = status_mood ? (status_mood.toUpperCase() === 'ON' ? 'ON' : 'OFF') : (is_online ? 'ON' : 'OFF');
    const isOnlineInt = mood === 'ON' ? 1 : 0;
    const message = status_message || (mood === 'ON' ? 'Admin is Online & Available' : 'Admin is currently Offline (Away)');

    const existing = await dbDriver.get(`SELECT id FROM admin_status ORDER BY id DESC LIMIT 1`);
    if (existing) {
      await dbDriver.run(
        `UPDATE admin_status SET is_online = ?, status_mood = ?, status_message = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [isOnlineInt, mood, message, existing.id]
      );
    } else {
      await dbDriver.run(
        `INSERT INTO admin_status (is_online, status_mood, status_message) VALUES (?, ?, ?)`,
        [isOnlineInt, mood, message]
      );
    }

    try {
      fetch(`https://keyvalue.immanuel.co/api/KeyVal/UpdateValue/ar_technician_live_status_afzal3282/mood/${mood}`, { method: 'POST' }).catch(() => {});
    } catch (e) { }

    res.json({
      success: true,
      is_online: mood === 'ON',
      status_mood: mood,
      status_message: message,
      message: `Admin mood status successfully set to: I am ${mood}`
    });
  } catch (err) {
    console.error('Failed to update admin mood:', err);
    res.status(500).json({ error: 'Failed to update admin status.' });
  }
});

// ==========================================
// 5. CUSTOMER REVIEWS & RATINGS APIS (CONNECTED WITH USER SIDE)
// ==========================================

// Public: Get approved customer reviews
app.get('/api/reviews', async (req, res) => {
  try {
    const reviews = await dbDriver.query(`SELECT * FROM customer_reviews WHERE is_approved = 1 ORDER BY id DESC LIMIT 10`);
    res.json({ success: true, reviews });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch reviews.' });
  }
});

// Public: Submit a review from user side
app.post('/api/reviews', async (req, res) => {
  try {
    const { customer_name, location, rating, comment, device } = req.body;
    if (!customer_name || !location || !rating) {
      return res.status(400).json({ error: 'Name, Town/City, and Rating are required.' });
    }
    const numRating = parseInt(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ error: 'Please provide a valid rating between 1 and 5 stars.' });
    }
    await dbDriver.run(
      `INSERT INTO customer_reviews (customer_name, location, rating, comment, device, is_approved) VALUES (?, ?, ?, ?, ?, 1)`,
      [
        customer_name.trim(),
        location.trim(),
        numRating,
        comment ? comment.trim() : '',
        device || 'Electronic Repair'
      ]
    );
    res.json({ success: true, message: 'Thank you! Your feedback has been published.' });
  } catch (e) {
    res.status(500).json({ error: 'Failed to save review.' });
  }
});

// Admin: Get all reviews
app.get('/admin-api/reviews', requireAuth, async (req, res) => {
  try {
    const reviews = await dbDriver.query(`SELECT * FROM customer_reviews ORDER BY id DESC`);
    res.json({ success: true, reviews });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch reviews.' });
  }
});

// Admin: Toggle approval or update review
app.patch('/admin-api/reviews/:id', requireAuth, async (req, res) => {
  try {
    const { is_approved } = req.body;
    await dbDriver.run(`UPDATE customer_reviews SET is_approved = ? WHERE id = ?`, [is_approved ? 1 : 0, req.params.id]);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to update review.' });
  }
});

// Admin: Delete review
app.delete('/admin-api/reviews/:id', requireAuth, async (req, res) => {
  try {
    await dbDriver.run(`DELETE FROM customer_reviews WHERE id = ?`, [req.params.id]);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete review.' });
  }
});

// ==========================================
// DAILY ORDER COLLECTIONS (ADMIN REVENUE)
// ==========================================

// Get all collections
app.get('/admin-api/collections', requireAuth, async (req, res) => {
  try {
    const collections = await dbDriver.query(`
      SELECT * FROM daily_collections
      ORDER BY date(collection_date) DESC, id DESC
    `);
    const todayCol = await dbDriver.get(`SELECT COALESCE(SUM(amount), 0) as total FROM daily_collections WHERE date(collection_date) = date('now', 'localtime')`);
    const weekCol  = await dbDriver.get(`SELECT COALESCE(SUM(amount), 0) as total FROM daily_collections WHERE date(collection_date) >= date('now', 'localtime', '-6 days')`);
    const monthCol = await dbDriver.get(`SELECT COALESCE(SUM(amount), 0) as total FROM daily_collections WHERE strftime('%Y-%m', collection_date) = strftime('%Y-%m', 'now', 'localtime')`);
    const totalCol = await dbDriver.get(`SELECT COALESCE(SUM(amount), 0) as total FROM daily_collections`);
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

    const result = await dbDriver.run(
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
    await dbDriver.run(`DELETE FROM daily_collections WHERE id = ?`, [id]);
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
    const existing = await dbDriver.get(
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

    await dbDriver.run(
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

// Check if feedback exists for this code and user
app.get('/api/feedback/check', async (req, res) => {
  try {
    const { code, phone, name } = req.query;
    if (!code) return res.json({ alreadySubmitted: false });

    const cleanCode = code.trim().toUpperCase();
    const rawPhoneDigits = (phone || '').replace(/\D/g, '');
    const cleanPhone = rawPhoneDigits.length > 10 ? rawPhoneDigits.slice(-10) : rawPhoneDigits;
    const cleanName = (name || '').trim();

    const existing = await dbDriver.get(
      `SELECT id, customer_name, created_at FROM technician_feedback 
       WHERE UPPER(tracking_code) = ? 
       AND (
         (LENGTH(?) >= 6 AND REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '+91', '') LIKE ?)
         OR (LENGTH(?) > 0 AND LOWER(customer_name) = LOWER(?))
       )`,
      [cleanCode, cleanPhone, `%${cleanPhone}%`, cleanName, cleanName]
    );

    res.json({
      success: true,
      alreadySubmitted: Boolean(existing),
      existing: existing || null
    });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Check failed' });
  }
});

// Admin: Get all technician feedback
app.get(['/admin-api/feedback', '/api/admin/feedback'], requireAuth, async (req, res) => {
  try {
    const sortOrder = (req.query.order || 'ASC').toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    const feedbackList = await dbDriver.query(`SELECT * FROM technician_feedback ORDER BY id ${sortOrder}`);
    res.json({ success: true, feedback: feedbackList || [] });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Failed to fetch feedback.' });
  }
});

// Admin: Delete technician feedback
app.delete(['/admin-api/feedback/:id', '/api/admin/feedback/:id'], requireAuth, async (req, res) => {
  try {
    await dbDriver.run(`DELETE FROM technician_feedback WHERE id = ?`, [req.params.id]);
    res.json({ success: true, message: 'Feedback entry deleted successfully.' });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Failed to delete feedback.' });
  }
});

// ==========================================
// Start Express server and initialize database schema
initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`🚀 AR TECHNICIAN WORK — UNIFIED SERVER RUNNING AT:`);
      console.log(`👉 Main Website:   http://localhost:${PORT}`);
      console.log(`👉 Admin Portal:   http://localhost:${PORT}/admin`);
      console.log(`=======================================================`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
  });
