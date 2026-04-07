# ServiceSetu - Full-Stack Documentation

ServiceSetu is a full-stack platform for discovering local providers, creating bookings, handling Razorpay payments, and tracking provider earnings.

## Project Structure

Top-level:
- `backend/` - Node.js + Express + MongoDB API
- `frontend/` - React + Vite + TypeScript client

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 4.4+ (local or Atlas)
- npm

### Installation

```bash
cd backend
npm install
```

For frontend:

```bash
cd ../frontend
npm install
```

### Environment Setup

Create `.env` inside `backend/`:

```env
MONGO_URL=mongodb://localhost:27017/servicetu
PORT=8000
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development

ACCESS_TOKEN_SECRET=your_access_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_secret
REFRESH_TOKEN_EXPIRY=7d

RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxxxxx

PLATFORM_COMMISSION_RATE=0.02
RAZORPAY_FEE_RATE=0.02
RAZORPAY_FIXED_FEE=0
PRICE_ROUND_TO=5
MIN_ROUND_UP_STEPS=1
MAX_MARKUP_RATE=0.12

CLOUDINARY_CLOUD_NAME=xxxx
CLOUDINARY_API_KEY=xxxx
CLOUDINARY_API_SECRET=xxxx
```

### Run

```bash
npm run dev
```

Server base URL: `http://localhost:8000/api/v1`

Health check: `GET /healthCheck`

For frontend development:

```bash
cd ../frontend
npm run dev
```

Frontend default URL is provided by Vite (usually `http://localhost:5173`).

## Frontend Documentation

### Frontend Stack
- React + TypeScript
- Vite
- React Router
- Tailwind CSS
- Lucide icons
- Fetch-based API client with credentialed requests

### Frontend Environment

Optional frontend env:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

If `VITE_API_BASE_URL` is not provided, frontend defaults to:
- `http://localhost:8000/api`

### Frontend Run and Build

From `frontend/`:

```bash
npm run dev
npm run build
npm run preview
```

### Frontend Routes (Current)

Public pages:
- `/`
- `/about`
- `/contact`
- `/login`
- `/signup`

Service and booking pages:
- `/services`
- `/providers`
- `/provider/:id`
- `/booking`
- `/payment`

Protected dashboards:
- `/user/dashboard` (user role)
- `/provider/dashboard` (provider role)

Legacy redirects still mapped:
- `/login-choice`, `/signup-choice`, `/user/login`, `/user/signup`, `/provider/login`, `/provider/signup`

### Frontend API Integration

Frontend API client provides grouped modules:
- `authApi` (login/register/logout/get profile)
- `providerApi` (become provider, list, nearby, bookings, earnings)
- `bookingApi` (create, my bookings, accept/reject/complete)
- `paymentApi` (create order, verify payment)
- `userApi` (dashboard booking list)

Key integration behavior:
- Requests include `credentials: include` for cookie-based auth.
- 401 responses trigger a global unauthorized event.
- Booking page creates payment order and passes order data to payment page.
- Payment page opens Razorpay checkout and verifies payment after success.

### Frontend Auth and Route Guards

- If unauthenticated, dashboard routes redirect to login.
- If role mismatch:
  - user route redirects provider to provider dashboard
  - provider route redirects user to user dashboard

### Frontend Pages Overview

- Home/About/Contact for marketing and discovery
- Services and provider listing/detail for selection flow
- Booking and Payment for transaction flow
- User dashboard for booking history
- Provider dashboard for booking actions and earnings summary

## API Endpoints

### Authentication
- `POST /auth/register` - Register user
- `POST /auth/login` - Login (email or phone)
- `POST /auth/logout` - Logout (auth required)
- `POST /auth/refresh-token` - Refresh access token

### User Profile
- `GET /users/profile` - Get profile
- `PUT /users/profile/update` - Update profile
- `PUT /users/change-password` - Change password

### Provider and Discovery
- `POST /providers/become` - Convert user to provider (auth, role user)
- `GET /providers/nearby` - Nearby providers (public, lat/lon or address)
- `GET /getProviders/provider` - Public provider listing with pagination/filter

### Bookings
User-facing:
- `POST /bookings/create` - Create booking
- `GET /bookings/user-bookings` - User bookings
- `PATCH /bookings/:bookingId/cancel` - Cancel booking
- `PATCH /bookings/:bookingId/confirm-completion` - User confirms completion

