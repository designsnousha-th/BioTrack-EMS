# BioTrack EMS (Biomedical Equipment Sales & Service SaaS)

An enterprise-grade, mobile-first Biomedical Equipment Sales & Service Management SaaS for organizations that install, maintain, and service biomedical equipment for clinics, hospitals, and medical laboratories.

---

## Technical Stack

*   **Frontend**: React 19, Vite, Tailwind CSS, Framer Motion, Lucide Icons, Recharts, React Router, TanStack Query, Axios, React Hook Form, Zod.
*   **Backend**: Node.js, NestJS, Prisma ORM, PostgreSQL 18, `@nestjs/cache-manager`, JWT Authentication, Passport, PDFKit (PDF generation).

---

## Project Structure

```
BioTrack EMS/
├── backend/                  # NestJS API application
│   ├── prisma/               # Prisma database schema & seeding scripts
│   ├── src/                  # NestJS TS controllers, services, guards
│   └── .env                  # Backend credentials config
├── frontend/                 # Vite + React client application
│   ├── src/                  # React JSX, contexts, hooks, pages
│   └── vite.config.ts        # Vite configuration
└── docker-compose.yml        # Docker production configuration
```

---

## Local Development Setup

### 1. Database Initialization
Ensure that your local PostgreSQL service is running. 

Inside the `backend/` directory, configure your `.env` connection URL (preconfigured for your system):
```env
DATABASE_URL="postgresql://postgres:design.nousha@localhost:5432/biotrack_ems?schema=public"
```

Create the database and push the database schema:
```bash
cd backend
npx prisma db push
```

### 2. Seed Mock Telemetry Data
Populate the database with default credentials, medical client lists, and spare parts logs:
```bash
npx prisma db seed
```

### 3. Run Backend API Server
Launch the NestJS developer watch daemon:
```bash
npm run start:dev
```
The API documentation is served at `http://localhost:3000`.

### 4. Run Frontend Client
Scaffold dependencies and boot the Vite development hot-reloading server:
```bash
cd ../frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## QA Test Credentials

All accounts are pre-seeded with the password: **`password123`**

| Role | Email Login | Scope Description |
| :--- | :--- | :--- |
| **Super Admin** | `superadmin@biotrack.com` | Unlimited root control, edit profiles & logs. |
| **Service Manager** | `servicemanager@biotrack.com` | Ticket assignment dispatch, inventory editing. |
| **Service Engineer** | `serviceengineer@biotrack.com` | Review personal queue, close calls, digital signature checks. |
| **Accounts** | `accounts@biotrack.com` | Quotations, billing invoices, marking paid status. |

---

## Production Deployment (Docker)

To launch the complete PostgreSQL 18, Redis 7, NestJS API, and Nginx React server network:
```bash
docker-compose up --build -d
```
The client dashboard will be available on port `80`.
