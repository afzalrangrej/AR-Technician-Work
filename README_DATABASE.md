# 🗄️ ElectroHome Customer & Repair Record Database

This project features a **relational SQL database engine** designed for storing customer information, repair orders, technician assignments, and contact inquiries.

---

## ⚡ Quick Start: Running the Server & Database

1. **Start the Server & Database:**
   ```bash
   node server.js
   ```
2. **Access the Website:**
   - Main Website: `http://localhost:3000`
   - Customer Database Admin Portal: `http://localhost:3000/admin.html`

---

## 📦 Database Options (SQLite vs MySQL)

### Option 1: SQLite (Default — Ready Out of the Box)
- **Zero Configuration Required:** Uses an embedded relational SQL database (`database.db`).
- Standard SQL queries (`SELECT`, `INSERT`, `UPDATE`, `DELETE`, `JOIN`) are executed seamlessly.

### Option 2: MySQL / MariaDB Server
If you prefer running a standalone **MySQL Database Server** (via XAMPP, WAMP, MySQL Workbench, Docker, or AWS RDS):

1. Create a MySQL database named `electrohome_db`:
   ```sql
   CREATE DATABASE electrohome_db;
   ```
2. Import `schema.sql` into MySQL:
   ```bash
   mysql -u root -p electrohome_db < schema.sql
   ```
3. Edit the `.env` file in the project folder:
   ```env
   DB_TYPE=mysql
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=electrohome_db
   ```
4. Restart the server:
   ```bash
   node server.js
   ```

---

## 🗂️ Database Schema (`schema.sql`)

### 1. `customers` Table
| Column | Type | Description |
|---|---|---|
| `id` | INTEGER (PK) | Auto-increment Customer ID |
| `name` | VARCHAR(100) | Customer Full Name |
| `email` | VARCHAR(100) | Customer Email Address |
| `phone` | VARCHAR(30) | Customer Phone Number |
| `address` | TEXT | Physical Address |
| `zip_code` | VARCHAR(20) | Service Area ZIP / Postal Code |
| `created_at` | DATETIME | Registration Timestamp |

### 2. `repair_orders` Table
| Column | Type | Description |
|---|---|---|
| `id` | INTEGER (PK) | Auto-increment Order ID |
| `tracking_code` | VARCHAR(50) | Unique Tracking Code (e.g. `HOME-441`, `SHOP-902`) |
| `customer_id` | INTEGER (FK) | References `customers(id)` |
| `device_category` | VARCHAR(100) | e.g. Smart TV, Laptop, Refrigerator |
| `device_name` | VARCHAR(100) | Model / Item details |
| `service_type` | VARCHAR(50) | `home` (Doorstep) or `shop` (Counter) |
| `price_estimate` | DECIMAL(10,2) | Estimated repair price |
| `status` | VARCHAR(50) | `Booked`, `Dispatch`, `Diagnosing`, `Repairing`, `Completed` |
| `assigned_tech` | VARCHAR(100) | Assigned Field or Shop Technician |
| `notes` | TEXT | Technician diagnostic updates |

---

## 🔌 API Endpoints

- `POST /api/bookings` — Create a new customer and repair order record in DB
- `GET /api/orders/:code` — Look up live order status & diagnostic updates by tracking code
- `GET /api/admin/orders` — List all customer repair records in DB
- `PATCH /api/admin/orders/:id` — Update repair status, technician, or notes in DB
- `DELETE /api/admin/orders/:id` — Delete a record from DB
- `GET /api/admin/customers` — Get customer directory with order totals & spending
- `GET /api/admin/stats` — Revenue and active ticket metrics for dashboard
