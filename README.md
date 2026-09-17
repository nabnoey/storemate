# 🛍️ StoreMate

> E-commerce Platform สำหรับการซื้อสินค้าออนไลน์และการจัดการร้านค้า

StoreMate คือระบบ E-commerce ที่พัฒนาขึ้นเพื่อรองรับทั้ง **ผู้ซื้อสินค้า** และ **ผู้ดูแลร้านค้า** 
โดยผู้ใช้สามารถค้นหาและเลือกซื้อสินค้า จัดการตะกร้าสินค้า ที่อยู่ การชำระเงิน และติดตามคำสั่งซื้อได้

ในส่วนของผู้ดูแลร้านค้า สามารถจัดการสินค้า Stock คำสั่งซื้อ ข้อมูลผู้ใช้งาน 
ดู Dashboard และรายงานยอดขาย รวมถึงจัดการโปรโมชั่นและการแจ้งเตือนต่าง ๆ

---

## ✨ Features

### 👤 Customer

- 🔐 สมัครสมาชิก / เข้าสู่ระบบ
- 🔑 ระบบ Authentication และ Authorization
- 🛍️ ดูรายการสินค้า
- 🔎 ค้นหาและกรองสินค้า
- 📦 ดูรายละเอียดสินค้า
- 🛒 เพิ่มสินค้าในตะกร้า
- ➕➖ เพิ่ม / ลดจำนวนสินค้า
- ☑️ เลือกสินค้าที่ต้องการสั่งซื้อ
- 📍 จัดการที่อยู่จัดส่ง
- 💳 รองรับการชำระเงิน
  - QR PromptPay
  - Credit / Debit Card
  - Cash on Delivery
- 📋 ดูประวัติคำสั่งซื้อ
- 🚚 ติดตามสถานะคำสั่งซื้อ
- ⭐ รีวิวสินค้า
- 🔔 รับการแจ้งเตือน
- ❤️ จัดการสินค้าที่สนใจ

### 🏪 Store / Admin

- 📊 Dashboard
- 📈 ดูรายงานยอดขาย
- 📦 จัดการสินค้า
- 🏷️ จัดการ Stock
- 🛒 จัดการคำสั่งซื้อ
- 👥 จัดการผู้ใช้งาน
- 🏪 จัดการข้อมูลร้านค้า
- 🔔 จัดการการแจ้งเตือน
- 🎁 จัดการโปรโมชั่น

---

## 🛠️ Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| React | Frontend Framework |
| TypeScript | Type-safe Development |
| Vite | Development & Build Tool |
| React Router | Routing |
| Redux Toolkit | State Management |
| Axios | API Communication |
| Tailwind CSS | Styling |
| DaisyUI | UI Components |
| Material UI | UI Components |
| Formik | Form Management |
| Yup | Form Validation |
| React Hot Toast | Notifications |
| Recharts | Data Visualization |
| Leaflet / React Leaflet | Map & Location |
| Stripe | Payment Integration |
| Vitest | Testing |

---

## 🏗️ Project Architecture

StoreMate ใช้โครงสร้างแบบแยกส่วน เพื่อให้สามารถพัฒนาและดูแลระบบได้ง่าย

```text
src/
├── assets/          # Images and static assets
├── components/      # Reusable UI Components
├── hooks/           # Custom React Hooks
├── layouts/         # Application Layouts
├── pages/           # Application Pages
├── redux/           # Redux Store, Slices and Thunks
├── router/          # Application Routing
├── services/        # API Services
├── tests/           # Test Files
├── types/           # TypeScript Types
├── utils/            # Utility Functions
├── App.tsx
└── main.tsx

