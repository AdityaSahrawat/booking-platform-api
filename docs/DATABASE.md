# Booking Platform REST API - Database Specifications

This document outlines the database design, schema definitions, constraints, index structures, and schema migration strategies of the application.

---

## 1. Database Configuration Parameters
The database is a relational **PostgreSQL (v15)** database. The connection parameters are loaded asynchronously using environment variables validated by `joi` on NestJS bootstrap.
- **ORM Framework:** TypeORM (Active Record / Repository Pattern)
- **Schema Auto-Sync:** Disabled (`synchronize: false` in development/production)
- **Migrations Table:** `migrations`

---

## 2. Table Schemas

### 2.1 Users Table (`users`)
Stores registered administrators and users.

```sql
CREATE TABLE "users" (
  "id" SERIAL NOT NULL,
  "name" character varying NOT NULL,
  "email" character varying NOT NULL,
  "password" character varying NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
  CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
);
```

#### Fields Description:
- `id` (INT): Auto-incrementing primary key.
- `name` (VARCHAR): Full display name.
- `email` (VARCHAR): Unique email. Serves as the authentication username.
- `password` (VARCHAR): Hashed string (hashing performed via `bcrypt` with 10 salt rounds before persistence).
- `createdAt` (TIMESTAMP): Auto-generated timestamp on creation.
- `updatedAt` (TIMESTAMP): Auto-generated timestamp on record update.

---

### 2.2 Services Table (`services`)
Stores details of the available treatments and spa services.

```sql
CREATE TABLE "services" (
  "id" SERIAL NOT NULL,
  "title" character varying NOT NULL,
  "description" text NOT NULL,
  "duration" integer NOT NULL,
  "price" numeric(10,2) NOT NULL,
  "isActive" boolean NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_ba2d347a3168a296416c6c5ccb2" PRIMARY KEY ("id")
);
```

#### Fields Description:
- `id` (INT): Auto-incrementing primary key.
- `title` (VARCHAR): Name of the service.
- `description` (TEXT): Detailed service description.
- `duration` (INT): Treatment execution duration in minutes.
- `price` (DECIMAL(10,2)): Pricing formatted to 2 decimal places.
- `isActive` (BOOLEAN): Status indicating whether the service can currently be booked.
- `createdAt` (TIMESTAMP): Auto-generated timestamp on creation.
- `updatedAt` (TIMESTAMP): Auto-generated timestamp on last modification.

---

### 2.3 Bookings Table (`bookings`)
Tracks client booking requests and statuses.

```sql
CREATE TYPE "public"."bookings_status_enum" AS ENUM('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED');

CREATE TABLE "bookings" (
  "id" SERIAL NOT NULL,
  "customerName" character varying NOT NULL,
  "customerEmail" character varying NOT NULL,
  "customerPhone" character varying NOT NULL,
  "bookingDate" date NOT NULL,
  "bookingTime" character varying NOT NULL,
  "status" "public"."bookings_status_enum" NOT NULL DEFAULT 'PENDING',
  "notes" text,
  "serviceId" integer NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_bee6805982cc1e248e94ce94957" PRIMARY KEY ("id")
);
```

#### Fields Description:
- `id` (INT): Auto-incrementing primary key.
- `customerName` (VARCHAR): Name of the booking requester.
- `customerEmail` (VARCHAR): Email of the booking requester.
- `customerPhone` (VARCHAR): Exact 10-digit phone number.
- `bookingDate` (DATE): Apppointment date (parsed to standard SQL DATE format).
- `bookingTime` (VARCHAR): 24-hour time format `HH:MM`.
- `status` (ENUM): Can be `PENDING`, `CONFIRMED`, `COMPLETED`, or `CANCELLED`.
- `notes` (TEXT): Optional customer comments.
- `serviceId` (INT): Reference key to the associated `services.id`.
- `createdAt` (TIMESTAMP): Auto-generated timestamp on creation.
- `updatedAt` (TIMESTAMP): Auto-generated timestamp on last modification.

---

## 3. Database Constraints & Relationships

### 3.1 Foreign Key Constraint
The bookings table establishes a connection to the services table:
```sql
ALTER TABLE "bookings" 
ADD CONSTRAINT "FK_15a2431ec10d29dcd96c9563b65" 
FOREIGN KEY ("serviceId") REFERENCES "services"("id") 
ON DELETE CASCADE ON UPDATE NO ACTION;
```
- **CASCADE Delete:** If a service in the catalog is deleted, all historical booking reservations associated with that specific service are automatically deleted.

### 3.2 Indexing Structures
To maintain database performance under high volumes of booking slot validation requests, a composite index is defined:
```sql
CREATE INDEX "IDX_18881ff39e703e4863629ff7a7" ON "bookings" ("serviceId", "bookingDate", "bookingTime");
```
- **Rationale:** When check-duplication queries run, the PostgreSQL query optimizer uses this index to scan entries instead of performing expensive full-table scans.

---

## 4. Database Migration Strategy

### 4.1 Synchronize Set to False
We explicitly disable `synchronize: true` in our TypeORM connection settings:
```typescript
synchronize: false
```
*Why?* Auto-sync can lead to drop-table scenarios or column deletions at runtime, leading to data loss in production.

### 4.2 Database Migration Configuration
Migrations are written in TypeScript and compiled alongside the project.
- **Data Source Config:** Mapped in [data-source.ts](file:///Users/adityasahrawat/dev/projects/booking-platform-api/src/database/data-source.ts).
- **Migration Storage:** Located in `src/database/migrations/*.ts`.
- **Runtime Execution:** At runtime inside Docker, the compiled `.js` migrations under `dist/database/migrations/*.js` are picked up and executed using `migrationsRun: true` in `app.module.ts`.

### 4.3 Running Migrations

#### Generating Migrations
When entities are updated (e.g. adding new fields or indexes), run:
```bash
pnpm run migration:generate
```
This compares the existing code entities with the active database schema and outputs a TypeScript file containing `up()` and `down()` operations.

#### Applying Migrations
To execute the generated migration files and update the database:
```bash
pnpm run migration:run
```
This logs the executed steps inside the database `migrations` audit table.
