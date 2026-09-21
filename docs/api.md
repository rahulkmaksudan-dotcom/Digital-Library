# REST API Documentation & Integration Specification
## Digital Library Management System
### Thakur Shree DPS College of Engineering and Management

---

## 1. Overview & Protocol Specification

- **Base URL (Local):** `http://localhost:8080/api/v1`
- **Base URL (Production):** `https://thakur-dps-library-api.onrender.com/api/v1`
- **Swagger UI Interactive Explorer:** `http://localhost:8080/swagger-ui.html`
- **OpenAPI 3.0 JSON Spec:** `http://localhost:8080/v3/api-docs`
- **Content-Type:** `application/json` (or `multipart/form-data` for resource uploads)
- **Authentication:** Standard HTTP Header `Authorization: Bearer <JWT_TOKEN>`

---

## 2. Standard Response Envelope

All API endpoints return responses in a standardized envelope:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

Paginated collections return a `PagedResponse`:
```json
{
  "success": true,
  "message": "Books retrieved successfully",
  "data": {
    "content": [ ... ],
    "page": 0,
    "size": 10,
    "totalElements": 35,
    "totalPages": 4,
    "last": false
  }
}
```

---

## 3. Endpoints Directory & Permissions

### A. Authentication & User Profile (`/auth`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/login` | Public | Authenticate with Email/Roll No & Password |
| `POST` | `/auth/register` | Public | Register new student library account |
| `GET` | `/auth/me` | Authenticated | Retrieve authenticated user profile |
| `PUT` | `/auth/profile` | Authenticated | Update phone, department, semester |
| `POST` | `/auth/forgot-password` | Public | Generate password reset token |
| `POST` | `/auth/reset-password` | Public | Set new password with valid token |

#### Example Login Request:
```json
POST /api/v1/auth/login
{
  "identifier": "DPS2023CS001",
  "password": "Student@123"
}
```

#### Example Login Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzM4NCJ9...",
    "type": "Bearer",
    "id": 5,
    "email": "student1@dpslibrary.edu",
    "studentId": "DPS2023CS001",
    "fullName": "Ashish Yadav",
    "role": "STUDENT",
    "department": "Computer Engineering"
  }
}
```

---

### B. Catalog & Books Management (`/books`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/books` | Public | Search catalog by title, author, ISBN, category |
| `GET` | `/books/{id}` | Public | Detailed book profile, location, availability |
| `GET` | `/books/featured` | Public | Top 8 popular and trending curriculum books |
| `POST` | `/books` | Librarian, Admin | Add new textbook to library inventory |
| `PUT` | `/books/{id}` | Librarian, Admin | Update title, shelf location, or copies |
| `DELETE` | `/books/{id}` | Librarian, Admin | Remove book from active inventory |

---

### C. Circulation & Book Loans (`/loans`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/loans` | Librarian, Admin | Master circulation log with status/user filters |
| `GET` | `/loans/my-loans` | Student, Faculty | List borrower's current active 10-day loans |
| `GET` | `/loans/my-history` | Student, Faculty | Complete archive of borrower's past loans |
| `GET` | `/loans/{id}` | Authenticated | View detailed loan transaction |
| `POST` | `/loans` | Librarian, Admin | Issue textbook (validates quota, sets 10-day due date) |
| `POST` | `/loans/{id}/return` | Librarian, Admin | Return book, check overdue days, collect fine |

#### Example Issue Book Request:
```json
POST /api/v1/loans
{
  "userId": 5,
  "bookId": 1,
  "loanDays": 10,
  "notes": "Issued for Sem 5 Data Structures practicals"
}
```

---

### D. Overdue Fines & Revenue (`/fines`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/fines` | Librarian, Admin | Complete overdue fines ledger with filters |
| `GET` | `/fines/my-fines` | Student, Faculty | View borrower's overdue fees and payment state |
| `POST` | `/fines/{id}/pay` | Authenticated | Record fine payment (CASH, ONLINE_UPI, CARD) |
| `POST` | `/fines/{id}/waive` | Librarian, Admin | Grant administrative waiver with justification |

---

### E. Book Reservations & Waitlists (`/reservations`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/reservations` | Librarian, Admin | View holds queue for all borrowed books |
| `GET` | `/reservations/my-reservations`| Student, Faculty | List active holds and pickup expiry dates |
| `POST` | `/reservations/{bookId}` | Student, Faculty | Place hold on currently checked-out book |
| `DELETE`| `/reservations/{id}` | Authenticated | Cancel hold and forfeit queue position |

---

### F. Digital Academic Resources (`/resources`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/resources/public` | Public | Search approved syllabi, question papers, notes |
| `GET` | `/resources` | Librarian, Admin | View all uploaded resources including pending |
| `POST` | `/resources/upload` | Authenticated | Upload PDF document (multipart/form-data) |
| `PATCH`| `/resources/{id}/status` | Librarian, Admin | Approve or reject uploaded resource |
| `GET` | `/resources/download/{file}` | Public | Stream and download PDF document |

---

### G. System Analytics, Reports & Audit Logs

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/analytics/overview` | Public | High-level campus stats for public landing page |
| `GET` | `/analytics/dashboard`| Librarian, Admin | Real-time circulation KPIs, loans, pending fines |
| `GET` | `/analytics/student` | Student | Personal dashboard metrics (active loans, holds) |
| `GET` | `/reports/export/{type}` | Librarian, Admin | Download UTF-8 CSV reports (books, loans, fines, users) |
| `GET` | `/audit-logs` | Admin | Complete immutable security event trail |
| `GET` | `/settings` | Admin | Manage dynamic loan duration and fine rate |
| `GET` | `/health` | Public | System status, college verification, team credits |

