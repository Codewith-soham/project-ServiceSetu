  # ServiceSetu - Service Provider Platform

ServiceSetu is a Node.js backend that connects users with local service providers such as maids, electricians, plumbers, and care-takers.

## Highlights

- Express + MongoDB backend using ES Modules
- JWT authentication with protected routes
- Role-based access (user/provider/admin)
- Booking workflow with provider actions and user cancellation
- Structured MVC layout for maintainability

## Tech Stack

- Runtime: Node.js
- Framework: Express.js
- Database: MongoDB with Mongoose
- Auth: JWT (jsonwebtoken)
- Security: bcryptjs password hashing
- Middleware: CORS, cookie-parser, built-in Express parsers

## Project Structure

```
backend/
│
├── src/
│   ├── controllers/
│   │   ├── auth.controller.js              # User registration & login
│   │   ├── user.controller.js              # Profile management
│   │   ├── serviceProvider.controller.js   # Provider upgrade
│   │   ├── getProvider.controller.js       # Provider listing & filtering
│   │   ├── booking.controller.js           # Booking management
│   │   └── healthcheck.controller.js       # Health check
│   ├── middlewares/
│   │   └── auth.middleware.js              # JWT verification
│   ├── models/
│   │   ├── user.model.js                   # User schema with auth
│   │   ├── serviceProvider.model.js        # Provider schema
│   │   └── booking.model.js                # Booking schema
│   ├── routes/
│   │   ├── auth.route.js                   # Auth endpoints
│   │   ├── user.route.js                   # User profile endpoints
│   │   ├── provider.route.js               # Provider upgrade
│   │   ├── getProviders.route.js           # Provider listing & filtering
│   │   ├── booking.route.js                # Booking endpoints
│   │   └── healthCheck.route.js            # Health check
│   ├── utils/
│   │   ├── ApiError.js                     # Error handling class
│   │   ├── ApiResponse.js                  # Response formatter
│   │   └── asyncHandler.js                 # Async wrapper
│   ├── db/
│   │   └── connection.js                   # MongoDB connection
│   ├── public/                             # Static files directory
│   └── app.js                              # Express app configuration
│
├── server.js                           # Entry point
├── package.json                        # Dependencies & scripts
└── .env                                # Environment variables (not tracked)
```

## Run Locally

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd ServiceSetu
   ```

2. Install dependencies
   ```bash
   cd backend
   npm install
   ```

3. Start the server
   ```bash
   npm run dev
   ```

Server runs at: http://localhost:8000

## Environment Variables

Create a `backend/.env` file:

```bash
MONGO_URL=mongodb://localhost:27017/servicesetu
PORT=8000
CORS_ORIGIN=http://localhost:3000
```

## API Endpoints

Base URL: `/api/v1`

### Public Routes

Health Check
- `GET /healthCheck` - Server health status
- `GET /healthCheck/test` - Test endpoint

Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login

Service Providers
- `GET /getProviders/provider` - Get all approved providers
- `GET /getProviders/provider?serviceType=maid` - Filter by service type

### Protected Routes (Requires Authentication)

User Profile
- `GET /users/profile` - Get current user profile
- `PUT /users/profile/update` - Update user profile
- `PUT /users/change-password` - Change password

Provider Management
- `POST /providers/become` - Upgrade user to provider

Booking Management
- `POST /bookings/create` - Create a booking
- `PATCH /bookings/:bookingId/status` - Provider updates booking status
- `GET /bookings/user-bookings` - User booking history
- `GET /bookings/provider-bookings` - Provider booking queue
- `PATCH /bookings/:bookingId/cancel` - User cancels a booking

## Upcoming Features

- Admin dashboard for provider approval and analytics
- Provider earnings and performance metrics
- Booking notifications and reminders
- Payment integration
- Reviews and rating system
- Advanced search and filtering

## Developer

Soham Ghadge
