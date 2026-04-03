# ServiceSetu - Backend Documentation

A Node.js/Express REST API for discovering and booking local service providers (maids, electricians, plumbers, caretakers) with real-time location-based search.

## Quick Start

### Prerequisites
- Node.js 16+
- MongoDB 4.4+ (local or Atlas)
- npm or yarn

### Installation

```bash
cd backend
npm install
```

### Environment Setup

Create a `.env` file in the `backend/` directory:

```env
MONGO_URL=mongodb://localhost:27017/servicetu
PORT=8000
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development

ACCESS_TOKEN_SECRET=your_access_secret_key_here
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_secret_key_here
REFRESH_TOKEN_EXPIRY=7d
```

### Run Development Server

```bash
npm run dev
```

Server runs on `http://localhost:8000`

Health check: `GET http://localhost:8000/api/v1/healthCheck`

## API Endpoints Overview

### Authentication (Public)
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login with email/phone
- `POST /api/v1/auth/logout` - Logout (requires auth)
- `POST /api/v1/auth/refresh-token` - Refresh access token

### User Profile (Protected)
- `GET /api/v1/users/profile` - Get user profile
- `PUT /api/v1/users/profile/update` - Update profile
- `PUT /api/v1/users/change-password` - Change password

### Provider Management
- `POST /api/v1/providers/become` - Convert user to provider (protected)
- `GET /api/v1/providers/nearby` - Find nearby providers (public)
- `GET /api/v1/getProviders/provider` - List all providers (public)

### Bookings
- `POST /api/v1/bookings/create` - Create booking (user only)
- `GET /api/v1/bookings/user-bookings` - User booking history (user only)
- `GET /api/v1/bookings/provider-bookings` - Provider bookings (provider only)
- `PATCH /api/v1/bookings/:bookingId/status` - Accept/reject (provider only)
- `PATCH /api/v1/bookings/:bookingId/cancel` - Cancel booking (user only)
- `PATCH /api/v1/bookings/:bookingId/confirm-completion` - Confirm done (user only)
- `PATCH /api/v1/bookings/:bookingId/complete-by-provider` - Mark completed (provider only)

### Reviews
- `POST /api/v1/reviews` - Create review (user only)
- `GET /api/v1/reviews/:providerId` - Get provider reviews (public)

### Admin
- `PUT /api/v1/admin/services/price` - Update service pricing (admin only)

### Health Check
- `GET /api/v1/healthCheck` - API status (public)

## Database Schema

### User
```javascript
{
  username: String (unique, lowercase),
  fullname: String,
  email: String (unique),
  phone: String,
  address: String,
  password: String (hashed),
  role: String (user|provider|admin),
  avatar: String,
  refreshToken: String,
  timestamps: true
}
```

### ServiceProvider
```javascript
{
  user: ObjectId (ref: User),
  serviceType: String (maid|electrician|plumber|caretaker),
  address: String,
  location: GeoJSON Point (2dsphere indexed),
  isApproved: Boolean (default: true),
  isActive: Boolean (default: true),
  isAvailable: Boolean (default: true),
  rating: Number,
  totalReviews: Number,
  timestamps: true
}
```

### Booking
```javascript
{
  user: ObjectId (ref: User),
  provider: ObjectId (ref: ServiceProvider),
  bookingDate: Date,
  price: Number,
  status: String (pending|accepted|rejected_by_provider|cancelled_by_user|service_completed_by_provider|completed),
  paymentStatus: String (pending|held|released|refunded),
  note: String,
  providerCompletedAt: Date,
  completedAt: Date,
  timestamps: true
}
```

### Review
```javascript
{
  user: ObjectId (ref: User),
  provider: ObjectId (ref: ServiceProvider),
  booking: ObjectId (ref: Booking),
  rating: Number (1-5),
  comment: String,
  timestamps: true
  // Indexes: unique(user, provider), unique(booking, user)[sparse]
}
```

### Service
```javascript
{
  serviceType: String (unique),
  price: Number,
  timestamps: true
}
```

