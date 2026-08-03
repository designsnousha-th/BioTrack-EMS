# Project Overview: BioTrack EMS

BioTrack EMS is a specialized Equipment Management System (EMS) designed for medical technology suppliers to track hospital client directories, manage device installations, schedule preventive maintenance (PM) routines, track spare parts inventory, log technician service calls, and handle quotations and billing.

---

## 1. Business Purpose
The primary purpose of the application is to:
*   Streamline medical equipment distribution and tracking across healthcare facilities.
*   Ensure device uptime and patient safety through automated preventive maintenance calendars.
*   Optimize engineering resource dispatching and capture digital sign-offs for transparency.
*   Track commercial contracts (AMCs) and simplify the generation of repair billing/quotations.

---

## 2. Current Modules
1.  **Dashboard**: Operational summary widgets, monthly revenue trends, service call status splits, and a live timeline audit log feed.
2.  **Customers**: Directory of hospital clients and points of contact.
3.  **Installations**: Detailed log of physical machines configured at hospitals, including warranty cards and AMC contract attachments.
4.  **Service Calls**: Ticket dispatch module tracking faults, technician assignments, signature logs, and stock consumption.
5.  **PM Calendar**: Visually coordinates upcoming preventive maintenance checks for site engineers.
6.  **Inventory**: Spare parts store tracking min-stock alerts and pricing.
7.  **Accounts**: Quotations and invoices generator with PDF exports.
8.  **Equipment Catalog**: Master catalog template index of diagnostic medical devices.
9.  **Daily Reports**: Lightweight field logs detailing hospital visits, support calls, and daily progress.
10. **Settings**: Management of system user credentials and security accounts.

---

## 3. Navigation Structure
The left navigation sidebar links users to individual routes:
*   `Dashboard` -> `/`
*   `Equipment Catalog` -> `/equipment`
*   `Customers` -> `/customers`
*   `Daily Reports` -> `/daily-reports`
*   `Installations` -> `/installations`
*   `Service Calls` -> `/service-calls`
*   `PM Schedule` -> `/preventive-maintenance`
*   `Inventory` -> `/inventory`
*   `Accounts` -> `/accounts`
*   `Settings` -> `/settings`

---

## 4. User Roles & Layout Clearances
The system uses Role-Based Access Control (RBAC) to configure dashboard access:
*   `SUPER_ADMIN` / `ADMIN`: Unrestricted view and write permissions to all modules, including user administration.
*   `SERVICE_MANAGER` / `SERVICE_ENGINEER`: Management of installations, repair calls, and PM completion checklists.
*   `SALES_MANAGER` / `SALES_EXECUTIVE`: Management of customers, installations, and quotation drafts.
*   `ACCOUNTS`: Focuses on financial logs, invoices, and billing statuses.
*   `VIEWER`: Read-only access to operations boards.

---

## 5. Technology Stack
*   **Frontend**: React 19, TypeScript, TailwindCSS, Vite, TanStack Query v5, Axios, Recharts, React Hook Form, Zod.
*   **Backend**: NestJS, TypeScript, Prisma ORM, Passport JWT, bcrypt.
*   **Database**: PostgreSQL.
