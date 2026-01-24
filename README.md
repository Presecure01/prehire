# PreHire - Resume Upload & Profile Creation System

> **Welcome Interns!** 👋 This project is designed to help you understand a full-stack Javascript application. Please read this document carefully to get started.

A comprehensive platform connecting candidates and recruiters through AI-powered resume matching. The system allows candidates to upload resumes, parses them using AI, and helps recruiters find the best talent.

## 🌟 Key Features

### Candidate Features
- **Smart Resume Upload**: Drag & drop PDF/DOCX files.
- **AI Parsing**: Automatically extracts extraction of skills, experience, and contact info.
- **ATS Board**: Real-time scoring of your resume against job descriptions.
- **Profile**: Manage your professional identity.

### Recruiter Features
- **Dashboard**: Overview of candidates and job postings.
- **Advanced Search**: Filter candidates by skills, experience, and score.
- **Job Management**: create and manage job postings.

## 🏗️ Architecture & Tech Stack

The application is built using a **MERN Stack** (modified) architecture with a separate AI microservice.

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React 18, React Router, Axios | Single Page Application (SPA) for the user interface. |
| **Backend** | Node.js, Express, MongoDB | RESTful API server handling business logic and data persistence. |
| **Database** | MongoDB (Mongoose) | NoSQL database for flexible data storage. |
| **AI Service** | Node.js (Python bridge support) | Dedicated service for parsing resumes and NLP tasks. |
| **File Storage**| Local / AWS S3 | Hybrid storage system for document retention. |

## 📂 Project Structure

```bash
prehire-app/
├── frontend/           # The User Interface (React)
├── backend/            # The Main API Server (Node/Express)
├── ai-service/         # The Microservice for Parsing
├── uploads/            # Local directory for file storage (dev mode)
├── scripts/            # Helper scripts for deployment/maintenance
├── deploy.sh           # Deployment script
└── README.md           # This file
```

## 🚀 Quick Start Guide

Follow these steps to get the application running on your local machine.

### Prerequisites
-   **Node.js**: v16 or higher (v18 recommended)
-   **MongoDB**: Installed locally or use a cloud URI (MongoDB Atlas).
-   **Git**: For version control.

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd prehire-app
```

### Step 2: Install Dependencies
We have a helper script to install dependencies for all services at once, or you can do it manually.

**Using Helper (if available in package.json):**
```bash
npm run install-all
```

**Manual Installation (Recommended for understanding):**
```bash
# 1. Backend
cd backend && npm install

# 2. Frontend
cd ../frontend && npm install

# 3. AI Service
cd ../ai-service && npm install
```

### Step 3: Configure Environment Variables
You need to set up `.env` files for each service.

**Backend (`backend/.env`):**
Copy `.env.example` to `.env` and defaults should work for local dev.
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/prehire
JWT_SECRET=dev_secret_key_123
```

**Frontend (`frontend/.env`):**
```env
REACT_APP_API_URL=http://localhost:5000/api
```

**AI Service (`ai-service/.env`):**
```env
PORT=3001
```

### Step 4: Start the Application

**Windows:**
Double-click `start-demo.bat` to launch everything.

**Manual Start (Terminal):**
Open 3 separate terminals:

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (AI Service):**
```bash
cd ai-service
npm run dev
```

**Terminal 3 (Frontend):**
```bash
cd frontend
npm start
```

Visit **http://localhost:3000** in your browser!

## 🤝 Contributing

We welcome contributions! Please check out [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to submit Pull Requests, report bugs, and follow our coding standards.

## 📚 Documentation

For more detailed information, check the specific documentation for each component:

-   [Frontend Documentation](frontend/README.md)
-   [Backend Documentation](backend/README.md)
-   [AI Service Documentation](ai-service/README.md)

## 🔧 Troubleshooting

-   **MongoDB Connection Error**: Ensure your local MongoDB service is running (`mongod`). If using Atlas, check your whitelist IP.
-   **Modules Not Found**: Run `npm install` in the specific directory (frontend/backend/ai-service) again.
-   **Port Conflicts**: Ensure ports 3000, 5000, and 3001 are free.

---
*Happy Coding! 🚀*