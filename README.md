# UrbanThreads

College project from Berea Technical College: a Vite and React storefront for a clothing shop, with a Firebase catalogue, cart, checkout, order tracking, an admin area, and a Gemini stylist chat.

## Features

- Home page with editable hero copy, three collection tiles, and the first four products.
- Shop catalogue with category filters taken from the products currently in the database. The Collections nav item opens this same screen.
- Cart drawer. Quantity cannot go above the live stock figure, and checkout stays disabled while any line is over stock. The cart is in memory and disappears on refresh.
- Checkout form for contact, shipping, and card details. Card numbers are only formatted in the browser. Nothing is charged. After a two-second wait the app writes an order and decrements stock. Shipping is a flat R150. The "Includes VAT" line is a label; tax is not calculated.
- Order confirmation, then a tracking page that looks up an order by its `ORD-######` id and shows the status an admin has set. The "3–5 business days" estimate is fixed text.
- Admin area, linked from the footer. It has a client-side password gate, a dashboard (product count, inventory value, pending orders, low stock), product create/edit/delete, order status updates, and editors for the hero and the three collection tiles. Uploaded images are stored as data URLs on the product record.
- Stylist chat widget. It sends the message to Gemini (`gemini-2.5-flash`) with a fixed system prompt. The live catalogue is not included in the request.
- Newsletter field. It only shows a local "joined" message for five seconds. No request is sent.
- Shipping, returns, size guide, and contact in the footer are not wired up.

Prices are shown in South African rand.

## Stack

- React 19 and TypeScript, built with Vite 6
- Tailwind loaded from the CDN in `index.html`. There is no Tailwind build step and no `tailwind.config.js`. The `urban` colours and the Inter / Playfair fonts are set in that file.
- Firebase Realtime Database for products, homepage content, and orders. Analytics starts when the browser supports it.
- Gemini via `@google/genai`
- `lucide-react` for icons

## Setup

Node.js 18, 20, or 22+.

```bash
npm install
cp .env.example .env
```

Fill in `.env` (see below), then:

```bash
npm run dev
```

The dev server listens on port 3000 (`http://localhost:3000`).

```bash
npm run build
npm run preview
```

`build` writes a static bundle to `dist/`. `preview` serves that bundle.

## Environment

Copy `.env.example` to `.env`. Vite only exposes names that start with `VITE_`, and it inlines the values into the client bundle. Do not put a server-only secret in this file.

| Name | Used for |
| --- | --- |
| `VITE_FIREBASE_API_KEY` | Firebase web config |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase web config |
| `VITE_FIREBASE_DATABASE_URL` | Realtime Database URL |
| `VITE_FIREBASE_PROJECT_ID` | Firebase web config |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase web config |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase web config |
| `VITE_FIREBASE_APP_ID` | Firebase web config |
| `VITE_FIREBASE_MEASUREMENT_ID` | Analytics measurement id |
| `VITE_GEMINI_API_KEY` | Stylist chat |
| `VITE_ADMIN_PASSWORD` | Admin gate |

The Firebase web config is still visible in the browser. Who can read and write the database has to be decided in Realtime Database rules, not in this repo. The admin password is checked in the browser, so it is not authentication. An empty `VITE_ADMIN_PASSWORD` does not unlock the admin area.

Without these values the app still builds. Firebase and the stylist fail at runtime until `.env` is filled in.

## Project structure

```
index.html                 Tailwind CDN, theme, fonts, Vite entry
index.tsx                  React mount
App.tsx                    Views, cart, footer
firebase.ts                Firebase init
constants.ts               Seed catalogue and default homepage copy
types.ts
vite.config.ts             Dev server on port 3000
components/                Navbar, hero, product card, cart, checkout,
                           order tracking, admin, stylist chat
services/productService.ts Realtime Database reads and writes
services/geminiService.ts  Stylist session
```

## Design notes

- Navigation is a `View` value in React state. There is no router, so the shop, admin, and tracking screens do not have their own URLs.
- An empty `products` or `siteContent` node is seeded once from `constants.ts`. After that, the database is the source of truth and the constants are not kept in sync.
- Cart lines keep the shopper's quantity, but price, image, and stock are overwritten from the live product list. A missing stock field is treated as zero.
- Checkout reads stock for every line, writes the order, then decrements each line in a transaction. Two checkouts that pass the read before either transaction commits can still oversell.
- Order ids are generated in the browser (`ORD-` plus six digits), not by the database.
- The stylist keeps one Gemini chat session for the life of the page. Product names in its replies come from the system prompt, not from Firebase.
- Shop and Collections render the same catalogue. The collection tiles on the home page open the shop, unfiltered.