## Authentication

### JWT Token Strategy

1. **Access Token** (short-lived, default: 1d)
   - Used for API request authorization
   - Sent via Bearer header or httpOnly cookie
   - Verified on every protected route

2. **Refresh Token** (long-lived, default: 7d)
   - Stored in database and httpOnly cookie
   - Used to obtain new access token
   - Rotated on each refresh

### Protected Routes

All routes under `/api/v1/auth/logout`, user booking endpoints, and provider-specific endpoints require:
- Valid JWT accessToken in header: `Authorization: Bearer <token>`
- OR valid httpOnly cookie: `accessToken=<token>`

### Rate Limiting

- **Auth routes** (`/api/v1/auth`): 10 requests per 15 minutes per IP
- **Other API routes**: 100 requests per 15 minutes per IP
- Health check: No limit

## Key Features

### Location-Based Search
- Uses MongoDB 2dsphere geospatial index
- Finds providers within specified radius
- Query: `GET /api/v1/providers/nearby?lat=28.6139&lon=77.2090&radius=1000`
- Distance in meters, default radius: 1000m

### Pagination
All list endpoints support pagination:
- Query params: `page=1&limit=10` (defaults applied)
- Response includes: `pagination: { total, page, limit, totalPages }`
- Endpoints with pagination:
  - `GET /api/v1/providers/nearby`
  - `GET /api/v1/getProviders/provider`
  - `GET /api/v1/bookings/user-bookings`
  - `GET /api/v1/bookings/provider-bookings`
  - `GET /api/v1/reviews/:providerId`

### Review Constraint
- Prevents duplicate reviews: unique(user, provider)
- One review per booking: unique(booking, user) [sparse]
- Auto-updates provider.rating on creation

### Booking Workflow
```
1. User creates booking → status: "pending"
2. Provider accepts/rejects → status: "accepted" OR "rejected_by_provider"
3. Provider completes work → status: "service_completed_by_provider"
4. User confirms completion → status: "completed"
OR User cancels → status: "cancelled_by_user"
```

## Response Format

### Success
```json
{
  "statusCode": 200,
  "data": { "...": "payload" },
  "message": "Success message",
  "success": true
}
```

### Error
```json
{
  "statusCode": 400,
  "message": "Error description",
  "success": false
}
```

### Paginated Responses
```json
{
  "statusCode": 200,
  "data": {
    "data": [...items],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 10,
      "totalPages": 5
    }
  },
  "message": "Items retrieved",
  "success": true
}
```

## Project Structure

```
backend/
├── src/
│   ├── controllers/          # Business logic
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── booking.controller.js
│   │   ├── serviceProvider.controller.js
│   │   ├── getProvider.controller.js
│   │   ├── publicProviderNearby.js
│   │   ├── review.controller.js
│   │   ├── admin.controller.js
│   │   └── healthcheck.controller.js
│   ├── models/              # Mongoose schemas
│   │   ├── user.model.js
│   │   ├── booking.model.js
│   │   ├── serviceProvider.model.js
│   │   ├── review.model.js
│   │   └── service.model.js
│   ├── routes/              # Route definitions
│   │   ├── auth.route.js
│   │   ├── user.route.js
│   │   ├── booking.route.js
│   │   ├── provider.route.js
│   │   ├── getProviders.route.js
│   │   ├── review.route.js
│   │   ├── admin.route.js
│   │   └── healthCheck.route.js
│   ├── middlewares/
│   │   └── auth.middleware.js
│   ├── utils/               # Helpers
│   │   ├── ApiResponse.js
│   │   ├── ApiError.js
│   │   ├── asyncHandler.js
│   │   └── geocode.util.js
│   ├── db/
│   │   └── connection.js
│   └── app.js               # Express setup
├── server.js                # Entry point
├── package.json
└── .env                     # Configuration (git ignored)
```

## Technology Stack

