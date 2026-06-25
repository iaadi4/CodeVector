# CodeVector Engineering Take-Home Task

This repository contains my solution for the CodeVector backend engineering challenge. The goal was to build a fast, paginated backend that serves ~200,000 products while gracefully handling real-time data insertions without missing or duplicating items.

## 🚀 Tech Stack

- **Backend:** Cloudflare Workers, Hono
- **Database:** PostgreSQL (Neon)
- **ORM:** Prisma (with `@prisma/adapter-neon` for serverless environments)
- **Frontend:** React, Vite, Tailwind CSS v4

## 🧠 The Approach & Decisions

### 1. Keyset (Cursor) Pagination over Offset

Traditional `OFFSET` / `LIMIT` pagination gets exponentially slower as you dive deeper into the database pages. Worse, if 50 new products are inserted while a user is on page 1, clicking "Next Page" shifts the dataset, causing the user to see duplicate items or miss things completely.

**Solution:** I implemented **Cursor Based Pagination** using the product's `createdAt` timestamp and `id` as the anchor points.

- This prevents any data shift issues during realtime insertions.
- A compound database index `@@index([category, createdAt(sort: Desc), id(sort: Desc)])` guarantees fast lookups since Postgres can jump straight to the exact row without scanning previous entries.

### 3. Bonus UI implementation

I added a fast, responsive frontend using React + Tailwind CSS to connect to the backend. It cleanly renders the products using the cursor based API under the hood and allows seamless category filtering.

## 🏃 Running Locally

### Backend

1. `cd server`
2. Run `npm install`
3. Setup `.env` with `DATABASE_URL` (Neon Postgres)
4. Seed the 200,000 items: `npm run prisma db seed`
5. Start backend: `npm run dev`

### Frontend

1. `cd client`
2. Run `npm install`
3. Start frontend: `npm run dev`

## 💡 What I'd improve with more time

- **Caching:** Add a Redis layer (or Cloudflare KV/Cache API) for the `/categories` endpoint since that data rarely changes.
- **Testing:** Implement automated unit tests for the cursor logic.
- **Full text Search:** Add a Postgres `tsvector` column or an external service for realtime string search on product names.
