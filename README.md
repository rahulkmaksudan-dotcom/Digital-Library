# 📚 Digital Library Management System (DLMS)
### **Thakur Shree DPS College of Engineering and Management**

An institutional-grade, full-stack enterprise digital library and academic resources management web application designed and built for **Thakur Shree DPS College of Engineering and Management**.

---

## 👥 Project Engineering Team

| Name | Role | Responsibilities |
| :--- | :--- | :--- |
| **Ashish Yadav** | Lead Full-Stack Software Engineer | System Architecture, React Frontend, Database Design |
| **Rahul Yadav** | Backend Systems & Security Architect | Spring Boot 3 REST API, JWT Security, Flyway Migrations |
| **Priyanshu Yadav** | UI/UX Designer & DevOps Engineer | Tailwind CSS Design, Cloud Deployments, Docker & QA |

---

## 🏛️ Project Highlights & Features

- **Standard 10-Day Loan Policy:** Automated loan scheduling with student roll number lookup and physical inventory tracking.
- **Dynamic Overdue Fines:** Configurable late fees calculated at ₹2.00/day with cash collection, UPI simulator, and administrative waivers.
- **Academic Digital Repository:** Semester-wise engineering syllabi, lecture notes, lab manuals, and question papers for all branches.
- **Real-Time Reservation Queue:** Automatic waitlist management for checked-out textbooks with 3-day hold pickup window.
- **Automated Midnight Scheduler:** Spring Boot cron jobs monitoring 3-day and 1-day due alerts, updating overdue statuses, and expiring unclaimed holds.
- **Multi-Tenant Portals:** Dedicated functional dashboards for **Students**, **Faculty**, **Librarians**, and **Administrators**.
- **Accreditation Ready:** Built-in streaming CSV data exports for NAAC Criterion 4.2 and NBA Criterion 8 auditing.
- **Enterprise Security:** BCrypt password encryption, stateless JWT authentication (HS384), role-based method guards, and immutable audit logs.
- **Dual-Database Architecture:** Runs out-of-the-box locally on in-memory **H2 Database** without any cloud setup, and transitions seamlessly to cloud **Supabase PostgreSQL** for production.

---

## 🔑 Demo Access Credentials

The system initializes with ready-to-use seed accounts across all four institutional roles:

| Role | Login Identifier | Email Address | Password | Permissions |
| :--- | :--- | :--- | :--- | :--- |
| **Administrator** | `admin@dpslibrary.edu` | `admin@dpslibrary.edu` | `Admin@123` | System settings, user provisioning, audit logs, analytics |
| **Librarian** | `librarian@dpslibrary.edu` | `librarian@dpslibrary.edu` | `Librarian@123` | Circulation desk (issue/return), fines collection, approvals |
| **Faculty Member** | `faculty1@dpslibrary.edu` | `faculty1@dpslibrary.edu` | `Faculty@123` | Research borrowing, digital notes & lab manual uploads |
| **Student** | `DPS2023CS001` *(or email)* | `student1@dpslibrary.edu` | `Student@123` | Active loans, book holds, fine clearance, wishlist |

*Additional student accounts:* `student2@dpslibrary.edu` through `student10@dpslibrary.edu` with password `Student@123`.

---

## 🚀 Quick Start (Local Run - Zero Cloud Accounts Needed)

### Prerequisites
- **Java 21 LTS** (`java -version`)
- **Node.js v20+ & npm** (`node -v`)
- **Apache Maven 3.9+** (`mvn -version`)

### 1. Run the Spring Boot Backend (Port 8080)
```powershell
cd backend
mvn spring-boot:run
```
- Flyway automatically applies migrations `V1` through `V6`.
- Embedded H2 database initializes with 35 textbooks, 10 categories, 12 authors, and active loans.
- **API Base:** `http://localhost:8080/api/v1`
- **Interactive Swagger Docs:** `http://localhost:8080/swagger-ui.html`
- **H2 Database Console:** `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:dpslibrary`)

### 2. Run the React Frontend (Port 5173)
```powershell
cd frontend
npm install
npm run dev
```
- Open your browser at: **`http://localhost:5173`**

---

## 🐳 Docker Full-Stack Deployment

To run the entire ecosystem (PostgreSQL 16, Spring Boot API, React Nginx SPA, and Adminer DB Manager) in isolated containers:

```bash
docker-compose up --build -d
```

### Access URLs:
- **Web Application:** `http://localhost:80` (or `http://localhost:3000`)
- **REST API:** `http://localhost:8080/api/v1`
- **Adminer DB GUI:** `http://localhost:8081`

---

## ☁️ Cloud Production Deployment Guide

| Component | Target Cloud Provider | Config File |
| :--- | :--- | :--- |
| **Frontend SPA** | [Vercel](https://vercel.com) | [`frontend/vercel.json`](file:///d:/Library%20Management/frontend/vercel.json) |
| **Backend REST API** | [Render](https://render.com) | [`backend/render.yaml`](file:///d:/Library%20Management/backend/render.yaml) & [`backend/Dockerfile`](file:///d:/Library%20Management/backend/Dockerfile) |
| **Database** | [Supabase PostgreSQL](https://supabase.com) | [`backend/src/main/resources/application-postgres.yml`](file:///d:/Library%20Management/backend/src/main/resources/application-postgres.yml) |

For step-by-step instructions, see the complete [Production Deployment Guide](docs/deployment.md).

---

## 📖 Comprehensive Documentation Suite

- 📐 **[System Architecture & Design](docs/architecture.md):** Architectural patterns, component diagrams, and technology decisions.
- 🗄️ **[Database Schema & Migrations](docs/database.md):** ER diagram, table schemas, data dictionary, and Flyway migration sequence.
- 🔌 **[REST API Specification](docs/api.md):** Comprehensive catalog of 17 controllers, query params, and JSON payloads.
- 🚀 **[Deployment Guide](docs/deployment.md):** Step-by-step instructions for Vercel, Render, Supabase, and Docker.
- 🔒 **[Security & RBAC Matrix](docs/security.md):** Authentication lifecycle, BCrypt encryption, JWT claims, and audit logs.
- 🧪 **[Testing & Quality Assurance](docs/testing.md):** JUnit 5 test suites, Mockito test execution, and user flow verification.
- 📋 **[Project Completion Audit](PROJECT_STATUS.md):** Acceptance checklist, verified endpoints, and production sign-off.

---

## 📄 License & Attribution

Developed for **Thakur Shree DPS College of Engineering and Management** under academic project submission 2026. All rights reserved.

