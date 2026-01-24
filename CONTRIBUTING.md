# Contributing to PreHire

Welcome to the PreHire project! We're excited to have you on board. This document will guide you through the process of contributing to our project.

## 👋 Welcome Interns!

This project is built to help candidates and recruiters connect efficiently. As you start working on this, please don't hesitate to ask questions if you get stuck.

## 🛠️ Getting Started

1.  **Fork the repository** to your own GitHub account.
2.  **Clone** the project to your local machine:
    ```bash
    git clone https://github.com/YOUR_USERNAME/prehire-app.git
    cd prehire-app
    ```
3.  **Install dependencies** for all services (see the main [README](README.md) for details).

## 🌿 Branching Strategy

We use a simple branching model to keep things organized:

-   `main` / `master`: This is the production-ready code. Do not push directly here!
-   `feature/your-feature-name`: Use this for new features (e.g., `feature/add-dark-mode`).
-   `fix/bug-description`: Use this for bug fixes (e.g., `fix/login-error`).
-   `docs/update-readme`: Use this for documentation updates.

**Example:**
```bash
git checkout -b feature/enhanced-resume-parsing
```

## 💻 Coding Standards

### General Used Technologies
-   **Frontend**: React (Functional Components, Hooks)
-   **Backend**: Node.js, Express
-   **Database**: MongoDB (Mongoose Schema)
-   **AI Service**: Node.js (independent service)

### Style Guide
-   **JavaScript/Node**: Use modern ES6+ syntax (const/let, arrow functions, async/await).
-   **React**:
    -   Keep components small and reusable.
    -   Use descriptive prop names.
    -   Avoid inline styles; use CSS modules or styled-components if applicable (currently using standard CSS).
-   **Comments**: Comment your code where complex logic exists. "Why" is more important than "What".

## 🚀 Submission Process (Pull Request)

1.  **Commit** your changes with a clear message:
    ```bash
    git commit -m "feat: implement file upload validation"
    ```
    *Use prefixes like `feat:`, `fix:`, `docs:`, `style:`, `refactor:`.*

2.  **Push** your branch:
    ```bash
    git push origin feature/your-feature-name
    ```

3.  **Open a Pull Request (PR)**:
    -   Go to the original repository on GitHub.
    -   Click "Compare & pull request".
    -   Fill out the PR template carefully.
    -   Request a review from your team lead or mentor.

## 🐛 Reporting Bugs

If you find a bug, please create a GitHub Issue with:
1.  Description of the bug.
2.  Steps to reproduce.
3.  Expected behavior vs. actual behavior.
4.  Screenshots (if valid).

Happy Coding! 🚀
