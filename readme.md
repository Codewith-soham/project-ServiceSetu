# ServiceSetu - Service Provider Platform

ServiceSetu is a Node.js backend that connects users with local service providers such as maids, electricians, plumbers, and care-takers.

## Highlights

- Express + MongoDB backend using ES Modules
- JWT auth with cookie or `Authorization: Bearer <token>` support
- Role-based access (user/provider/admin)
- Booking workflow with provider/user completion flow
- Provider discovery with geospatial search
- Structured MVC layout for maintainability

## Tech Stack

### Backend
- Runtime: Node.js
- Framework: Express.js
- Database: MongoDB with Mongoose
- Auth: JWT (jsonwebtoken) with cookies
- Security: bcryptjs password hashing
- Middleware: CORS, cookie-parser, built-in Express parsers

### Frontend
- Framework: React 18
- Build Tool: Vite
- Styling: Tailwind CSS
- Routing: React Router
- HTTP Client: Axios

## Project Structure

```
ServiceSetu/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── auth.controller.js              # User registration & login
│   │   │   ├── user.controller.js              # Profile management
│   │   │   ├── serviceProvider.controller.js   # Provider upgrade
│   │   │   ├── getProvider.controller.js       # Provider listing & filtering
│   │   │   ├── booking.controller.js           # Booking management
│   │   │   ├── publicProviderNearby.js          # Provider nearby search
│   │   │   ├── admin.controller.js              # Admin pricing
│   │   │   ├── review.controller.js             # Reviews & ratings
│   │   │   └── healthcheck.controller.js        # Health check
│   │   ├── middlewares/
│   │   │   └── auth.middleware.js              # JWT verification
│   │   ├── models/
│   │   │   ├── user.model.js                   # User schema with auth
│   │   │   ├── serviceProvider.model.js        # Provider schema
│   │   │   ├── service.model.js                # Service types & pricing
│   │   │   ├── booking.model.js                # Booking schema
│   │   │   └── review.model.js                 # Reviews & ratings
│   │   ├── routes/
│   │   │   ├── auth.route.js                   # Auth endpoints
│   │   │   ├── user.route.js                   # User profile endpoints
│   │   │   ├── provider.route.js               # Provider upgrade
│   │   │   ├── getProviders.route.js           # Provider listing & filtering
│   │   │   ├── booking.route.js                # Booking endpoints
│   │   │   ├── admin.route.js                  # Admin pricing
│   │   │   ├── review.route.js                 # Reviews
│   │   │   └── healthCheck.route.js            # Health check
│   │   ├── utils/
│   │   │   ├── ApiError.js                     # Error handling class
│   │   │   ├── ApiResponse.js                  # Response formatter
│   │   │   ├── asyncHandler.js                 # Async wrapper
│   │   │   └── geocode.util.js                 # Address to coordinates conversion
│   │   ├── db/
│   │   │   └── connection.js                   # MongoDB connection
│   │   ├── public/                             # Static files directory
│   │   └── app.js                              # Express app configuration
│   ├── server.js                               # Entry point
│   ├── package.json                            # Dependencies & scripts
│   └── .env                                    # Environment variables (not tracked)
│
├── frontend/
│   ├── public/
│   │   └── vite.svg
│   ├── src/
│   │   ├── assets/
│   │   │   ├── react.svg
│   │   │   └── servicesetulogo.png            # ServiceSetu logo
│   │   ├── components/                         # Reusable React components
│   │   ├── pages/
│   │   │   └── landingPage.jsx                # Landing page with header, hero & footer
│   │   ├── services/
│   │   │   ├── api.js                         # API utility functions
│   │   │   ├── auth.api.js                    # Authentication API calls
│   │   │   └── provider.api.js                # Provider API calls
│   │   ├── App.jsx                            # Main App component
│   │   ├── main.jsx                           # React entry point
│   │   └── index.css                          # Global styles
│   ├── index.html
│   ├── vite.config.js                         # Vite configuration
│   ├── eslint.config.js                       # ESLint configuration
│   ├── package.json                           # Frontend dependencies & scripts
│   └── README.md                              # Frontend documentation
│
└── readme.md                                   # This file
```

## Run Locally

### Backend Setup

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

3. Create `.env` file in the backend folder with required environment variables

4. Start the server
   ```bash
   npm run dev
   ```

Backend server runs at: http://localhost:8000

### Frontend Setup

1. Navigate to frontend folder
   ```bash
   cd frontend
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start the development server
   ```bash
   npm run dev
   ```

Frontend server runs at: http://localhost:5173 (or as shown in terminal)

### Build for Production

**Backend:**
```bash
npm run build
```

**Frontend:**
```bash
npm run build
```

## API Endpoints

Base URL: `/api/v1`

Auth tokens are accepted via `accessToken` cookie or `Authorization: Bearer <token>`.

### Frontend Features

**Landing Page** (`/`)
- Responsive navigation header with ServiceSetu logo
- Hero section highlighting service discovery
- Call-to-action button for user signup
- Footer with copyright information
- Mobile-friendly design with Tailwind CSS

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

Nearby Providers
- `GET /providers/nearby?lat=18.52&lon=73.85&radius=2000&serviceType=maid` - Providers within radius (meters)

Reviews
- `GET /reviews/:providerId` - Get provider reviews

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
- `PATCH /bookings/:bookingId/confirm-completion` - User confirms completion
- `PATCH /bookings/:bookingId/complete-by-provider` - Provider marks completed

Reviews
- `POST /reviews` - Add a review (user)

Admin
- `PUT /admin/services/price` - Update service pricing (admin)

## Utilities & Features

### Geocoding
- Address-to-coordinates conversion via `getCoordinatesFromAddress()` utility
- Enables location-based provider discovery and proximity filtering
- Uses external geocoding API to convert provider addresses to latitude/longitude

## Upcoming Features

### Backend
- Admin dashboard for provider approval and analytics
- Provider earnings and performance metrics
- Booking notifications and reminders
- Payment integration
- Reviews and rating system
- Advanced search and filtering

### Frontend
- User authentication pages (Login/Register)
- Service provider discovery and filtering
- Booking system UI
- User profile management
- Reviews and ratings display
- Provider dashboard
- Search and location-based filtering
- Payment processing integration

## Development Notes

### Frontend Development
- Uses Tailwind CSS for styling
- React Router for page navigation
- Axios for API calls
- Vite for fast development and builds
- ESLint for code quality

### Environment Variables (Frontend)
Configure in `frontend/.env` or `frontend/.env.local`:
```
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## Developer

Soham Ghadge
