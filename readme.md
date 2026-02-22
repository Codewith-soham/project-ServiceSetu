# ServiceSetu - Service Provider Platform

A full-stack platform connecting users with local service providers including maids, electricians, plumbers, and care-takers.

## ✅ Current Progress

## 🔹 Project Initialization

- Node.js backend initialized with ES Modules
- Structured MVC architecture implemented
- Environment-based configuration with dotenv

## 🔹 Express Configuration

- Express app configured with middleware
- CORS enabled for cross-origin requests
- Request body limit set to 10mb (supports image uploads and rich profiles)
- Cookie parser for JWT token management
- Static file serving enabled

## 🔹 Database Integration

- MongoDB connection with Mongoose ODM
- Connection pooling and error handling
- Server starts only after successful DB connection

## 🔹 Security & Authentication

- JWT-based authentication with access tokens
- Password hashing with bcryptjs (10 salt rounds)
- Protected routes with auth middleware
- Token verification and user session management

## 🔹 Implemented Features

### Authentication System
- User registration with role-based access
- Login with email/phone and password
- Access token generation and validation
- Auth middleware for protected routes

### User Management
- User profile retrieval
- Profile update functionality
- Password change with validation
- Role-based permissions (user/provider/admin)

### Provider System
- User-to-provider upgrade endpoint
- Provider approval workflow
- Service type categorization (maid, electrician, plumber, care-taker)
- Provider listing with filters
- Availability and rating tracking

## 🔹 Models Implemented

- **User Model**: Authentication, roles, profile data, refresh tokens
- **ServiceProvider Model**: Service types, pricing, approval status, ratings, availability

## 🛠 Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (jsonwebtoken)
- **Security:** bcryptjs for password hashing
- **Middleware:** CORS, cookie-parser, express built-in middleware
- **Environment:** dotenv for configuration management

## 📁 Project Structure

```
backend/
│
├── src/
│   ├── controllers/
│   │   ├── auth.controller.js          # User registration & login
│   │   ├── user.controller.js          # Profile management
│   │   ├── serviceProvider.controller.js  # Provider upgrade
│   │   ├── getProvider.controller.js   # Provider listing
│   │   └── healthcheck.controller.js   # Health check
│   ├── middlewares/
│   │   └── auth.middleware.js          # JWT verification
│   ├── models/
│   │   ├── user.model.js               # User schema
│   │   └── serviceProvider.model.js    # Provider schema
│   ├── routes/
│   │   ├── auth.route.js               # Auth endpoints
│   │   ├── user.route.js               # User endpoints
│   │   ├── provider.route.js           # Provider upgrade
│   │   ├── getProviders.route.js       # Provider listing
│   │   └── healthCheck.route.js        # Health check
│   ├── utils/
│   │   ├── ApiError.js                 # Error handling class
│   │   ├── ApiResponse.js              # Response formatter
│   │   └── asyncHandler.js             # Async wrapper
│   ├── db/
│   │   └── connection.js               # MongoDB connection
│   ├── public/                         # Static files
│   └── app.js                          # Express app config
│
├── server.js                           # Entry point
├── package.json
└── .env                                # Environment variables (not in git)
```

## ▶️ Run Locally

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ServiceSetu
   ```

2. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Configure environment variables**
   - Create a `.env` file in the backend directory
   - Add required environment variables (contact developer for details)

4. **Start the server**
   ```bash
   npm run dev
   ```

**Server runs at:** http://localhost:8000

## 📡 API Endpoints

### Public Routes

**Health Check**
- `GET /api/v1/healthCheck` - Server health status
- `GET /api/v1/healthCheck/test` - Test endpoint

**Authentication**
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login

**Service Providers**
- `GET /api/v1/getProviders/provider` - Get all approved providers
- `GET /api/v1/getProviders/provider?serviceType=maid` - Filter by service type

### Protected Routes (Requires Authentication)

**User Profile**
- `GET /api/v1/users/profile` - Get current user profile
- `PUT /api/v1/users/profile/update` - Update user profile
- `PUT /api/v1/users/change-password` - Change password

**Provider Management**
- `POST /api/v1/providers/become` - Upgrade user to provider

## 🚀 Upcoming Features

- **Admin Dashboard**
  - Provider approval/rejection workflow
  - User and provider management
  - Pricing control
  
- **Booking System**
  - Booking creation and management
  - Real-time availability checking
  - Booking status tracking (pending, accepted, in-progress, completed, cancelled)
  
- **Provider Features**
  - Booking acceptance/rejection
  - Job status updates
  - Availability management
  - Earnings tracking
  
- **Review & Rating System**
  - User reviews for providers
  - Rating calculations
  - Review moderation
  
- **Additional Enhancements**
  - Input validation middleware
  - Advanced error handling
  - File upload for avatars and documents
  - Email notifications
  - Search and filter optimization

## 🔑 Key Features

✅ JWT-based authentication  
✅ Role-based access control  
✅ Password hashing with bcrypt  
✅ RESTful API design  
✅ Error handling with custom classes  
✅ Async/await pattern throughout  
✅ MongoDB with Mongoose ODM  
✅ Protected routes with middleware  
✅ Provider filtering by service type  
✅ 10mb request body limit for rich content

## 👨‍💻 Developer

**Soham Ghadge**

---

For questions or contributions, please contact the developer.
