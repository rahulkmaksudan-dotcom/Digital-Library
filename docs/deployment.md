# Production & Cloud Deployment Guide
## Digital Library Management System
### Thakur Shree DPS College of Engineering and Management

---

## 1. Quick Local Execution (Zero Cloud Accounts Required)

The project runs completely locally out-of-the-box using the embedded in-memory H2 database.

### Prerequisites:
- Java 21 LTS installed (`java -version`)
- Node.js v20+ and npm (`node -v`)
- Apache Maven 3.9+ (`mvn -version`)

### Step 1: Start Backend (Port 8080)
```powershell
cd "d:\Library Management\backend"
mvn spring-boot:run
```
- Flyway automatically runs migrations `V1` to `V6`.
- DataInitializer synchronizes demo passwords and default accounts.
- API is ready at `http://localhost:8080/api/v1`.
- Swagger UI is at `http://localhost:8080/swagger-ui.html`.
- H2 Web Console is at `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:dpslibrary`).

### Step 2: Start Frontend (Port 5173)
```powershell
cd "d:\Library Management\frontend"
npm install
npm run dev
```
- Open browser at `http://localhost:5173`.

---

## 2. Production Deployment: Supabase PostgreSQL

1. Log in to [Supabase](https://supabase.com) and click **New Project**.
2. Name the project `thakur-dps-library-db` and generate a strong database password.
3. Select your preferred region (e.g. `ap-south-1` Mumbai or `us-east-1`).
4. In **Project Settings** -> **Database**, copy the **Transaction Connection String (URI)**:
   ```
   postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?sslmode=require
   ```
5. You do **not** need to manually execute SQL scripts in the Supabase SQL editor! When the Spring Boot backend boots with the `postgres` profile, Flyway automatically executes migrations `V1` through `V6`.

---

## 3. Production Deployment: Render (Full Stack)

1. Log in to [Render](https://render.com) and click **New** -> **Blueprint**.
2. Select this GitHub repository and the `main` branch. Render finds the root `render.yaml` and provisions the API, PostgreSQL database, and frontend together.
3. The Blueprint generates the JWT secret and securely wires database credentials; do not commit separate production secrets.
4. Verify the API at `https://thakur-dps-library-backend.onrender.com/api/v1/health` and open the site at `https://thakur-dps-library-web.onrender.com`.

If either Render service name is unavailable, rename it in `render.yaml` before creating the Blueprint, then update both the frontend `VITE_API_BASE_URL` and backend `CORS_ALLOWED_ORIGINS` values to the corresponding URLs.

---

## 4. Production Deployment: Vercel (Frontend Web App)

1. Log in to [Vercel](https://vercel.com) and click **Add New...** -> **Project**.
2. Import your GitHub repository.
3. In **Project Settings**:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. In **Environment Variables**, add:

| Variable Name | Value | Description |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `https://your-app.onrender.com/api/v1` | Render backend URL |

5. Click **Deploy**.
6. The `frontend/vercel.json` ensures all client-side paths (`/catalog`, `/student/dashboard`, `/librarian/issue`) route cleanly to `index.html`.

---

## 5. Container Orchestration: Docker Compose

To run the entire ecosystem (PostgreSQL 16, Spring Boot 3.3.4, React SPA with Nginx, and Adminer database viewer) with a single command:

```bash
docker-compose up --build -d
```

### Services Port Map:
- **Frontend UI:** `http://localhost:80` (or `http://localhost:3000`)
- **Backend API:** `http://localhost:8080`
- **PostgreSQL Database:** `localhost:5432`
- **Adminer DB GUI:** `http://localhost:8081`

To stop all containers:
```bash
docker-compose down
```
