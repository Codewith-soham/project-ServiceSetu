# ServiceSetu

ServiceSetu is a full-stack home-services platform where customers can find providers, place bookings, and track booking progress, while providers can manage requests, completion, earnings, and payout details.

## Current Status



## Recent Cleanup (April 25, 2026)

### Removed Unused Files
- **Backend utilities**: `src/utils/logger.js`, `src/utils/sanitize.js`, `src/utils/validation.js` (dead code)
- **Frontend components**: `src/components/ui/LoadingSpinner.tsx` (unused UI component)
- **Frontend contexts**: `src/context/ThemeContext.tsx` (unused context)
- **Empty folders**: `frontend/src/pages/auth/` directory removed

### Code Quality Improvements
- Streamlined codebase by removing 6 unused files and empty directories
- Enhanced `.gitignore` with comprehensive build output and dependency exclusions
- Preserved all production-ready active code
- All core functionality remains intact and fully operational

## Project Structure


## Prerequisites

- Node.js 18+
- MongoDB 4.4+
- npm

## Setup

### 1) Install dependencies

Backend:

```bash
cd backend
npm install
```

Frontend:

```bash
cd ../frontend
npm install
```

### 2) Configure backend environment

Create `backend/.env`:

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

Optional frontend environment (`frontend/.env`):

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

## Run

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd frontend
npm run dev
```

Default URLs:

- Backend API base: `http://localhost:8000/api/v1`
- Frontend: `http://localhost:5173`

## Tech Stack

Backend:

- Node.js + Express 5
- MongoDB + Mongoose
- JWT auth (access/refresh)
- Socket.IO
- Razorpay SDK
- Cloudinary uploads

Frontend:

- React + TypeScript + Vite
- React Router
- Tailwind CSS
- Socket.IO client

## Auth and Roles

- `user` can browse providers, create/cancel bookings, confirm completion, review provider.
- `provider` can accept/reject bookings, mark completion, manage payouts and earnings.
- Protected APIs use JWT from cookie or `Authorization: Bearer <token>`.

## Realtime Booking Updates

Socket server is initialized in backend and clients connect with credentials.

- Event: `booking_updated`
- Emitted when booking state changes on create/accept/reject/cancel/complete actions.
- User and Provider dashboards subscribe to this event and refetch bookings automatically.

Result: dashboard booking states update without manual page refresh.

## Key API Endpoints

Auth:

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `POST /auth/refresh-token`

User:

- `GET /users/profile`
- `PUT /users/profile/update`
- `PUT /users/change-password`

Provider and discovery:

- `POST /providers/become`
- `GET /providers/nearby`
- `GET /providers/payout-details`
- `PUT /providers/payout-details`
- `GET /getProviders/provider`

Bookings:

- `POST /bookings/create`
- `GET /bookings/user-bookings`
- `PATCH /bookings/:bookingId/cancel`
- `PATCH /bookings/:bookingId/confirm-completion`
- `GET /bookings/provider`
- `GET /bookings/provider/earnings`
- `POST /bookings/:id/accept`
- `POST /bookings/:id/reject`
- `POST /bookings/:id/complete`

Payments (backend available):

- `GET /payments/status`
- `POST /payments/create-order`
- `POST /payments/create-qr`
- `POST /payments/verify`
- `GET /payments/bookings/:bookingId/status`
- `PATCH /payments/:bookingId/accept`
- `PATCH /payments/:bookingId/reject`
- `PATCH /payments/:bookingId/refund`
- `PATCH /payments/:bookingId/verify-otp`

Reviews:

- `POST /reviews`
- `GET /reviews/:providerId`

Admin:

- `PUT /admin/services/price`

## Booking Lifecycle (current)

Primary states used in booking model:

- `awaiting_payment`
- `pending`
- `accepted`
- `service_completed_by_provider`
- `completed`
- `cancelled_by_user`
- `rejected_by_provider`

Common path in active UI:

1. Customer books service.
2. Provider accepts/rejects.
3. Provider marks service complete.
4. Customer confirms completion.
5. Both dashboards receive realtime update.

## Notes

- Frontend `PaymentPage` is intentionally disabled right now.
- Backend payment and payout APIs are still implemented for progressive rollout.
- Some legacy booking endpoints still exist for compatibility.

## Scripts

Backend (`backend/`):

```bash
npm run dev
npm test
```

Frontend (`frontend/`):

```bash
npm run dev
npm run build
npm run preview
```