- **Runtime**: Node.js with ES Modules
- **Framework**: Express.js 5.x
- **Database**: MongoDB + Mongoose 7.x
- **Authentication**: JWT + bcryptjs + cookie-parser
- **Security**: express-rate-limit
- **Utilities**: dotenv, nodemon
- **Geocoding**: Nominatim API (free, no key required)

## Development

### Available Scripts

```bash
npm run dev      # Start with nodemon (auto-reload)
npm start        # Start production server
npm test         # Run tests (if configured)
```

### Code Style

- ES6+ syntax
- Async/await patterns
- Centralized error handling via asyncHandler
- Consistent ApiResponse formatting

### Database Indexing

Created indexes:
- `user.username` (unique, lowercase)
- `user.email` (unique)
- `serviceProvider.user` (unique)
- `review.user + review.provider` (unique compound)
- `review.booking + review.user` (unique sparse)
- `serviceProvider.location` (2dsphere for geospatial)

## Deployment

### Production Checklist

- [ ] Generate strong random secrets for token keys (32+ chars)
- [ ] Set `NODE_ENV=production`
- [ ] Configure MongoDB connection string (Atlas or self-hosted)
- [ ] Set `CORS_ORIGIN` to exact frontend domain
- [ ] Enable HTTPS (nginx reverse proxy or AWS ALB)
- [ ] Set secure cookies: `Secure; HttpOnly; SameSite=Strict`
- [ ] Monitor rate limiting and adjust if needed
- [ ] Set up error logging/monitoring (Sentry, LogRocket)
- [ ] Configure automated backups for MongoDB
- [ ] Update MONGO_URL with production database
- [ ] Test all endpoints in staging environment

### Example Production .env

```env
MONGO_URL=mongodb+srv://user:pass@cluster.mongodb.net/servicetu
PORT=3000
CORS_ORIGIN=https://servicetu.com
NODE_ENV=production

ACCESS_TOKEN_SECRET=abc123def456ghi789jkl012mno345pqr678stu
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=xyz987uvw654tsr321qpo987lkj654ihg321fed
REFRESH_TOKEN_EXPIRY=7d
```

## Troubleshooting

### MongoDB Connection Failed
- Verify `MONGO_URL` is correct
- Check MongoDB service is running: `mongod`
- For Atlas: Ensure IP whitelist includes your IP

### Rate Limit Errors (429)
- Auth routes: Wait 15 minutes before retry
- Other routes: Distributed requests over time
- Check IP - each IP has separate limit bucket

### JWT Token Expired
- Use `POST /api/v1/auth/refresh-token` to get new accessToken
- Send refreshToken in request body or cookies

### Provider Geospatial Query Returns Empty
- Verify `location` is valid GeoJSON Point: `{ type: "Point", coordinates: [lon, lat] }`
- Check latitude/longitude values (lon: -180 to 180, lat: -90 to 90)
- Ensure 2dsphere index exists on serviceProvider.location

## Security Recommendations

- [ ] Add helmet.js for HTTP security headers
- [ ] Implement input sanitization (xss library)
- [ ] Add request validation schemas (Joi, Zod)
- [ ] Enable CORS preflight for complex requests
- [ ] Use environment-specific secrets
- [ ] Implement API versioning strategy
- [ ] Add comprehensive error logging
- [ ] Use HTTPS everywhere in production
- [ ] Implement request signing for critical endpoints
- [ ] Regular dependency updates: `npm audit fix`

## Next Steps

### High Priority Backend Work
1. Payment integration (Stripe/Razorpay)
2. Provider approval workflow (admin queue)
3. Booking refund logic
4. Service catalog CRUD (dynamic types)

### Monitoring & Maintenance
- Set up error tracking (Sentry)
- Monitor rate limit patterns
- Track API response times
- Set up uptime monitoring
- Regular security audits

## Support & Issues

For backend issues:
- Check MongoDB connection
- Verify JWT secrets are set
- Inspect rate limiting status
- Review console logs for stack traces
- Check CORS configuration if frontend can't connect

## License

ServiceSetu Backend © 2026
