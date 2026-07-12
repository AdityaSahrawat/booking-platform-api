# Booking Platform REST API - Project Directory Structure

This document outlines the codebase organization and directory structure.

---

## 1. Directory Tree Representation
Below is the directory tree layout of the repository:

```
booking-platform-api/
├── docs/                                  # Project Documentation files
│   ├── images/                            # Draw.io editable XML diagram assets
│   ├── API_REFERENCE.md
│   ├── ARCHITECTURE.md
│   ├── CLASS_DIAGRAM.md
│   ├── DATABASE.md
│   ├── ER_DIAGRAM.md
│   ├── PROJECT_STRUCTURE.md
│   ├── RUNNING_GUIDE.md
│   ├── SEQUENCE_DIAGRAMS.md
│   └── SRS.md
│
├── src/                                   # Source root
│   ├── auth/                              # Authentication module
│   │   ├── dto/                           # Data Transfer Objects
│   │   │   ├── login.dto.ts
│   │   │   └── register.dto.ts
│   │   ├── auth.controller.ts             # Sign-up and login endpoints
│   │   ├── auth.module.ts                 # Passport & JWT integration
│   │   ├── auth.service.ts                # Bcrypt verification & token signing
│   │   └── jwt.strategy.ts                # JWT extraction strategy
│   │
│   ├── bookings/                          # Appointment reservation module
│   │   ├── dto/                           # Data Transfer Objects
│   │   │   ├── create-booking.dto.ts
│   │   │   ├── query-booking.dto.ts
│   │   │   └── update-booking-status.dto.ts
│   │   ├── entities/                      # TypeORM relational mapping schema
│   │   │   └── booking.entity.ts
│   │   ├── bookings.controller.ts         # Booking router endpoints
│   │   ├── bookings.module.ts
│   │   └── bookings.service.ts            # Slot overlap & business rules
│   │
│   ├── common/                            # Reusable architectural blocks
│   │   ├── decorators/
│   │   │   └── current-user.decorator.ts  # Custom param @GetUser decorator
│   │   ├── enums/
│   │   │   └── booking-status.enum.ts     # Status enum mapping definitions
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts   # Custom global Exception Filter
│   │   └── guards/
│   │       └── jwt-auth.guard.ts          # Relocated JWT protection guard
│   │
│   ├── database/                          # Database connection and data setup
│   │   ├── migrations/                    # Schema migrations
│   │   │   └── 1783696357880-Init.ts
│   │   ├── data-source.ts                 # TypeORM configuration dataSource
│   │   └── seed.ts                        # Seeding script
│   │
│   ├── services/                          # Spa treatments & packages module
│   │   ├── dto/
│   │   │   ├── create-service.dto.ts
│   │   │   └── update-service.dto.ts
│   │   ├── entities/
│   │   │   └── service.entity.ts
│   │   ├── services.controller.ts
│   │   ├── services.module.ts
│   │   └── services.service.ts
│   │
│   ├── users/                             # User entities & service function module
│   │   ├── entities/
│   │   │   └── user.entity.ts
│   │   ├── users.module.ts
│   │   └── users.service.ts
│   │
│   ├── app.controller.ts                  # General root controller
│   ├── app.module.ts                      # Main assembly entry point
│   ├── app.service.ts
│   └── main.ts                            # Bootstrap entry file
│
├── test/                                  # E2E testing directory
├── Dockerfile                             # NestJS multi-stage production Docker config
├── docker-compose.yml                     # PostgreSQL & API container configurations
├── package.json                           # Scripts and dependencies configurations
├── pnpm-lock.yaml                         # pnpm locked dependency versions
├── tsconfig.json                          # TypeScript configuration
└── tsconfig.build.json                    # NestJS compiler tsconfig details
```

---

## 2. Directory Explanations

### 2.1 `src/auth/`
Handles user sign-up and sign-in operations. Contains data validation DTOs (`login.dto.ts`, `register.dto.ts`), credentials checking operations, password hashing, and token issuance strategies.

### 2.2 `src/bookings/`
Manages customer reservation slots. The service logic performs slot check constraints (preventing overlaps), indexing rules lookup, search parsing, and paginated query results returning.

### 2.3 `src/services/`
Manages the catalogue of treatments available for scheduling. Exposes CRUD routes controlled by authentication guards.

### 2.4 `src/users/`
Contains the database representation details of users and basic find-by-email methods for checking duplicate email registrations.

### 2.5 `src/common/`
Stores shared classes used across multiple modules, including custom decorators (`@GetUser()`), shared status enums, route authentication guards (`jwt-auth.guard.ts`), and global exception filter interceptors.

### 2.6 `src/database/`
Houses data-source configurations, migrations files tracking database changes, and seeding logic that initializes admin accounts and sample bookings.

---

## 3. Modular Configuration
The codebase is structured around NestJS's modular design:
- **Imports:** Dependency modules declare imports (e.g. `BookingsModule` imports `ServicesModule`).
- **Exports:** Inter-module sharing is handled explicitly. For example, `ServicesModule` exports `TypeOrmModule` and `ServicesService` to allow other modules to resolve repositories and helper methods.
- **Global Pipes and Filters:** Mounted on boot inside `main.ts` to keep controllers clean.
- **Config & Validation:** Enforced globally at application startup.
