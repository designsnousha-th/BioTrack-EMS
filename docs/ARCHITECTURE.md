# System Architecture: BioTrack EMS

This document describes the technical architecture, security enforcement, state management patterns, and key dependencies.

---

## 1. High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                       CLIENT LAYER                          │
│                                                             │
│  React 19 App (Vite) ──> Axios Client ──> Local Storage     │
│       ▲                     │                               │
│       └──── TanStack Query ─┘                               │
└─────────────────────────────┬───────────────────────────────┘
                              │ HTTPS (JSON + Bearer JWT)
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       SERVER LAYER                          │
│                                                             │
│  NestJS API Engine                                          │
│   ├── Guards: JwtAuthGuard, RolesGuard                      │
│   └── Services: PrismaService, AccountsService (PDFKit)      │
└─────────────────────────────┬───────────────────────────────┘
                              │ Prisma Queries
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       DATA LAYER                            │
│                                                             │
│  PostgreSQL                                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Front-End Architecture (React + Vite)
*   **State Management**:
    *   *Server State*: Managed via **TanStack Query (React Query) v5** for caching and auto-invalidations.
    *   *Auth State*: Handled by **AuthContext** using local storage caches.
*   **API Client**: Axios with global interceptors handling request authorization headers and automated 401 token refreshes.

---

## 3. Back-End Architecture (NestJS)
*   **Modular Setup**: Grouped by features (e.g. `CustomersModule`, `ServiceCallsModule`) exposing controllers and dependency-injected services.
*   **Guards**: `JwtAuthGuard` checks passport jwt token signatures. `RolesGuard` restricts controllers based on user roles metadata.
*   **PDF Generation**: Uses `PDFKit` to compile and write invoice and quotation PDF files.

---

## 4. System Dependencies
*   **Backend**: `@nestjs/common`, `@prisma/client`, `passport-jwt`, `pdfkit`, `bcrypt`, `@nestjs/cache-manager`, `@nestjs/schedule`.
*   **Frontend**: `react` (v19), `react-router-dom`, `@tanstack/react-query`, `axios`, `recharts`, `react-hook-form`, `zod`, `tailwind-merge`.

---

## 5. Future Extension Points
*   **Real-time Alerts**: The unused `Notification` model can be wired to WebSockets.
*   **Cloud Signatures S3 Storage**: Store signature assets in AWS S3 buckets rather than base64 strings.
*   **Customer Logins Portal**: Add a Customer-specific layout so hospitals can log tickets directly.
