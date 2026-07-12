# Booking Platform REST API - Running Guide

This guide provides a step-by-step setup to build, execute, run database migrations, seed data, and run tests for the Booking Platform REST API.

---

## 1. Prerequisites
Before starting the setup, ensure you have the following installed on your local host:
- **Docker Desktop** (Daemon must be running)
- **Git**
- **Node.js** (v20+ recommended)
- **pnpm** (or **npm** / **yarn**)

---

## 2. Cloning the Repository
Execute the command below in your shell terminal to clone the project:
```bash
git clone https://github.com/AdityaSahrawat/booking-platform-api.git
cd booking-platform-api
```

---

## 3. Option A: Running with Docker Compose (Recommended)
This method launches both the database and the API inside Docker containers, mapping the necessary configurations automatically.

### Step 3.1: Start the Docker Containers
Run the build command to compile the codebase and pull dependencies:
```bash
docker compose up --build
```
*Note: Keep this terminal tab open to observe execution logs.*

### Step 3.2: Execute Database Migrations
Open a new terminal window and run the migrations inside the running API container to construct the schema tables:
```bash
docker compose exec api npm run migration:run
```

### Step 3.3: Seed Initial Data
Populate the database with the default administrator, 10 spa services, and 10 bookings:
```bash
docker compose exec api npm run seed
```

---

## 4. Option B: Running Locally (Directly on Host Machine)
If you prefer to run the database and node server directly on your host machine:

### Step 4.1: Install Node Dependencies
```bash
pnpm install
```

### Step 4.2: Configure Environment Variables
Create a local `.env` file in the project root:
```bash
cp .env.example .env
```
Open the `.env` file and define the configuration values:
```env
PORT=3000
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=booking_platform
JWT_SECRET=supersecretkey
JWT_EXPIRES_IN=1d
```
*Note: You must manually create the empty PostgreSQL database specified in `DATABASE_NAME` on your local server.*

### Step 4.3: Execute Migrations & Database Seeding
Execute the local scripts to apply migrations and seed tables:
```bash
# Run schema migrations
pnpm run migration:run

# Seed initial admin user and data
pnpm run seed
```

### Step 4.4: Start the Development Server
```bash
pnpm run start:dev
```

---

## 5. Verification & Testing

### 5.1 Swagger OpenAPI Documentation
Once the server is running (either via Docker or Locally), navigate to the following URL in your browser:
👉 **[http://localhost:3000/api/v1/docs](http://localhost:3000/api/v1/docs)**

This provides an interactive playground to test request validation, authorization headers, and response formats.

### 5.2 Seeded Admin Credentials
- **Email**: `admin@booking.com`
- **Password**: `Admin@123`

### 5.3 Quick Terminal curl Verification Tests

#### Test 5.3.1: Register a new customer account
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane.doe@gmail.com",
    "password": "password123"
  }'
```

#### Test 5.3.2: Log in as the Admin user
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@booking.com",
    "password": "Admin@123"
  }'
```
*Take note of the returned `"access_token"` string in the JSON payload.*

#### Test 5.3.3: Get all Bookings (Protected Endpoint)
```bash
curl -X GET "http://localhost:3000/api/v1/bookings?page=1&limit=5" \
  -H "Authorization: Bearer <INSERT_JWT_TOKEN_HERE>"
```

---

## 6. Troubleshooting & Common Issues

### Issue 6.1: Port Already in Use (Address already in use 0.0.0.0:5432 or :3000)
- **Problem**: Another local PostgreSQL daemon or Node process is already running on the required port.
- **Solution**:
  - Stop your local PostgreSQL service:
    ```bash
    sudo pg_ctlcli stop  # (On Linux/Mac)
    # Or stop the Postgres service in Windows Services
    ```
  - Or edit the port mappings inside the `docker-compose.yml` file to bind to alternative host ports.

### Issue 6.2: Docker Daemon Not Running
- **Problem**: Running `docker compose` returns `Cannot connect to the Docker daemon. Is the docker daemon running?`
- **Solution**: Open the **Docker Desktop** application on your host computer, wait for the engine state to show "Running", and execute the command again.

### Issue 6.3: Database already seeded
- **Problem**: Running `npm run seed` returns `Database already seeded.` and exits without modifying anything.
- **Solution**: The seed script checks the `users` table count. If you wish to wipe the database and re-seed from scratch, log into your postgres client and run `TRUNCATE TABLE users CASCADE;` then rerun the seed command.
