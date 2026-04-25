# ServiceSetu - Product Requirements and Technical QA Report

Date: 2026-04-21
Prepared by: Senior Developer + QA Review

## 1. Product Overview

ServiceSetu is a home-services marketplace platform that connects customers with local service providers for categories like maid, electrician, plumber, and care-taker.

Business objective observed in code:
- Let customers discover and book nearby providers.
- Let providers manage requests, completion, earnings, and payout settings.
- Support platform monetization via commission and payment fees (backend supports this flow).

Current delivery state:
- Booking and dashboard workflows are operational.
- Realtime booking updates are active.
- Frontend payment experience is intentionally disabled.
- Backend payment APIs remain implemented and callable.

Primary references:
- readme and audit docs: readme.md, AUDIT_REPORT.txt, CONTRACT.md
- backend entry: backend/server.js, backend/src/app.js
- frontend entry and routing: frontend/src/main.tsx, frontend/src/App.tsx

## 2. User Roles and Core Capabilities

### Customer (role: user)
- Signup and login.
- View providers by service type.
- View nearby providers using address/coordinates.
- Create bookings with date, time, notes, and service address.
- Cancel pending or accepted bookings.
- Confirm service completion.
- Submit provider reviews for completed bookings.
- View bookings in dashboard with realtime updates.

References:
- backend/src/controllers/auth.controller.js
- backend/src/controllers/getProvider.controller.js
- backend/src/controllers/publicProviderNearby.js
- backend/src/controllers/booking.controller.js
- backend/src/controllers/user.controller.js
- backend/src/controllers/review.controller.js
- frontend/src/pages/BookingPage.tsx
- frontend/src/pages/user/UserDashboard.tsx

### Provider (role: provider)
- Upgrade from user to provider profile.
- Upload profile image and geocode service address.
- Set and update payout details.
- View provider bookings.
- Accept/reject bookings.
- Mark service completed.
- View earnings breakdown.

References:
- backend/src/controllers/serviceProvider.controller.js
- backend/src/controllers/booking.controller.js
- backend/src/routes/provider.route.js
- backend/src/routes/booking.route.js
- frontend/src/pages/provider/ProviderDashboard.tsx

### Admin (role: admin)
- Update service pricing by service type.

References:
- backend/src/controllers/admin.controller.js
- backend/src/routes/admin.route.js

## 3. Implemented End-to-End Workflows

### A. Authentication and Session
1. Register user.
2. Issue access and refresh tokens.
3. Set cookies and return access token in response payload.
4. Login by email or phone with password.
5. Refresh access token via refresh token endpoint.
6. Logout clears token state.

References:
- backend/src/controllers/auth.controller.js
- backend/src/routes/auth.route.js
- backend/src/middlewares/auth.middleware.js
- frontend/src/context/AuthContext.tsx

### B. Provider Onboarding
1. Authenticated user submits provider form with image.
2. Address is geocoded through Nominatim utility.
3. Provider profile created with location point for geospatial queries.
4. User role is updated to provider in transaction.

References:
- backend/src/controllers/serviceProvider.controller.js
- backend/src/utils/geocode.util.js
- backend/src/utils/cloudinary.util.js
- backend/src/models/serviceProvider.model.js

### C. Provider Discovery
1. Public listing endpoint returns approved and available providers with pagination.
2. Nearby endpoint supports coordinates or address and radius.
3. Price display uses service master price fallback to provider price.

References:
- backend/src/controllers/getProvider.controller.js
- backend/src/controllers/publicProviderNearby.js
- backend/src/routes/getProviders.route.js
- backend/src/routes/provider.route.js
- frontend/src/pages/ProviderListingPage.tsx
- frontend/src/pages/ProviderDetailsPage.tsx

### D. Booking Lifecycle (active user flow)
1. Customer creates booking directly from booking page.
2. Backend validates provider status and prevents same-slot collision.
3. Booking status is set to pending in this path.
4. Provider accepts or rejects.
5. Provider marks service completed.
6. Customer confirms completion.
7. Both dashboards update through booking_updated socket events.

