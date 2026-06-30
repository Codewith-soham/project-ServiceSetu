# ServiceSetu

<div align="center">

**A modern home-services platform connecting customers with skilled service providers**

[Features](#features) • [Tech Stack](#tech-stack) • [API Docs](#api-endpoints) • [Setup](#setup) • [License](#license)

</div>

---

## 📋 Overview

ServiceSetu is a full-stack marketplace platform that bridges the gap between customers seeking home services and verified service providers. Customers can discover providers, book services, track progress in real-time, and leave reviews. Service providers can manage bookings, track earnings, and handle payouts—all within a seamless, intuitive interface.

**Perfect for**: Home cleaning, repairs, maintenance, plumbing, electrical work, and other on-demand services.

---

## ✨ Features

### For Customers
- 🔍 **Discover Providers** – Find nearby service providers with location-based search
- 📅 **Book Services** – Quick, intuitive booking interface with real-time confirmation
- 📍 **Track Progress** – Real-time socket updates for booking status changes
- 💰 **Secure Payments** – Razorpay integration with QR code and OTP support
- ⭐ **Leave Reviews** – Rate providers and build community trust
- 🔐 **Secure Auth** – JWT-based authentication with refresh tokens

### For Providers
- 📊 **Manage Bookings** – Accept, reject, and complete service requests
- 💵 **Track Earnings** – Monitor income and performance metrics
- 🏦 **Payout System** – Configure bank details and receive payments
- 📈 **Dashboard** – Real-time overview of bookings and earnings
- 🔐 **Provider Profile** – Build reputation through ratings and reviews

### Admin Features
- ⚙️ **Service Management** – Adjust service pricing and commission rates
- 📊 **Platform Analytics** – Monitor platform health and transactions

---

## 🛠 Tech Stack

### Backend
| Layer | Technology |
|-------|-----------|
| **Runtime** | Node.js 18+ |
| **Framework** | Express.js 5 |
| **Database** | MongoDB + Mongoose |
| **Authentication** | JWT (Access/Refresh tokens) |
| **Real-time** | Socket.IO |
| **Payments** | Razorpay SDK |
| **File Upload** | Cloudinary + Multer |
| **Validation** | Joi |
| **Security** | Helmet, Express Rate Limit, bcryptjs |
| **Logging** | Winston |

### Frontend
| Layer | Technology |
|-------|-----------|
| **Framework** | React 18 + TypeScript |
| **Build Tool** | Vite |
| **Routing** | React Router v6 |
| **Styling** | Tailwind CSS |
| **HTTP Client** | Axios |
| **Real-time** | Socket.IO Client |

---

## 📡 API Endpoints

### Base URL
```
http://localhost:8000/api/v1
```

### Authentication Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user or provider |
| POST | `/auth/login` | Login and get JWT tokens |
| POST | `/auth/logout` | Logout and invalidate tokens |
| POST | `/auth/refresh-token` | Refresh access token |

### User Profile Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users/profile` | Get user profile |
| PUT | `/users/profile/update` | Update user details |
| PUT | `/users/change-password` | Change password |

### Provider Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/providers/become` | Become a service provider |
| GET | `/providers/nearby` | Find nearby providers (location-based) |
| GET | `/providers/payout-details` | Get payout configuration |
| PUT | `/providers/payout-details` | Update bank/payout details |
| GET | `/getProviders/provider` | Get all providers list |

### Booking Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/bookings/create` | Create new booking |
| GET | `/bookings/user-bookings` | Get customer's bookings |
| GET | `/bookings/provider` | Get provider's bookings |
| GET | `/bookings/provider/earnings` | Get provider earnings summary |
| POST | `/bookings/:id/accept` | Provider accepts booking |
| POST | `/bookings/:id/reject` | Provider rejects booking |
| POST | `/bookings/:id/complete` | Provider marks service complete |
| PATCH | `/bookings/:bookingId/cancel` | Customer cancels booking |
| PATCH | `/bookings/:bookingId/confirm-completion` | Customer confirms completion |

### Payment Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/payments/status` | Check payment status |
| POST | `/payments/create-order` | Create Razorpay order |
| POST | `/payments/create-qr` | Generate payment QR code |
| POST | `/payments/verify` | Verify payment |
| POST | `/payments/verify-otp` | Verify OTP for payment |
| GET | `/payments/bookings/:bookingId/status` | Get booking payment status |
| PATCH | `/payments/:bookingId/accept` | Accept payment |
| PATCH | `/payments/:bookingId/reject` | Reject payment |
| PATCH | `/payments/:bookingId/refund` | Process refund |

### Review Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/reviews` | Create review for provider |
| GET | `/reviews/:providerId` | Get provider reviews |

### Admin Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | `/admin/services/price` | Adjust service pricing |

---

## 🔄 Real-time Features

### Socket Events
- **Event**: `booking_updated`
  - Emitted when booking status changes (created, accepted, rejected, completed, cancelled)
  - Payload includes full booking details
  - Both customer and provider dashboards auto-update

### Usage
```javascript
socket.on('booking_updated', (booking) => {
  // Update UI with new booking state
  refreshBookingsList();
});
```

---

## 🚀 Setup & Installation

### Prerequisites
```
Node.js 18+ 
MongoDB 4.4+
npm/yarn
```

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/ServiceSetu.git
cd ServiceSetu
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file in `backend/`:
```env
# Database
MONGO_URL=mongodb://localhost:27017/servicetu

# Server
PORT=8000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# JWT
ACCESS_TOKEN_SECRET=your_secret_key_here
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_secret_here
REFRESH_TOKEN_EXPIRY=7d

# Razorpay (Payment)
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxxxxx

# Pricing Configuration
PLATFORM_COMMISSION_RATE=0.02
RAZORPAY_FEE_RATE=0.02
RAZORPAY_FIXED_FEE=0
PRICE_ROUND_TO=5
MIN_ROUND_UP_STEPS=1
MAX_MARKUP_RATE=0.12

# Cloudinary (Image Upload)
CLOUDINARY_CLOUD_NAME=xxxx
CLOUDINARY_API_KEY=xxxx
CLOUDINARY_API_SECRET=xxxx
```

**Start Backend**:
```bash
npm run dev
```
Server runs on: `http://localhost:8000`

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create `.env` file in `frontend/` (optional):
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

**Start Frontend**:
```bash
npm run dev
```
App runs on: `http://localhost:5173`

---

## 📁 Project Structure

```
ServiceSetu/
├── backend/
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API routes
│   │   ├── middlewares/    # Auth, validation
│   │   ├── utils/          # Helpers (Cloudinary, Razorpay, etc)
│   │   ├── socket/         # Real-time events
│   │   └── db/             # Database connection
│   ├── server.js           # Entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom hooks
│   │   ├── context/        # State management
│   │   ├── utils/          # Utilities
│   │   └── App.tsx         # Root component
│   ├── index.html
│   └── package.json
│
└── README.md
```

---

## 🔐 Authentication & Authorization

### Roles
- **`user`** – Customer who books services
  - Browse providers, create/cancel bookings, review providers
  
- **`provider`** – Service provider
  - Accept/reject bookings, track earnings, manage payouts

### Token Management
- Tokens stored in HTTP-only cookies
- Alternative: `Authorization: Bearer <token>` header
- Automatic token refresh before expiration
- Logout invalidates all tokens

---

## 📊 Booking Lifecycle

```
Created
   ↓
Awaiting Payment → Pending (after payment)
   ├─→ Accepted (provider accepts)
   │     └─→ Service Completed by Provider
   │          └─→ Completed (customer confirms)
   │
   └─→ Rejected (provider rejects)
```

### Booking States
- `awaiting_payment` – Waiting for customer payment
- `pending` – Awaiting provider response
- `accepted` – Provider accepted, service in progress
- `service_completed_by_provider` – Provider marked service complete
- `completed` – Customer confirmed completion
- `cancelled_by_user` – User cancelled booking
- `rejected_by_provider` – Provider rejected booking

---

## 🧪 Running Tests & Development

### Backend
```bash
cd backend
npm run dev      # Start with nodemon
npm test         # Run tests
npm start        # Production start
```

### Frontend
```bash
cd frontend
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview production build
```

---

## 📝 Key Features Implementation

### Real-time Booking Updates
- Socket.IO connection with JWT authentication
- Automatic UI refresh when booking status changes
- No manual page reload needed

### Payment Integration
- Razorpay for secure payments
- QR code generation for UPI payments
- OTP verification support
- Commission calculations built-in

### Location-based Search
- Geolocation API integration
- Find providers near customer
- Distance calculation and filtering

### Image Management
- Cloudinary CDN for profile pictures
- Multer for file upload handling
- Automatic image optimization

---

## 🚧 Notes & Future Roadmap

- Payment page intentionally disabled (progressive rollout)
- Payment APIs fully implemented and ready
- Legacy endpoints maintained for compatibility
- Platform ready for deployment

---

## 📄 License

This project is licensed under the ISC License - see [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Soham Ghadge**  
[GitHub](https://github.com/Codewith-soham) • [Email](mailto:soham@example.com)

---

## 🤝 Contributing

Contributions are welcome! Feel free to open issues and pull requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## ⚡ Quick Links

- [API Documentation](#api-endpoints)
- [Setup Guide](#setup--installation)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)