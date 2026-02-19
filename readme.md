# ✅ Current Progress

## 🔹 Project Initialization

- Node.js backend initialized
- ES Modules enabled ("type": "module")
- Structured backend architecture created

## 🔹 Express Configuration

- Express app configured inside src/app.js
- CORS enabled for frontend-backend communication
- JSON and URL-encoded middleware configured
- Cookie parser added
- Static file serving enabled

## 🔹 Health Check Route

- Implemented /api/v1/healthcheck
- Standard API response format implemented
- Async controller handling using asyncHandler

## � Database Integration

- MongoDB connection established using Mongoose
- Database connection function implemented in src/db/connection.js
- Server waits for successful DB connection before starting

## 🔹 Security & Authentication

- JWT (jsonwebtoken) installed for token-based authentication
- BCryptjs installed for secure password hashing
- Access and refresh token flow implemented with HTTP-only cookies

## 🔹 Users & Auth APIs

- User model with roles, phone, address, and refresh token
- Register and login routes added under /api/v1/users
- Auth middleware added for protected routes
- ServiceProvider model created with approval system
- Password hashing and JWT token generation implemented

## 🔹 Models Implemented

- **User Model**: Standard users with roles (user/provider/admin)
- **ServiceProvider Model**: Service providers with approval status, service types, pricing, and availability tracking

## �🛠 Tech Stack (Current)

- Node.js
- Express.js
- MongoDB & Mongoose
- JWT Authentication
- BCryptjs (Password Hashing)
- CORS
- Cookie-Parser
- Dotenv

## 📁 Project Structure

```
backend/
│
├── src/
│   ├── controllers/
│   │   ├── healthcheck.controller.js
│   │   └── user.controller.js
│   ├── middlewares/
│   │   └── auth.middleware.js
│   ├── models/
│   │   ├── user.model.js
│   │   └── serviceProvider.model.js
│   ├── routes/
│   │   ├── healthCheck.route.js
│   │   ├── user.route.js
│   │   └── auth.route.js
│   ├── utils/
│   │   ├── ApiError.js
│   │   ├── ApiResponse.js
│   │   └── asyncHandler.js
│   ├── db/
│   │   └── connection.js
│   ├── public/
│   └── app.js
│
├── server.js
├── package.json
└── README.md
```

## 🔧 Environment Variables

Create a .env file in the root directory:

```
PORT=8000
CORS_ORIGIN=http://localhost:8000
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/serviceSetu
ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=7d
```

## ▶️ Run Locally

```bash
npm install
npm run dev
```

**Server runs at:**
- http://localhost:8000

**Health Check Endpoint:**
- GET /api/v1/healthcheck

**Auth Endpoints:**
- POST /api/v1/users/register
- POST /api/v1/users/login

## � API Endpoints by Role

### 🛡️ Admin-Only Routes

- **Create Provider/Helper**
  - POST /api/v1/admin/providers
  
- **Set Price for Provider**
  - PUT /api/v1/admin/providers/:id/price
  
- **Approve/Reject Provider**
  - PATCH /api/v1/admin/providers/:id/approve
  - PATCH /api/v1/admin/providers/:id/reject
  
- **Delete Any User/Helper**
  - DELETE /api/v1/admin/users/:id
  - DELETE /api/v1/admin/providers/:id

### 👤 Provider-Only Routes

- **Accept/Reject Bookings**
  - PATCH /api/v1/providers/bookings/:id/accept
  - PATCH /api/v1/providers/bookings/:id/reject
  
- **Mark Job In-Progress or Completed**
  - PATCH /api/v1/providers/bookings/:id/in-progress
  - PATCH /api/v1/providers/bookings/:id/completed
  
- **Update Availability**
  - PUT /api/v1/providers/availability
  - GET /api/v1/providers/availability

### 👥 User-Only Routes

- **Create a Booking**
  - POST /api/v1/users/bookings
  
- **Cancel Booking**
  - DELETE /api/v1/users/bookings/:id
  - PATCH /api/v1/users/bookings/:id/cancel
  
- **View Own Bookings**
  - GET /api/v1/users/bookings

## �📌 Upcoming Implementation

- Admin Routes (Provider management, user deletion, pricing)
- Provider Routes (Booking acceptance, job tracking, availability)
- User Routes (Booking creation, cancellation, viewing)
- Booking Model and Controller
- Review/Rating System
- Error Handling Middleware
- Input Validation

## 👨‍💻 Author

Soham Ghadge
