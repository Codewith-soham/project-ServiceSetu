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
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── public/
│   └── app.js
│
├── server.js
└── README.md
```

## 🔧 Environment Variables

Create a .env file in the root directory:

```
PORT=8000
CORS_ORIGIN=http://localhost:8000
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/serviceSetu
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

## 📌 Upcoming Implementation

- User Model & Schema
- Authentication Routes (Register/Login)
- Protected Routes Middleware
- Service APIs
- Error Handling Middleware

## 👨‍💻 Author

Soham Ghadge
