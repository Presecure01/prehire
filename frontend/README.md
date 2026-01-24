# Frontend Client

The frontend interface for PreHire, built with React. It provides the user interface for candidates to upload resumes and for recruiters to manage jobs.

## 🛠️ Technology Stack

-   **Framework**: React 18 (Create React App)
-   **Routing**: React Router v6
-   **HTTP Client**: Axios
-   **Style**: Vanilla CSS / Modules

## 📂 Directory Structure

```
src/
├── components/     # Reusable UI components (Buttons, Inputs)
├── context/        # React Context (AuthContext)
├── pages/          # Full page views (Home, Dashboard, Login)
├── utils/          # Helper functions and API config
├── App.js          # Main Application component
└── index.js        # Entry point
```

## 🔧 Environment Variables

Create a `.env` file in the `frontend/` directory. **Note**: React App variables must start with `REACT_APP_`.

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `REACT_APP_API_URL` | Base URL for the Backend API | `http://localhost:5000/api` |

## 🏃 Running Locally

1.  Navigate to the directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start development server:
    ```bash
    npm start
    ```
    This will open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Build for Production

To create an optimized production build:

```bash
npm run build
```

This creates a `build` folder ready to be deployed to static hosting (Netlify, Vercel, S3) or served via Nginx.
