# Backend Service (API)

This is the core API server for the PreHire application. It handles user authentication, data persistence, and communication with the AI service.

## 🛠️ Technology Stack

-   **Runtime**: Node.js
-   **Framework**: Express.js
-   **Database**: MongoDB (via Mongoose)
-   **Authentication**: JSON Web Tokens (JWT)

## 📂 Directory Structure

```
src/
├── config/         # Database and app configuration
├── middleware/     # Auth, error handling, upload middleware
├── models/         # Mongoose Data Models (User, Job, Candidate)
├── routes/         # API Route definitions
├── services/       # Business logic (Email, external APIs)
├── utils/          # Helper functions
└── server.js       # Entry point
```

## 🔧 Environment Variables

Create a `.env` file in the `backend/` directory:

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `PORT` | Port for the server to listen on | `5001` |
| `MONGODB_URI` | Connection string for MongoDB | `mongodb://localhost:27017/prehire` |
| `JWT_SECRET` | Secret key for signing tokens | `your_super_secret_key` |
| `FRONTEND_URL` | URL for CORS configuration | `http://localhost:3000` |
| `EMAIL_SERVICE` | Email provider (optional) | `smtp` |

## 🚀 API Endpoints

### Authentication
-   `POST /api/auth/register`: Register a new user (Candidate/Recruiter)
-   `POST /api/auth/login`: Login and receive JWT

### Candidate
-   `GET /api/candidate/profile`: Get current user profile
-   `PUT /api/candidate/profile`: Update profile details
-   `POST /api/upload/resume`: Upload resume file

### Recruiter
-   `POST /api/jobs`: Post a new job
-   `GET /api/recruiter/candidates`: Search for candidates

## 🏃 Running Locally

1.  Navigate to the directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start development server:
    ```bash
    npm run dev
    ```
