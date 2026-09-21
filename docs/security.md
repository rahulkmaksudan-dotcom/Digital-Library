# Security Architecture & Data Protection
## Digital Library Management System
### Thakur Shree DPS College of Engineering and Management

---

## 1. Authentication Framework & Flow

The system employs stateless JSON Web Token (JWT) authentication built on Spring Security 6 and JJWT 0.12.5:

```
[User] --(1) POST /auth/login (identifier, password)--> [AuthController]
                                                               |
                                            (2) BCrypt Password Validation
                                                               |
[User] <-- (3) Return Bearer JWT (HS384) + User Profile <------+
  |
  +--(4) Subsequent Requests with "Authorization: Bearer <token>"
        |
        v
[JwtAuthenticationFilter] --> Validates Signature, Subject, Expiration
        |
        v
[SecurityContext] Populated with UserPrincipal & GrantedAuthorities
        |
        v
[@PreAuthorize("hasRole('ADMIN')")] Protected Controller Action
```

---

## 2. Password Security & BCrypt Hashing

- All passwords are encrypted using `BCryptPasswordEncoder(strength = 10)` before storage.
- Passwords cannot be decrypted or retrieved in plain text.
- Spring Boot `DataInitializer` synchronizes password hashes on startup, ensuring demo accounts function properly without risk of hash desynchronization.

---

## 3. JWT Claims & Expiration

Every issued JWT token contains:
- `sub`: User email address
- `userId`: Numeric database primary key
- `fullName`: Display name of student / staff member
- `studentId`: College Roll Number
- `role`: Authorization role string (`ADMIN`, `LIBRARIAN`, `FACULTY`, `STUDENT`)
- `iat`: Timestamp issued
- `exp`: Expiration timestamp (default: 24 hours / 86,400,000 milliseconds)

Tokens are digitally signed using HMAC-SHA384 with a secret key of at least 256 bits (`JWT_SECRET`).

---

## 4. Role-Based Access Control (RBAC) Matrix

| Resource / Function | STUDENT | FACULTY | LIBRARIAN | ADMIN |
| :--- | :---: | :---: | :---: | :---: |
| Search Catalog & View Books | Yes | Yes | Yes | Yes |
| Place Hold on Book | Yes | Yes | No | No |
| Add/Remove Favorites | Yes | Yes | No | No |
| View Personal Loans & Fines | Yes | Yes | No | No |
| Issue Book to Student | No | No | Yes | Yes |
| Process Book Return & Collect Fine | No | No | Yes | Yes |
| Manage Book Inventory & Copies | No | No | Yes | Yes |
| Review Book Requests | No | No | Yes | Yes |
| Upload Academic Resources | No | Yes | Yes | Yes |
| Approve / Reject Uploaded Resources| No | No | Yes | Yes |
| User Account Provisioning & Roles | No | No | No | Yes |
| Modify System Settings (Fine Rates)| No | No | No | Yes |
| Inspect Security Audit Logs | No | No | No | Yes |
| Export NAAC/NBA CSV Reports | No | No | Yes | Yes |

---

## 5. Security Audit Logging

All privileged and sensitive operations automatically generate an immutable audit log entry in the `audit_logs` table via `AuditLogService`:
- `LOGIN`: Authentication timestamps and client IP addresses
- `ISSUE_BOOK`: Which librarian issued what book to which student
- `RETURN_BOOK`: Return timestamp, days overdue, and recorded wear notes
- `PAY_FINE`: Cashier collections, payment channel (UPI/CASH), and transaction IDs
- `WAIVE_FINE`: Administrative waivers with mandatory justification notes
- `UPDATE_SETTING`: Modifications to college lending rules or daily fine rates
- `UPDATE_USER`: Account role escalations and deactivations

