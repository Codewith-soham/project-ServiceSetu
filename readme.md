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

## 🛠 Tech Stack (Current)

- Node.js
- Express.js
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

- MongoDB Integration
- User Model
- JWT Authentication
- Protected Routes
- Service APIs

## 👨‍💻 Author

Soham Ghadge
