# 🛍️ StoreMate

> E-commerce Platform สำหรับการซื้อสินค้าออนไลน์และการจัดการร้านค้า

StoreMate คือระบบ E-commerce ที่พัฒนาขึ้นเพื่อรองรับทั้ง **ผู้ซื้อสินค้า** และ **ผู้ดูแลร้านค้า**
โดยผู้ใช้สามารถค้นหาและเลือกซื้อสินค้า จัดการตะกร้าสินค้า ที่อยู่ การชำระเงิน และติดตามคำสั่งซื้อได้

ในส่วนของผู้ดูแลร้านค้า สามารถจัดการสินค้า Stock คำสั่งซื้อ ข้อมูลผู้ใช้งาน
ดู Dashboard และรายงานยอดขาย รวมถึงจัดการโปรโมชั่นและการแจ้งเตือนต่าง ๆ

🌐 **เว็บไซต์:** https://storemate-final.vercel.app

---

## 📑 สารบัญ

- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Project Architecture](#️-project-architecture)
- [🚀 วิธีรันแอป (Quick Start)](#-วิธีรันแอป-quick-start)
- [⚙️ ตั้งค่า Environment Variables](#️-ตั้งค่า-environment-variables)
- [📜 คำสั่งที่ใช้บ่อย](#-คำสั่งที่ใช้บ่อย)
- [🏗️ Build สำหรับ Production](#️-build-สำหรับ-production)
- [🐳 รันด้วย Docker](#-รันด้วย-docker)
- [🧪 การทดสอบ](#-การทดสอบ)
- [🛠️ แก้ปัญหาที่พบบ่อย](#️-แก้ปัญหาที่พบบ่อย)

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

| Technology | Purpose |
|---|---|
| React 19 | Frontend Framework |
| TypeScript | Type-safe Development |
| Vite (rolldown-vite) | Development & Build Tool |
| React Router | Routing |
| Redux Toolkit | State Management |
| Axios | API Communication |
| Tailwind CSS + DaisyUI | Styling |
| Material UI | UI Components |
| Formik + Yup | Form Management & Validation |
| React Hot Toast | Notifications |
| Recharts | Data Visualization |
| Leaflet / React Leaflet | Map & Location |
| Stripe | Payment Integration |
| STOMP + SockJS | Real-time Notification / Payment Status |
| Vitest | Testing |

---

## 🏗️ Project Architecture

```text
src/
├── assets/          # Images and static assets
├── components/      # Reusable UI Components
├── hooks/           # Custom React Hooks (เช่น WebSocket แจ้งเตือน / สถานะชำระเงิน)
├── layouts/         # Application Layouts (MainLayout, AdminLayout)
├── pages/           # Application Pages
├── redux/           # Redux Store, Slices and Thunks
├── router/          # Application Routing + Route Guards
├── services/        # API Services (axios)
├── tests/           # Test Files
├── types/           # TypeScript Types
├── utils/           # Utility Functions
├── App.tsx
└── main.tsx
```

---

## 🚀 วิธีรันแอป (Quick Start)

### 1. สิ่งที่ต้องติดตั้งก่อน

| โปรแกรม | เวอร์ชัน | ตรวจสอบด้วย |
|---|---|---|
| [Node.js](https://nodejs.org/) | 20 ขึ้นไป (แนะนำ 22 LTS) | `node -v` |
| npm | มาพร้อม Node.js | `npm -v` |
| Git | ล่าสุด | `git --version` |
| Backend [store-mate-api](https://github.com/JeyZ9/store-mate-api) | — | ไม่จำเป็น ถ้าจะชี้ไปที่ API ที่ deploy แล้ว |

### 2. Clone โปรเจกต์

```bash
git clone https://github.com/nabnoey/storemate.git
cd storemate
```

### 3. ติดตั้ง dependencies

```bash
npm install
```

> โปรเจกต์ใช้ `rolldown-vite` (กำหนดใน `overrides` ของ `package.json`) ให้ติดตั้งด้วย `npm` เท่านั้น เพื่อให้ได้เวอร์ชันตาม `package-lock.json`

### 4. สร้างไฟล์ `.env`

สร้างไฟล์ `.env` ที่ root ของโปรเจกต์ (ระดับเดียวกับ `package.json`) แล้วใส่ค่าตามหัวข้อ [ตั้งค่า Environment Variables](#️-ตั้งค่า-environment-variables)

ถ้ายังไม่ได้รัน Backend ในเครื่อง ให้ใช้ชุด "ใช้ API ที่ deploy แล้ว" ได้ทันที

### 5. รัน Backend (ถ้าใช้ API ในเครื่อง)

ดูวิธีรันใน README ของ [store-mate-api](https://github.com/JeyZ9/store-mate-api)
ค่าเริ่มต้น Backend จะรันที่ `http://localhost:8080`

### 6. รัน Frontend

```bash
npm run dev
```

เปิดเบราว์เซอร์ที่ **http://localhost:5173**

### 7. ลองใช้งาน

1. กด **สมัครสมาชิก** สร้างบัญชีลูกค้าใหม่ แล้ว **เข้าสู่ระบบ**
2. เลือกสินค้าจากหน้าแรก → **เพิ่มลงรถเข็น** → **สั่งซื้อสินค้า**
3. ถ้าเข้าสู่ระบบด้วยบัญชี `OWNER` / `MODERATOR` ระบบจะพาไปหน้า `/dashboard` สำหรับจัดการร้าน

> แก้ไฟล์ `.env` แล้วต้อง **หยุด (Ctrl + C) และรัน `npm run dev` ใหม่** ค่าใหม่ถึงจะมีผล

---

## ⚙️ ตั้งค่า Environment Variables

Vite อ่านเฉพาะตัวแปรที่ขึ้นต้นด้วย `VITE_` จากไฟล์ `.env` ที่ root ของโปรเจกต์ (ไฟล์ `.env` อยู่ใน `.gitignore` แล้ว ห้าม commit)

### ใช้ Backend ในเครื่อง

```env
# URL ของ Backend (ต้องลงท้ายด้วย /api/v1/)
VITE_BASE_URL=http://localhost:8080/api/v1/
# WebSocket (SockJS) สำหรับการแจ้งเตือนและสถานะชำระเงินแบบ real-time
VITE_SOCKET_URL=http://localhost:8080/ws

# path ย่อยของแต่ละกลุ่ม API (ต่อท้าย VITE_BASE_URL)
VITE_AUTH_API=auth
VITE_PRODUCT_API=products
VITE_REVIEW_API=reviews
VITE_CART_API=cart
VITE_ORDER_API=orders
VITE_PAYMENT_API=payments
VITE_PAYMENT_REFUND=payment/refund-request
VITE_USERS_API=users/me
VITE_MOD_API=moderator
VITE_OWNER_API=owner

# Stripe (ใช้ Publishable key โหมดทดสอบ pk_test_... เท่านั้น)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxx

# Google Analytics (ไม่บังคับ)
VITE_GA_MEASUREMENT_ID=
```

### ใช้ API ที่ deploy แล้ว

เปลี่ยนเฉพาะ 2 บรรทัดแรก ที่เหลือใช้ค่าเดิม

```env
VITE_BASE_URL=https://api.store-mate-api.me/api/v1/
VITE_SOCKET_URL=https://api.store-mate-api.me/ws
```

### รายละเอียดตัวแปร

| ตัวแปร | ใช้ทำอะไร | ตัวอย่าง |
|---|---|---|
| `VITE_BASE_URL` | Base URL ของทุก API (`src/services/api.ts`) **จำเป็น** | `http://localhost:8080/api/v1/` |
| `VITE_SOCKET_URL` | WebSocket แจ้งเตือน / ผลการชำระเงิน | `http://localhost:8080/ws` |
| `VITE_AUTH_API` | สมัคร / เข้าสู่ระบบ / ลืมรหัสผ่าน | `auth` |
| `VITE_PRODUCT_API` | สินค้า / ค้นหา | `products` |
| `VITE_REVIEW_API` | รีวิวสินค้า | `reviews` |
| `VITE_CART_API` | รถเข็น | `cart` |
| `VITE_ORDER_API` | คำสั่งซื้อของลูกค้า | `orders` |
| `VITE_PAYMENT_API` | สร้างการชำระเงิน (ต่อท้าย `VITE_ORDER_API` เช่น `orders/payments/intent`) | `payments` |
| `VITE_PAYMENT_REFUND` | อนุมัติ / ปฏิเสธคำขอคืนเงิน | `payment/refund-request` |
| `VITE_USERS_API` | โปรไฟล์และที่อยู่ของผู้ใช้ | `users/me` |
| `VITE_MOD_API` | งานพนักงาน (คำสั่งซื้อ สินค้า ใบปะหน้า) | `moderator` |
| `VITE_OWNER_API` | งานเจ้าของร้าน (ผู้ใช้ ร้านค้า แจ้งเตือน แดชบอร์ด) | `owner` |
| `VITE_STRIPE_PUBLISHABLE_KEY` | หน้าชำระเงินด้วยบัตรและ PromptPay | `pk_test_...` |
| `VITE_GA_MEASUREMENT_ID` | Google Analytics (ไม่บังคับ) | `G-XXXXXXX` |

> ⚠️ ค่า `VITE_*` ถูก **ฝังลงในไฟล์ JavaScript ตอน build** ทุกคนที่เปิดเว็บมองเห็นได้ ห้ามใส่ secret (เช่น Stripe secret key `sk_...`) และเปลี่ยนค่าแล้วต้อง build ใหม่

---

## 📜 คำสั่งที่ใช้บ่อย

| คำสั่ง | ทำอะไร |
|---|---|
| `npm run dev` | รันโหมดพัฒนาที่ http://localhost:5173 (แก้โค้ดแล้วหน้าเว็บรีเฟรชเอง) |
| `npm run dev -- --host` | เปิดให้เครื่องอื่นในวง LAN / มือถือเข้าได้ |
| `npm run dev -- --port 3000` | เปลี่ยนพอร์ต |
| `npm run build` | ตรวจ TypeScript แล้ว build ไฟล์ production ลงโฟลเดอร์ `dist/` |
| `npm run preview` | เปิดดูไฟล์ที่ build แล้วที่ http://localhost:4173 |
| `npm run lint` | ตรวจรูปแบบโค้ดด้วย ESLint |
| `npm test` | รัน unit test ด้วย Vitest |

---

## 🏗️ Build สำหรับ Production

```bash
npm run build
npm run preview
```

- ไฟล์ที่ได้อยู่ใน `dist/` นำไปวางบน static hosting ใดก็ได้
- เป็น Single Page App ต้องตั้งให้ทุก path ส่งกลับ `index.html` (ไฟล์ `vercel.json` ตั้งไว้แล้วสำหรับ Vercel)
- Deploy จริงอยู่บน **Vercel**: push ไป branch ที่ผูกไว้ แล้วตั้ง Environment Variables ใน Project Settings ของ Vercel

---

## 🐳 รันด้วย Docker

Dockerfile build ด้วย Node 22 แล้วเสิร์ฟด้วย Nginx

```bash
# ต้องมีไฟล์ .env ก่อน เพราะค่า VITE_* ถูกฝังตอน build
docker build -t storemate-frontend .
docker run -d -p 5173:80 --name storemate-frontend storemate-frontend
```

หรือใช้ Docker Compose

```bash
docker compose up -d --build
```

เปิด **http://localhost:5173**

> ตัวแปรใน `environment:` ของ `docker-compose.yml` ไม่มีผลกับไฟล์ที่ build แล้ว ให้แก้ค่าในไฟล์ `.env` แล้ว build ใหม่

---

## 🧪 การทดสอบ

| ประเภท | ที่อยู่ | วิธีรัน |
|---|---|---|
| Unit test | `src/tests/` ในโปรเจกต์นี้ | `npm test` |
| E2E (Playwright) | repo [playwright-storemate](https://github.com/BoonruksaBL036/playwright-storemate) | ดู README ของ repo นั้น |

---

## 🛠️ แก้ปัญหาที่พบบ่อย

| อาการ | สาเหตุ / วิธีแก้ |
|---|---|
| `npm run dev` แล้วขึ้น `vite: not found` | ยังไม่ได้ `npm install` |
| หน้าเว็บขึ้นแต่ไม่มีสินค้า / เรียก API ไปที่ `undefined/...` | ยังไม่ได้สร้าง `.env` หรือไม่ได้ตั้ง `VITE_BASE_URL` แล้วต้องรัน `npm run dev` ใหม่ |
| ขึ้น Network Error / CORS error | Backend ไม่ได้รัน หรือ Backend ไม่อนุญาต origin `http://localhost:5173` |
| เรียก API ได้แต่ได้ 404 | `VITE_BASE_URL` ไม่ได้ลงท้ายด้วย `/api/v1/` หรือ path ย่อย (`VITE_*_API`) ไม่ตรงตารางด้านบน |
| หน้าชำระเงินด้วยบัตร / QR ไม่ขึ้น | ยังไม่ได้ตั้ง `VITE_STRIPE_PUBLISHABLE_KEY` |
| การแจ้งเตือนไม่เด้งแบบ real-time | `VITE_SOCKET_URL` ไม่ถูกต้อง หรือ Backend ไม่ได้เปิด `/ws` |
| พอร์ต 5173 ถูกใช้อยู่ | `npm run dev -- --port 3000` |
| รีเฟรชหน้าอื่นที่ไม่ใช่หน้าแรกแล้วขึ้น 404 (ตอน deploy) | ตั้ง hosting ให้ทุก path ส่งกลับ `index.html` |
