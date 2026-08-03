# TODO & Technical Debt: BioTrack EMS

This document tracks identified bugs, incomplete abstractions, and technical debt in the baseline application.

---

## 1. Incomplete Features
*   **Application-wide Audit Logging**: The database has an `AuditLog` table, but there is no service or interceptor to write actions to it during CRUD operations.
*   **Notification Engine**: The `Notification` schema model remains unused; a notifications dispatch module is required.
*   **File Storage Service**: Upload paths for documents (invoices, signatures, POs) are saved as text fields but lack a dedicated disk storage service (like Multer or S3).

---

## 2. Identified Bugs
*   **PM Scheduling Overlaps**: When updating installations, regenerating PM schedules can result in duplication if completed PMs are not filtered correctly from the recalculations sequence.

---

## 3. Technical Debt
*   **Hardcoded Fallback Secrets**: JWT secrets fall back to default hardcoded strings in code if environment configurations are missing.
*   **No PDF Cleanup**: Invoices and quotations generated locally in `backend/uploads/` are never pruned, which will consume disk space.
*   **Lack of Test Coverage**: Codebase does not contain unit or integration tests for core logic (e.g. warranty expirations calculations, invoice tax rates).
