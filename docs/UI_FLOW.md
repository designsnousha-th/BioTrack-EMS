# UI Flow & Screen Navigation: BioTrack EMS

This document describes the front-end user experience, the navigation hierarchy, screen relationships, and the modal/drawer triggers.

---

## 1. Screen Flow Diagram

```
                 [Login Screen (/login)]
                            │
                            ▼ (Auth Successful)
               ┌────────────┴────────────┐
               ▼                         ▼ (Sidebar Link Click)
      [Dashboard Page (/)]     [Settings Page (/settings)]
               │                         │
  ┌────────────┼───────────┬─────────────┼─────────────┬───────────┐
  ▼            ▼           ▼             ▼             ▼           ▼
[Customers] [Equipment] [Installations] [ServiceCalls] [PMCalendar] [Inventory]
(/customers) (/equipment) (/installations) (/service-calls) (/preventive-maintenance) (/inventory)
  │                                                                │
  └───────────────────────────────┬────────────────────────────────┘
                                  ▼
                         [Accounts (/accounts)]
```

---

## 2. Page Specifications

### A. Login Screen (`/login`)
*   **Purpose**: Validates email/password credentials.
*   **Flow**: Authenticates -> Saves tokens to `localStorage` -> Redirects to Dashboard.

### B. Dashboard Page (`/`)
*   **Purpose**: Operations overview hub.
*   **Widgets**: KPI cards, revenue charts, ticket distribution pie charts, recent activities sidebar.

### C. Equipment Catalog (`/equipment`)
*   **Purpose**: Central master catalog listing medical device models and technical details.
*   **Sub-flows**: Register Equipment Form (brand, category, model name, SKU series).

### D. Customer Directory (`/customers`)
*   **Purpose**: Manages hospital clients and contact details.
*   **Sub-flows**: Register Customer Drawer (includes multi-contact point entries form), Customer Details Modal.

### E. Equipment Installations (`/installations`)
*   **Purpose**: Logs machines configured at client centers.
*   **Sub-flows**: Displays QR code, records upcoming PM lists, and houses AMC contracts registers.

### F. Service Calls Page (`/service-calls`)
*   **Purpose**: Core dispatching and repair ticket closure module.
*   **Sub-flows**: Assign engineers -> complete logs -> signature canvas signoff.

### G. PM Calendar Screen (`/preventive-maintenance`)
*   **Purpose**: Calendar showing scheduled PM checks. Clicking PM events opens PM completion checklists.

### H. Spare Inventory (`/inventory`)
*   **Purpose**: Stockroom management, restock logs, pricing tracking.

### I. Accounts & Commercials (`/accounts`)
*   **Purpose**: Generating and reviewing invoices/quotations and downloading PDFs.

### J. Settings & User Admin (`/settings`)
*   **Purpose**: Administrative panels for employee accounts directory management (add/edit/delete logins and view current user profile credentials).
