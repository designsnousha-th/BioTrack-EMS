# API Endpoints Documentation: BioTrack EMS

All APIs use JSON payloads. Secured endpoints require a valid JWT token in the `Authorization: Bearer <token>` header.

---

## 1. Authentication (`/auth`)

### POST `/auth/login`
*   **Request**: `{ "email": "user@example.com", "password": "password123" }`
*   **Response (200 OK)**:
    ```json
    {
      "accessToken": "eyJhbGciOi...",
      "refreshToken": "eyJhbGciOi...",
      "user": { "id": 1, "email": "user@example.com", "name": "Admin Name", "role": "SUPER_ADMIN" }
    }
    ```

### POST `/auth/refresh`
*   **Request**: `{ "refreshToken": "eyJhbGciOi..." }`
*   **Response (200 OK)**: New access and refresh token pair.

### GET `/auth/profile`
*   **Response (200 OK)**: Authenticated user details.

---

## 2. Customer Management (`/customers`)

### GET `/customers`
*   **Query Params**: `search` (optional), `state` (optional).
*   **Response (200 OK)**: List of hospitals.

### POST `/customers`
*   **Request**: `{ "name": "Fortis", "address": "Delhi", "district": "New Delhi", "state": "Delhi", "pin": "110001", "contacts": [...] }`
*   **Response (201 Created)**: Created Customer object.

---

## 3. Equipment & Installations (`/installations`)

### GET `/installations`
*   **Response (200 OK)**: List of installed machines with customer and catalog model details.

### POST `/installations`
*   **Request**: `{ "customerId": 1, "machineId": 2, "installationDate": "2026-08-01T00:00:00Z", "warrantyYears": 2 }`
*   **Response (201 Created)**: Saved installation record.

---

## 4. Service Calls & PMs (`/service-calls`, `/pms`)

### GET `/service-calls`
*   **Response (200 OK)**: List of dispatched repair tickets.

### PUT `/service-calls/:id`
*   **Request**: Observation remarks, labor charges, travel charges, parts consumed, and sign-offs.
*   **Response (200 OK)**: Updated ticket state.

### GET `/pms`
*   **Response (200 OK)**: Overdue and upcoming maintenance check lists.

---

## 5. Billing & Invoices (`/accounts`)

### POST `/accounts/invoices`
*   **Request**: Customer details, completed repair call links, and cost details.
*   **Response (201 Created)**: Generates invoice records and stores the output PDF locally.

---

## 6. Daily Activity Reports (`/daily-reports`)

### POST `/daily-reports`
*   **Authentication**: Bearer Token
*   **Request**: `{ "workCompleted": "Fixed ultrasound", "problems": "Transducers out of stock", "tomorrowPlan": "Visit City Heart", "hospitalVisits": ["Metro Clinic"], "meetings": [], "calls": [] }`
*   **Response (201 Created)**: Created DailyReport record.

### GET `/daily-reports`
*   **Authentication**: Bearer Token
*   **Response (200 OK)**: List of reports (Engineers see their own logs; Managers see all employees' logs).

### PUT `/daily-reports/:id/review`
*   **Authentication**: Bearer Token (Roles: `SUPER_ADMIN`, `ADMIN`, `SERVICE_MANAGER`, `SALES_MANAGER`)
*   **Request**: `{ "status": "REVIEWED", "reviewRemarks": "Checked and approved" }`
*   **Response (200 OK)**: Updated DailyReport record with manager's review.