References:
- backend/src/controllers/booking.controller.js
- backend/src/controllers/user.controller.js
- backend/src/socket/socket.js
- backend/src/socket/notification.js
- frontend/src/pages/BookingPage.tsx
- frontend/src/pages/user/UserDashboard.tsx
- frontend/src/pages/provider/ProviderDashboard.tsx
- frontend/src/services/socketClient.ts

### E. Payment and Settlement (implemented backend capability)
1. Create payment order or UPI QR.
2. Verify payment signature and mark booking paid.
3. Fetch payment status from gateway.
4. Completion OTP generation for release flow.
5. Provider verifies OTP and booking becomes completed and released.
6. Refund endpoint available before final completion.

Important product state:
- Frontend Payment page is disabled and tells users booking proceeds without in-app payment.

References:
- backend/src/controllers/payment.controller.js
- backend/src/routes/payment.route.js
- backend/src/utils/razorpay.util.js
- frontend/src/pages/PaymentPage.tsx

### F. Reviews
1. Customer can post one review per completed booking.
2. Provider rating and review count are recalculated on review submit.

References:
- backend/src/controllers/review.controller.js
- backend/src/models/review.model.js
- backend/src/routes/review.route.js

## 4. Architecture Summary

### Backend architecture
- Node.js + Express modular structure.
- Route-controller-model separation.
- JWT authentication middleware with role guard.
- MongoDB with Mongoose schemas.
- Socket.IO with user-room broadcast model.
- Utility modules for geocoding, cloud upload, payment calculations.

References:
- backend/server.js
- backend/src/app.js
- backend/src/routes
- backend/src/controllers
- backend/src/models
- backend/src/socket
- backend/src/utils

### Frontend architecture
- React SPA with route guards.
- Context-based auth state bootstrap.
- Shared API client wrapper around fetch.
- Socket client for realtime booking refresh.
- Page-driven structure for auth, listing, booking, dashboards.

References:
- frontend/src/main.tsx
- frontend/src/App.tsx
- frontend/src/context/AuthContext.tsx
- frontend/src/services/apiClient.js
- frontend/src/services/socketClient.ts
- frontend/src/pages

## 5. API Surface in Project

Auth:
- POST /api/v1/auth/register
- POST /api/v1/auth/login
- POST /api/v1/auth/logout
- POST /api/v1/auth/refresh-token

User:
- GET /api/v1/users/profile
- PUT /api/v1/users/profile/update
- PUT /api/v1/users/change-password

Provider and discovery:
- POST /api/v1/providers/become
- GET /api/v1/providers/nearby
- GET /api/v1/providers/payout-details
- PUT /api/v1/providers/payout-details
- GET /api/v1/getProviders/provider

Bookings:
- POST /api/v1/bookings/create
- GET /api/v1/bookings/user-bookings
- PATCH /api/v1/bookings/:bookingId/cancel
- PATCH /api/v1/bookings/:bookingId/confirm-completion
- GET /api/v1/bookings/provider
- GET /api/v1/bookings/provider/earnings
- POST /api/v1/bookings/:id/accept
- POST /api/v1/bookings/:id/reject
- POST /api/v1/bookings/:id/complete
- PATCH /api/v1/bookings/:bookingId/status
- PATCH /api/v1/bookings/:bookingId/complete

Payments:
- GET /api/v1/payments/status
- POST /api/v1/payments/create-order
- POST /api/v1/payments/create-qr
- POST /api/v1/payments/verify
- GET /api/v1/payments/bookings/:bookingId/status
- PATCH /api/v1/payments/:bookingId/accept
- PATCH /api/v1/payments/:bookingId/verify-otp
- PATCH /api/v1/payments/:bookingId/refund
- PATCH /api/v1/payments/:bookingId/reject

Reviews:
- POST /api/v1/reviews
- GET /api/v1/reviews/:providerId

Admin:
- PUT /api/v1/admin/services/price

References:
- backend/src/app.js
- backend/src/routes

## 6. Data Model Summary

### User
- Identity, auth, role, contact, address, refresh token.

