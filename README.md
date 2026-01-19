# Support Ticket Management System

A robust, full-stack solution for managing customer support tickets, featuring a secure REST API and a custom admin dashboard.

## Quick Start

### Prerequisites
- Node.js (v18+)
- PostgreSQL (or Docker to run it)

### Local Setup
1.  **Clone & Install**
    ```bash
    git clone <your-repo-url>
    cd Support\ Ticket\ Management\ System
    npm install
    ```

2.  **Environment Setup**
    Create a `.env` file in the root directory:
    ```env
    PORT=3000
    DATABASE_URL="postgresql://user:password@localhost:5432/stms_db"
    JWT_SECRET="super_secret_key_change_me"
    # Optional: SMTP for Real Emails (Defaults to Ethereal Mock)
    # SMTP_HOST=smtp.gmail.com ...
    ```

3.  **Database Migration & Seeding**
    ```bash
    npx prisma migrate dev --name init
    node prisma/seed.js
    ```
    *Seed Admin*: `john@example.com` / `SecurePass123`

4.  **Run**
    ```bash
    npm start
    ```
    Visit `http://localhost:3000` to log in.

### Docker Setup
```bash
docker build -t stms-app .
docker run -p 3000:3000 --env-file .env stms-app
```

---

## Tech Stack & Key Decisions

### **Backend: Node.js + Express**
*   **Why**: Industry standard for building scalable, non-blocking APIs.
*   **Alternatives**: Python/Flask (slower for high concurrency), Go (higher dev learning curve).

### **Database: PostgreSQL + Prisma**
*   **Why**: Postgres is the most reliable open-source relational database. Prisma provides type safety and simplifies complex joins (e.g., getting a ticket with its author and comments).
*   **Trade-off**: Requires a running DB instance (unlike SQLite), making local setup slightly heavier but production-ready.

### **Frontend: Vanilla JS + TailwindCSS**
*   **Why**: Prioritized **simplicity and speed**. Avoided the build-step complexity of React/Next.js to focus on the core logic and backend robustness.
*   **Trade-off**: As the dashboard grows, manual DOM manipulation (e.g., `document.createElement`) becomes hard to maintain.

### **Authentication: JWT (JSON Web Tokens)**
*   **Why**: Stateless authentication scales better than sessions for REST APIs and mobile clients.

---

## Trade-offs & Priorities

### What I Prioritized
1.  **Security (RBAC)**: Ensuring Customers can't see internal notes or other users' tickets was a P0 requirement.
2.  **API Design**: Built a clean, RESTful structure (`/api/v1/resources`) that can support any future frontend (Mobile App, React Dashboard).
3.  **Deployment Readiness**: Switched from SQLite to Postgres and added Docker to ensure the app is not just a "localhost only" demo.

### What is Missing (Trade-offs)
1.  **Backend Validation**: Currently manual checks. Ideally, I would use `zod` or `joi` for strict request body validation.
2.  **Frontend Framework**: A framework like React would make the dashboard state management (e.g., updating the ticket list after a comment) much smoother.
3.  **Real Email Service**: Currently uses Ethereal (Mock). Creating a real SendGrid/AWS SES account was out of scope.
4.  **Automated Tests**: Added basic shell scripts, but a full Jest/Supertest suite is needed for production confidence.

## Future Improvements
If I had more time, I would:
1.  **Migrate Frontend to Next.js**: For better routing, server-side rendering, and cleaner component code.
2.  **Add Real-time Features**: Use `Socket.io` to update the dashboard instantly when a new ticket arrives.
3.  **Unit & Integration Tests**: Replace the `.sh` scripts with a proper CI/CD test pipeline.
4.  **File Attachments**: Allow users to upload screenshots with their tickets (using AWS S3 or local storage).
