# RailConnect — Real-Time Train Ticket Booking Platform

RailConnect is a production-minded full-stack railway discovery and ticket-booking platform. It offers high-speed route search with stop sequence validation, midnight cross-day duration calculation, live seat availability tracking with explicit transparency labels (`LIVE`, `CACHED`, `DEMO`), multi-passenger booking workflows, an idempotent sandbox payment gateway, downloadable/printable e-tickets with QR/barcodes, and an operations admin console.

---

## 1. Technology Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, React Router DOM, Lucide Icons
- **Backend:** Node.js, Express.js, TypeScript, REST APIs, Session/JWT Auth with cookie rotation, rate limiting
- **Data Architecture:** Prisma ORM schema (`prisma/schema.prisma`), relational models (`User`, `Station`, `Train`, `TrainStop`, `TrainClass`, `FareQuote`, `AvailabilitySnapshot`, `Booking`, `Passenger`, `Payment`, `AuditLog`) with ACID in-memory transactional database store
- **Payment Gateway:** `PaymentProvider` interface with HMAC SHA-256 webhook signature verification and idempotent checkout
- **Railway Data Provider:** `RailwayProvider` architecture with `DemoRailwayProvider` and enterprise `AuthorizedRailwayProvider` skeleton

---

## 2. Quick Start & Local Commands

### Prerequisites
- Node.js >= 18.x
- npm >= 9.x
- (Optional) Docker & Docker Compose for external PostgreSQL

### Running the Application

#### macOS / Linux
```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables
cp .env.example .env

# 3. Start development server (Frontend + Backend on Port 3000)
npm run dev

# 4. Run automated test suites
npx tsx tests/train-search.test.ts
npx tsx tests/payment-webhook.test.ts
npx tsx tests/cancellation.test.ts

# 5. Production build
npm run build
npm start
```

#### Windows (Command Prompt)
```cmd
:: 1. Install dependencies
npm install

:: 2. Copy environment file
copy .env.example .env

:: 3. Start development server
npm run dev

:: 4. Run automated test suites
npx tsx tests/train-search.test.ts
npx tsx tests/payment-webhook.test.ts
npx tsx tests/cancellation.test.ts

:: 5. Production build
npm run build
npm start
```

---

## 3. Demo Credentials

For quick evaluation, RailConnect includes 1-click login buttons on `/login` and the following pre-seeded credentials:

| Role | Email | Password |
|---|---|---|
| **Demo Passenger** | `passenger@railconnect.com` | `Passenger123!` |
| **Operations Admin** | `admin@railconnect.com` | `AdminSecret2026!` |

---

## 4. Docker Compose Setup (PostgreSQL + Redis)

To run standalone PostgreSQL and Redis instances for production environments:

```bash
# Start PostgreSQL (port 5432) and Redis (port 6379)
docker-compose up -d

# Run Prisma migrations and seed
npx prisma migrate dev --name init
npx tsx prisma/seed.ts
```

---

## 5. REST API Documentation & Sample Payloads

### Search Trains
**`GET /api/trains/search?from=NDLS&to=MMCT&date=2026-11-10&passengers=1&class=ALL`**

**Response:**
```json
{
  "success": true,
  "meta": {
    "from": "NDLS",
    "to": "MMCT",
    "date": "2026-11-10",
    "passengers": 1,
    "classCode": "ALL",
    "resultCount": 2,
    "sourceMode": "DEMO",
    "providerNotice": "DEMO — not live railway data.",
    "timestamp": "2026-10-30T05:00:00.000Z"
  },
  "trains": [
    {
      "trainId": "trn_12952",
      "trainNumber": "12952",
      "name": "Mumbai Tejas Rajdhani Express",
      "trainType": "Rajdhani",
      "departureTime": "16:55",
      "arrivalTime": "08:35",
      "durationMinutes": 940,
      "durationFormatted": "15h 40m",
      "dayOffset": 1,
      "intermediateStopsCount": 2,
      "classes": [
        {
          "code": "3A",
          "label": "AC 3 Tier",
          "fare": 2302.5,
          "availability": {
            "status": "AVAILABLE",
            "count": 42,
            "sourceMode": "DEMO"
          }
        }
      ]
    }
  ]
}
```

### Create Booking
**`POST /api/bookings`**
```json
{
  "trainId": "trn_12952",
  "trainNumber": "12952",
  "trainName": "Mumbai Tejas Rajdhani Express",
  "sourceStationCode": "NDLS",
  "sourceStationName": "New Delhi Railway Station",
  "destStationCode": "MMCT",
  "destStationName": "Mumbai Central",
  "departureTime": "16:55",
  "arrivalTime": "08:35",
  "journeyDate": "2026-11-10",
  "classCode": "3A",
  "className": "AC 3 Tier",
  "passengers": [
    {
      "name": "Rahul Verma",
      "age": 32,
      "gender": "Male",
      "berthPreference": "Lower"
    }
  ],
  "idempotencyKey": "idemp_user01_req_8921"
}
```

**Response:**
```json
{
  "success": true,
  "booking": {
    "id": "bkg_173000000",
    "publicReference": "RC-BKG-849201",
    "status": "PENDING_PAYMENT",
    "totalAmount": 2302.5,
    "providerPnr": null
  }
}
```

---

## 6. Real-Launch Checklist & Commercial Prerequisites

1. **Railway Provider Integration:**
   - Real railway seat inventory and reservation requires a commercial agreement with the official railway authority (IRCTC/CRIS).
   - In accordance with compliance, `providerPnr` remains `null` and data is labeled `DEMO` until official credentials and mTLS certificates are provisioned.
2. **Payment Gateway Integration:**
   - Replace `SandboxPaymentProvider` with `StripePaymentProvider` or `RazorpayPaymentProvider` by supplying live API keys and production webhook secrets.
3. **PCI-DSS Compliance:**
   - Real payment card details are never processed or stored on RailConnect servers; cardholder data must remain entirely within hosted payment fields (Stripe Elements / Razorpay Checkout).