Reference:
- backend/src/models/user.model.js

### ServiceProvider
- Linked user, service type, approval/availability flags, pricing, payout details, image, geolocation.

Reference:
- backend/src/models/serviceProvider.model.js

### Service
- Service type and admin-updatable price catalog.

Reference:
- backend/src/models/service.model.js

### Booking
- User-provider link, schedule, pricing and fee breakdown, payment and payout metadata, OTP fields, lifecycle status.

Reference:
- backend/src/models/booking.model.js

### Review
- User/provider/booking relation, rating, comment, unique review per user-booking.

Reference:
- backend/src/models/review.model.js

## 7. Technology Stack

### Backend
- Runtime: Node.js
- Framework: Express 5
- Database: MongoDB via Mongoose
- Auth: JWT + cookie-parser
- Realtime: Socket.IO
- Payments: Razorpay SDK
- Uploads: Multer + Cloudinary
- Geocoding: Axios against Nominatim

### Frontend
- Runtime: React 18
- Build tool: Vite
- Language: TypeScript + JavaScript mixed codebase
- Routing: react-router
- Styling: Tailwind CSS + custom CSS
- Icons/UI helpers: lucide-react, clsx, tailwind-merge
- Realtime: socket.io-client

## 8. Libraries Used

### Backend package dependencies (declared)
- axios
- bcrypt
- bcryptjs
- cloudinary
- cookie-parser
- cors
- dotenv
- express
- express-rate-limit
- jsonwebtoken
- mongoose
- multer
- nodemon
- prettier
- razorpay
- socket.io

Reference:
- backend/package.json

### Backend libraries observed in imports (actively used in source)
- axios
- bcryptjs
- cloudinary
- cookie-parser
- cors
- express
- express-rate-limit
- jsonwebtoken
- mongoose
- multer
- razorpay
- socket.io
- dotenv

References:
- backend/src
- backend/server.js

### Frontend package dependencies (declared)
- Large dependency set including MUI, Radix UI suite, motion, charting, dnd, form packages, and many utility libs.

Reference:
- frontend/package.json

### Frontend libraries observed in imports (actively used in source)
- react
- react-dom
- react-router
- socket.io-client
- lucide-react
- clsx
- tailwind-merge

References:
- frontend/src

### Dependency optimization note
Observed frontend imports use a much smaller subset than declared dependencies. This likely means dependency bloat and maintainability/build-size overhead.

## 9. Environment and Integrations

Expected backend environment variables include:
- MONGO_URL, PORT, CORS_ORIGIN, NODE_ENV
- ACCESS_TOKEN_SECRET, ACCESS_TOKEN_EXPIRY
- REFRESH_TOKEN_SECRET, REFRESH_TOKEN_EXPIRY
- RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET
- PLATFORM_COMMISSION_RATE, RAZORPAY_FEE_RATE, RAZORPAY_FIXED_FEE
- PRICE_ROUND_TO, MIN_ROUND_UP_STEPS, MAX_MARKUP_RATE
- CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET

References:
- readme.md
- backend/src/utils/razorpay.util.js
- backend/src/utils/geocode.util.js

## 10. QA Assessment: Strengths, Gaps, and Risks

## Strengths
- Clear modular backend structure.
- Booking lifecycle and role guards implemented.
- Realtime booking updates integrated end-to-end.
- Provider onboarding includes geospatial indexing and media upload.
- Payment backend has robust order/QR/status/verify endpoints.

## Functional gaps and alignment issues
1. Payment product mismatch
- Frontend disables payment while backend payment stack is live.
- Product and contract can drift if this mode is not explicitly governed.

References:
- frontend/src/pages/PaymentPage.tsx
- backend/src/controllers/payment.controller.js

2. Duplicate and overlapping booking routes
- Multiple accept/reject/complete style paths and both POST/PATCH patterns coexist.
- Raises integration and maintenance risk.

Reference:
- backend/src/routes/booking.route.js

