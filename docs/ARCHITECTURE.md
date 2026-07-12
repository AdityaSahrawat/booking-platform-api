# Booking Platform REST API - Architectural Design Document

This document describes the architectural layout, modular boundaries, and flow of data across the layers of the NestJS application.

---

## 1. Modular High-Level Architecture
The application follows a modular monolith structure using standard NestJS boundaries. Concerns are segregated into core modules:

```
                  ┌─────────────────────────────────┐
                  │           AppModule             │
                  └───────┬─────┬─────┬──────┬──────┘
                          │     │     │      │
      ┌───────────────────┘     │     │      └───────────────────┐
      ▼                         ▼     ▼                          ▼
┌───────────┐             ┌──────────────┐                 ┌─────────────┐
│ConfigModule│             │  AuthModule  │                 │UsersModule  │
└───────────┘             └──────┬───────┘                 └─────────────┘
                                 │
                                 ▼
┌───────────┐             ┌──────────────┐
│TypeOrmMod.│             │ServicesModule│
└───────────┘             └──────┬───────┘
                                 │
                                 ▼
                          ┌──────────────┐
                          │BookingsModule│
                          └──────────────┘
```

- **AppModule:** Root module. Orchestrates configurations, database bootstrap, and dependencies.
- **ConfigModule:** Handles Joi-validated environment configurations.
- **TypeOrmModule:** Configures connection options to PostgreSQL, mapping entities and migration configurations.
- **UsersModule:** Manages User database schemas and service functions.
- **AuthModule:** Manages credential validation, bcrypt hashing, and JWT signing/verification.
- **ServicesModule:** Handles spa and wellness package operations.
- **BookingsModule:** Manages customer booking slot validation, indexing checks, and status workflow transitions.

---

## 2. Multi-Layer Design

The application enforces a separation of concerns using a layered design:

```
[ Client Request ] 
       │
       ▼
┌────────────────────────────────────────────────────────┐
│ 1. Presentation Layer (Controllers)                    │
│    - Endpoints matching /api/v1 prefix                 │
│    - Routing, Versioning, and HTTP Method mappings     │
│    - Serializes output payloads via ClassSerializer   │
│    - Defines Swagger schemas & OpenAPI documentation   │
└──────────────────────┬─────────────────────────────────┘
                       │ (Valid DTO)
                       ▼
┌────────────────────────────────────────────────────────┐
│ 2. Security & Guard Interceptors                       │
│    - Verifies JWT Signature via Passport-JWT strategy  │
│    - Enforces JwtAuthGuard on private operations       │
│    - Injects req.user payload context                  │
└──────────────────────┬─────────────────────────────────┘
                       │ (Authenticated Context)
                       ▼
┌────────────────────────────────────────────────────────┐
│ 3. Validation Layer (Pipes)                            │
│    - Global ValidationPipe automatically parses input  │
│    - Enforces Class Validator constraints on DTO DTOs   │
└──────────────────────┬─────────────────────────────────┘
                       │ (Sanitized Inputs)
                       ▼
┌────────────────────────────────────────────────────────┐
│ 4. Business Logic Layer (Services)                     │
│    - Coordinates domain queries and repository writes  │
│    - Applies business rules (checks double-bookings)   │
│    - Encrypts credentials with bcrypt                  │
│    - Throws standard Nest HTTP exceptions on errors    │
└──────────────────────┬─────────────────────────────────┘
                       │ (ORM Queries)
                       ▼
┌────────────────────────────────────────────────────────┐
│ 5. Data Access Layer (Repositories)                    │
│    - Database operations mapped via TypeORM            │
│    - Manages Entity transactions                       │
│    - Utilizes database constraints & indices           │
└────────────────────────────────────────────────────────┘
```

### 2.1 Presentation Layer (Controllers)
Controllers are the entry points for HTTP requests. They handle path mapping (`@Controller('services')`), request parsing (`@Body()`, `@Param()`, `@Query()`), serialization interceptors (e.g. `@Exclude()`), and Swagger decoration. 
*Controllers do not contain business logic.* They delegate operations to the Service Layer.

### 2.2 Security Layer (Guards & Strategies)
Ensures restricted access to privileged endpoints.
- **JwtAuthGuard:** Automatically checks if incoming requests contain a valid bearer token under the authorization header.
- **JwtStrategy:** Parses the JWT signature, verifies expiration, and appends the decoded user context (`sub`, `email`) onto the Request object (`req.user`).

### 2.3 Validation Layer (Pipes)
- **ValidationPipe:** Regulates incoming request data. It strips properties not defined in the DTO (`whitelist: true`), rejects requests containing undeclared fields (`forbidNonWhitelisted: true`), and auto-converts types (e.g. string parameters to integer types: `transform: true`).

### 2.4 Business Logic Layer (Services)
The core logic resides within Service classes (`AuthService`, `ServicesService`, `BookingsService`). Services:
- Validate input requirements (e.g., matching passwords, preventing bookings in past dates).
- Check business constraints (e.g., verifying if a booking time-slot is already occupied by query checks on Active bookings).
- Throw granular HTTP Exceptions (like `ConflictException`, `NotFoundException`, or `BadRequestException`).

### 2.5 Data Access Layer (Repositories & Database)
Integrates TypeORM to abstract SQL syntax. This layer:
- Maps JavaScript objects directly onto relational Postgres schemas.
- Manages transactional boundaries.
- Executes query builder operations (e.g., pagination skips, fuzzy ILIKE searches).
- Implements table indexes (such as the composite index on the bookings schema) to maintain fast search lookups.

---

## 3. Cross-Cutting Concerns

### 3.1 Exception Handling Flow
A custom `HttpExceptionFilter` is mounted globally to format error payloads uniformly:
1. An exception is thrown during service execution.
2. The global filter intercepts the exception.
3. It parses the exception status, message, request URL, and current timestamp.
4. It returns a structured JSON payload to the client, preventing database raw connection exceptions from leaking to client interfaces.

### 3.2 Serialization Interceptors
To avoid exposing hashed passwords, `ClassSerializerInterceptor` is registered globally. When an entity is returned, the interceptor automatically processes the `@Exclude()` decorators on database properties, ensuring high-security data boundaries.
