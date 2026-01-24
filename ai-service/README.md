# AI Resume Parsing Microservice

This independent service is responsible for the "heavy lifting" of resume parsing. It accepts files and returns structured JSON data derived from the document content.

## 🛠️ Technology Stack

-   **Runtime**: Node.js
-   **Core Libraries**: `pdf-parse`, `mammoth` (for DOCX)
-   **NLP**: Custom regex-based extraction logic

## 📂 Directory Structure

```
.
├── enhancedParser.js   # Main parsing logic (Singleton class)
├── server.js           # API Server entry point
└── package.json        # Dependencies
```

## 🔧 Environment Variables

Create a `.env` file in the `ai-service/` directory:

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `PORT` | Service port | `3001` |

## 🚀 API Endpoints

-   `POST /api/parse-resume`: Accepts a file upload and returns text/JSON.

## 🏃 Running Locally

1.  Navigate to the directory:
    ```bash
    cd ai-service
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start development server:
    ```bash
    npm run dev
    ```
    Service will run on `http://localhost:3001`.