3. OTP completion flow split across two paradigms
- booking confirm-completion path allows completion without OTP.
- payment verify-otp path enforces OTP and payout detail checks.
- Business logic split can lead to inconsistent completion semantics.

References:
- backend/src/controllers/user.controller.js
- backend/src/controllers/payment.controller.js

4. Payment verification ownership check not enforced
- verify payment endpoint resolves booking by order id and does not verify current user ownership before update.

Reference:
- backend/src/controllers/payment.controller.js

5. Sensitive OTP returned in API response
- Accept-completion endpoint returns OTP payload with a remove-in-production note.

Reference:
- backend/src/controllers/payment.controller.js

6. Provider location rendering issue in listing UI
- Nearby endpoint returns location object; listing page prints provider.location directly.
- This can render as object text and degrade UX.

References:
- backend/src/controllers/publicProviderNearby.js
- frontend/src/pages/ProviderListingPage.tsx

7. Signup/provider onboarding and automated test mismatch
- Provider onboarding endpoint requires multipart image upload.
- test.js provider upgrade currently sends JSON body without image.

References:
- backend/src/controllers/serviceProvider.controller.js
- backend/test.js

8. Auth refresh consistency issue
- register sets access and refresh cookies.
- login sets access cookie only while still storing refresh token in DB.
- this can break refresh-token flow assumptions for clients depending on cookie presence.

Reference:
- backend/src/controllers/auth.controller.js

## 11. Testing Status

Current automated testing is a custom script runner:
- backend/test.js performs API smoke/integration style checks.
- Uses fetch and status validation but no standard test framework.
- Relies on runtime services and environment setup.

Quality implications:
- No unit test suites observed.
- No frontend test suites observed.
- No CI-focused deterministic test configuration observed.
- Some scripted expectations are stale versus current provider onboarding contract.

References:
- backend/test.js
- backend/package.json
- frontend/package.json

## 12. Suggested PRD Structure Filled from Current Build

Use this as the formal PRD template for your team.

1. Vision and Problem Statement
- Build a trusted local home-services network with transparent bookings and provider accountability.

2. Target Users
- Customers needing household services.
- Individual service professionals seeking work and payouts.
- Internal admins managing service pricing.

3. Product Scope (MVP delivered)
- Auth, role-based access, provider discovery, booking workflow, provider dashboard, user dashboard, reviews, realtime booking updates.

4. In-Scope Platform Capabilities (already in backend)
- Razorpay order and QR payment flows.
- Payment verification and status sync.
- OTP-based completion and release logic.

5. Out-of-Scope or Temporarily Disabled (current frontend)
- In-app payment checkout UX (currently intentionally disabled).

6. Functional Requirements (high-level)
- FR-1: User can register and authenticate.
- FR-2: Provider can onboard and become discoverable.
- FR-3: User can discover nearby providers and place bookings.
- FR-4: Provider can process booking requests.
- FR-5: Booking status must sync in realtime to both parties.
- FR-6: User can review completed bookings.
- FR-7: Admin can update service-type prices.

7. Non-Functional Requirements
- Security: JWT validation and role checks on protected endpoints.
- Performance: pagination on list APIs.
- Reliability: polling fallback when socket handshake fails.
- Observability: currently log-based, no full metrics stack observed.

8. Open Product Decisions
- Payment mode strategy: disable backend as well, or re-enable frontend checkout.
- Canonical booking endpoint set and deprecation timeline.
- Single completion model: choose OTP-only or non-OTP path.

9. Release Readiness Gates
- Fix payment ownership and OTP exposure risks.
- Align test harness to current API contracts.
- Add standardized automated tests and CI pipeline checks.
- Remove or justify unused frontend dependencies.

## 13. Recommended Next Actions

1. Decide and document payment mode immediately (disabled vs fully enabled).
2. Consolidate booking routes and remove duplicates.
3. Enforce booking ownership in payment verification.
4. Stop returning OTP in API responses for production behavior.
5. Update provider listing UI to display human-readable location text.
6. Repair backend test script for multipart provider onboarding.
7. Add test framework and CI for backend and frontend.
8. Audit and trim frontend dependency list to actual usage.