Provider-facing:
- `GET /bookings/provider` - Provider bookings
- `GET /bookings/provider/earnings` - Provider earnings summary
- `POST /bookings/:id/accept` - Accept booking
- `POST /bookings/:id/reject` - Reject booking
- `POST /bookings/:id/complete` - Mark completed by provider

Legacy-compatible booking endpoints (still present):
- `GET /bookings/provider-bookings`
- `PATCH /bookings/:bookingId/status`
- `PATCH /bookings/:bookingId/complete`

### Payments
- `POST /payments/create-order` - Create Razorpay order + booking financial snapshot
- `POST /payments/verify` - Verify Razorpay signature
- `PATCH /payments/:bookingId/accept` - User accepts provider completion (generates OTP)
- `PATCH /payments/:bookingId/reject` - User rejects completion
- `PATCH /payments/:bookingId/refund` - Refund payment
- `PATCH /payments/:bookingId/verify-otp` - Provider verifies OTP, releases payment

### Reviews
- `POST /reviews` - Add review
- `GET /reviews/:providerId` - Provider reviews

### Admin
- `PUT /admin/services/price` - Update service type base pricing

## Universal Pricing Policy (All Base Prices)

Pricing is centralized in `backend/src/utils/razorpay.util.js` and used by payment/booking flows.

For any base price:
1. `platformFee = basePrice * PLATFORM_COMMISSION_RATE`
2. `razorpayFee = basePrice * RAZORPAY_FEE_RATE + RAZORPAY_FIXED_FEE`
3. `rawTotal = basePrice + platformFee + razorpayFee`
4. `amountToCharge = round up rawTotal by PRICE_ROUND_TO`
5. If already on boundary, apply at least `MIN_ROUND_UP_STEPS` increment
6. Cap by `MAX_MARKUP_RATE`
7. `providerAmount = basePrice` (guaranteed)

Returned breakdown fields include:
- `basePrice`
- `rawTotal`
- `platformFee`
- `razorpayFee`
- `roundUpMargin`
- `customerTotal` / `amountToCharge`
- `providerPayout` and `providerAmount`
- `platformProjectedEarning`
- `pricingVersion`

Example (`basePrice=500`, defaults):
- `rawTotal=520`
- `amountToCharge=525`
- `providerAmount=500`

## Utilities Used

Located in `backend/src/utils/`:
- `ApiError.js`: typed HTTP/business errors
- `ApiResponse.js`: consistent success responses
- `asyncHandler.js`: wraps async controllers
- `geocode.util.js`: address normalization + Nominatim geocoding candidates
- `razorpay.util.js`: Razorpay client, signature verify, pricing engine
- `multer.util.js`: provider image upload middleware (JPG/PNG/WEBP, size limit)
- `cloudinary.util.js`: upload/delete media in Cloudinary

## Booking and Payment Lifecycle

Typical paid flow:
1. User creates payment order (`/payments/create-order`) which also creates booking with status `awaiting_payment`
2. User completes checkout and backend verifies via `/payments/verify` -> booking becomes `pending`, payment `paid`
3. Provider accepts and completes service
4. User accepts completion -> OTP generated
5. Provider verifies OTP -> booking `completed`, payment `released`

## Data Model Highlights

### Booking financial snapshot fields
- `price`
- `platformFee`
- `providerAmount`
- `razorpayFee`
- `amountToCharge`
- `roundUpMargin`
- `pricingVersion`
- `razorpayOrderId`, `razorpayPaymentId`, `razorpaySignature`

These values are stored at booking/order creation time for reporting integrity.

## Rate Limiting

Configured in `backend/src/app.js`:
- Auth routes: 50 requests / 15 min (skipped in development)
- General routes: 500 requests / 15 min (skipped in development)

## Response Format

Success:
```json
{
  "statusCode": 200,
  "data": {},
  "message": "Success",
  "success": true
}
```

Error:
```json
{
  "statusCode": 400,
  "message": "Error description",
  "success": false
}
```

## Scripts

```bash
npm run dev
npm start
npm test
```

## Notes

- Some booking endpoints are duplicated for compatibility; clients should standardize on newer provider routes.
- `npm test` currently depends on local seed/auth assumptions and may fail if personas/services are missing.
