# ⚡ ElectroHome Django Admin Panel - Backend Management Guide

## 📌 Overview
The Django Admin Panel provides a powerful, full-featured backend administration interface for managing **Customers**, **Repair Orders**, and **Contact Inquiries** for the ElectroHome Repair Shop database (`database.db`).

---

## 🔑 Login Credentials

| Role | Admin URL | Username | Password |
| :--- | :--- | :--- | :--- |
| **Superuser / Manager** | `http://127.0.0.1:8000/admin/` | `afzal` | `afzal@26` |

---

## 🚀 How to Launch the Django Admin Panel

### Option 1: Double-Click Batch File (Recommended)
Double-click `start-django-admin.bat` located in `c:\Desktop\Website`.

### Option 2: Command Line
Run the following command in PowerShell / Terminal:
```bash
python manage.py runserver 8000
```
Then open your browser and navigate to:
👉 **[http://127.0.0.1:8000/admin/](http://127.0.0.1:8000/admin/)**

---

## ✨ Features Included in Django Admin

### 1. 👥 Customers Directory (`CustomerAdmin`)
- **Customer List**: View customer profiles, phone numbers, emails, addresses, total orders, and total spent.
- **Search & Filters**: Search by Name, Phone, Email, or ZIP code.
- **Inline Repair Orders**: Open any Customer profile to view all their associated repair orders directly on the same page.

### 2. 🔧 Repair Orders Management (`RepairOrderAdmin`)
- **Interactive List View**: Displays Tracking ID, Customer Link, Device Category, Device Name, Service Type (🏠 At-Home vs 🏬 In-Shop), Price Estimate, Status, and Technician.
- **Inline Quick Edit (`list_editable`)**: Edit Status and Technician directly from the list without opening individual change forms.
- **Custom Bulk Actions**:
  - Mark selected orders as **Booked**
  - Mark selected orders as **Dispatch**
  - Mark selected orders as **Diagnosing**
  - Mark selected orders as **Repairing**
  - Mark selected orders as **Completed**
  - Mark selected orders as **Cancelled**
- **Detailed Fieldsets**: Organized sections for Order Info, Customer Data, Device Specifications, and Billing/Tech Notes.

### 3. 📩 Contact Inquiries (`ContactInquiryAdmin`)
- Review contact messages from the website.
- Update inquiry status (`New`, `In Progress`, `Resolved`).

### 4. 🌐 REST API Endpoints Included
- `GET /api/health/` — Backend & database status check
- `GET /api/stats/` — Real-time summary metrics
- `POST /api/bookings/` — New customer booking endpoint
- `GET /api/orders/<tracking_code>/` — Order tracking lookup
- `POST /api/contact/` — Send contact inquiry

---

## 📂 File Architecture

- `manage.py` — Django management runner
- `core/` — Django settings, URLs, WSGI
- `repairs/` — Django app (`models.py`, `admin.py`, `views.py`, `urls.py`)
- `templates/admin/` — Customized Django Admin templates (`base_site.html`, `index.html`)
- `create_superuser.py` — Admin superuser creation script
- `start-django-admin.bat` — One-click launcher script
