# Software Requirements Specification (SRS)
## Booking Platform REST API

**Project Version:** 1.0.0  
**Date:** July 12, 2026  
**Author:** Aditya Sahrawat  
**Organization:** EN2H Backend Engineering Internship  

---

## Revision History

| Date | Version | Description | Author |
| :--- | :--- | :--- | :--- |
| 2026-07-10 | 0.1.0 | Initial API Draft & Core Logic | Aditya Sahrawat |
| 2026-07-11 | 0.9.0 | Security, Validation, and Dockerization | Aditya Sahrawat |
| 2026-07-12 | 1.0.0 | Final Documentation & Seeding Configurations | Aditya Sahrawat |

---

## Table of Contents
1. [Introduction](#1-introduction)
2. [Purpose](#2-purpose)
3. [Scope](#3-scope)
4. [Intended Audience](#4-intended-audience)
5. [Technologies Used](#5-technologies-used)
6. [Overall Description](#6-overall-description)
7. [Actors](#7-actors)
8. [Functional Requirements](#8-functional-requirements)
9. [Non-Functional Requirements](#9-non-functional-requirements)
10. [System Architecture](#10-system-architecture)
11. [Database Design](#11-database-design)
12. [Business Rules](#12-business-rules)
13. [Validation Rules](#13-validation-rules)
14. [Authentication](#14-authentication)
15. [Error Handling](#15-error-handling)
16. [Assumptions & Constraints](#16-assumptions--constraints)
17. [Future Improvements](#17-future-improvements)

---

## 1. Introduction
Modern service businesses require automated systems to handle appointments, client data, and inventory operations. The **Booking Platform REST API** is designed as a backend system addressing these scheduling needs. By providing clean, structured endpoint interfaces, administrators can manage services and customers can query services and secure real-time slots without risk of schedule overlap.

## 2. Purpose
The purpose of this document is to establish a clear, comprehensive Software Requirements Specification (SRS) for the Booking Platform REST API. It defines both the functional operations (endpoint mappings, database transactions, validations) and the non-functional expectations (security parameters, response latency, environment structures) to serve as a complete blueprint for developers, reviewers, and quality assurance engineers.

## 3. Scope
This REST API serves as the central administrative backend for a spa or salon booking platform. The boundaries of this system include:
- **Authentication**: JWT-based user sign-up and authentication flow.
- **Service Management**: Adding, retrieving, editing, and deleting wellness services (such as massage, skincare, and therapy packages).
- **Booking Management**: Booking appointments, preventing double-bookings, listing appointments with support for query parameters, and cancelling/updating bookings.

The scope explicitly **excludes** any frontend graphical user interface (GUI), notification dispatch triggers (like email/SMS gateways), and payment processing gateways.

## 4. Intended Audience
This document is prepared for:
1. **Academic/Internship Reviewers**: To evaluate system architecture, validation constraints, and coding standards.
2. **Backend Developers**: To understand and extend core service and controller operations.
3. **Database Administrators**: To review PostgreSQL table constraints, relationships, and indexing logic.

## 5. Technologies Used
- **Runtime Environment**: Node.js (v20+)
- **Application Framework**: NestJS (v11.x)
- **Database Engine**: PostgreSQL (v15)
- **ORM Integration**: TypeORM (v1.x)
- **Documentation Engine**: Swagger (OpenAPI 3.0)
- **Containerization**: Docker & Docker Compose
- **Package Manager**: pnpm

---

## 6. Overall Description
The Booking Platform REST API is a modular backend service. It separates concerns into isolated components (Users, Auth, Services, Bookings) to keep logic maintainable. The application remains stateless by utilizing JWT tokens passed via the `Authorization: Bearer <token>` header for private admin-facing endpoints. Database configuration relies strictly on database migrations (`TypeORM Migrations`), enforcing a robust schema sync mechanism with `synchronize: false`.

---

## 7. Actors

### 7.1 Customer (Public User)
An unauthenticated or authenticated user who interacts with public-facing endpoints:
- Browses available spa services.
- Retrieves specific service details.
- Books appointments by submitting their contact information, booking date, time, and target service ID.

### 7.2 Administrator
An authenticated system user possessing an admin JWT token who can perform modifications:
- Add, update, or remove services from the system.
- Retrieve all booking records using search terms, pagination, or status filter queries.
- Transition booking statuses (e.g., from PENDING to CONFIRMED or COMPLETED).
- Cancel bookings.

---

## 8. Functional Requirements

### 8.1 User Authentication & Management
* **FR-1: User Registration**
  - **Description**: The system must allow new users to register.
  - **Inputs**: Name, Email, Password.
  - **Outputs**: Created user record (excluding password).
* **FR-2: User Login**
  - **Description**: The system must authenticate existing users and return a JWT access token.
  - **Inputs**: Email, Password.
  - **Outputs**: Access Token and Bearer token type.

### 8.2 Service Management
* **FR-3: Create Service (Admin Only)**
  - **Description**: Administrators can add a new wellness service to the catalogue.
  - **Inputs**: Title, Description, Duration (minutes), Price, isActive status.
  - **Outputs**: Full details of the newly created service entity.
* **FR-4: View All Services (Public)**
  - **Description**: Anyone can fetch the complete list of registered services.
  - **Outputs**: Array of all service objects.
* **FR-5: View Service by ID (Public)**
  - **Description**: Anyone can retrieve detailed information for a single service by ID.
  - **Inputs**: Service ID (integer).
  - **Outputs**: Service object details.
* **FR-6: Update Service (Admin Only)**
  - **Description**: Administrators can modify details of an existing service.
  - **Inputs**: Service ID (Param), partial body containing fields to update.
  - **Outputs**: Updated service object.
* **FR-7: Delete Service (Admin Only)**
  - **Description**: Administrators can remove a service from the database.
  - **Inputs**: Service ID.
  - **Outputs**: Deletion success message.

### 8.3 Booking Management
* **FR-8: Create Booking (Public)**
  - **Description**: Anyone can create a new booking for an active service.
  - **Inputs**: Customer Name, Customer Email, Customer Phone, Service ID, Booking Date (YYYY-MM-DD), Booking Time (HH:MM), Notes (optional).
  - **Outputs**: Created booking object with PENDING status.
* **FR-9: View Bookings with Queries (Admin Only)**
  - **Description**: Administrators can view paginated, searchable, and filtered list of bookings.
  - **Inputs**: `page`, `limit`, `search` (name, email, or phone), `status` (PENDING, CONFIRMED, COMPLETED, CANCELLED).
  - **Outputs**: Array of bookings matched, current page, limit, total count, and total pages.
* **FR-10: View Booking by ID (Admin Only)**
  - **Description**: Administrators can retrieve details of a specific booking by its ID.
  - **Inputs**: Booking ID.
  - **Outputs**: Booking details including relational service information.
* **FR-11: Update Booking Status (Admin Only)**
  - **Description**: Administrators can transition the status of an appointment.
  - **Inputs**: Booking ID, target status enum.
  - **Outputs**: Updated booking object.
* **FR-12: Cancel Booking (Admin Only)**
  - **Description**: Administrators can cancel a booking, freeing up the slot.
  - **Inputs**: Booking ID.
  - **Outputs**: Updated booking object with status CANCELLED.

---

## 9. Non-Functional Requirements

### 9.1 Performance
- **NFR-1.1**: The system must resolve duplicate booking check queries within 10ms. This is achieved by creating a composite database index on `("serviceId", "bookingDate", "bookingTime")`.
- **NFR-1.2**: All endpoints should return responses in under 200ms under ordinary network environments.

### 9.2 Security
- **NFR-2.1**: All administrative endpoints must be guarded using `JwtAuthGuard` mapping to a Bearer token verification strategy.
- **NFR-2.2**: User passwords must be encrypted using `bcrypt` (10 salt rounds) before database storage.
- **NFR-2.3**: Sensitive fields (like user passwords) must be excluded from JSON responses using the `@Exclude()` decorator from `class-transformer` and NestJS's `ClassSerializerInterceptor`.

### 9.3 Scalability
- **NFR-3.1**: The application is stateless, allowing multiple instances of the API to run concurrently behind a load balancer without configuration conflicts.

### 9.4 Validation
- **NFR-4.1**: Every request payload must be parsed and verified. Any invalid parameters must trigger a 400 Bad Request response containing detailed validation messages.
- **NFR-4.2**: Environment variables must match strict schemas on boot.

### 9.5 Logging
- **NFR-5.1**: NestJS default system loggers track route maps and container initializations.
- **NFR-5.2**: PostgreSQL daemon logs query executions, exceptions, and system status markers.

### 9.6 Database
- **NFR-6.1**: Direct schema auto-sync (`synchronize: true`) is prohibited.
- **NFR-6.2**: Database schema updates are managed strictly using TypeORM Migrations.

### 9.7 API Documentation
- **NFR-7.1**: Real-time OpenAPI documentation must be served via Swagger at `/api/v1/docs`.

---

## 10. System Architecture

```
Client (Postman, Browser, Frontend)
       │ (HTTP Request / JSON)
       ▼
 NestJS Controller Layer (Routes, Versioning, Swagger)
       │ (Request Payload Validation / JWT Authentication Guard)
       ▼
 NestJS Service Layer (Core Business Logic, Password Hashing)
       │ (TypeORM Repository Operations)
       ▼
 Database Access Layer (Data Source / Entity Repository mapping)
       │ (Query / Index utilization)
       ▼
 PostgreSQL Database (Table schemas, Constraints, Indices)
```

---

## 11. Database Design

The database schema is defined across three tables, all mapped via TypeORM.

### 11.1 Users Table (`users`)
Stores administrator and registered user credentials.

| Column | Data Type | Modifiers | Description |
| :--- | :--- | :--- | :--- |
| `id` | SERIAL (int) | PK, Not Null | Unique identifier for each user. |
| `name` | VARCHAR | Not Null | Display name of the user. |
| `email` | VARCHAR | Unique, Not Null | Email used for authentication. |
| `password` | VARCHAR | Not Null | Hashed password (Bcrypt). |
| `createdAt` | TIMESTAMP | Not Null, Default `now()` | Timestamp of registration. |
| `updatedAt` | TIMESTAMP | Not Null, Default `now()` | Timestamp of last edit. |

### 11.2 Services Table (`services`)
Stores the wellness and spa service details.

| Column | Data Type | Modifiers | Description |
| :--- | :--- | :--- | :--- |
| `id` | SERIAL (int) | PK, Not Null | Unique identifier for each service. |
| `title` | VARCHAR | Not Null | Title of the service. |
| `description` | TEXT | Not Null | Detailed description of the service. |
| `duration` | INT | Not Null | Duration of service in minutes. |
| `price` | DECIMAL(10,2) | Not Null | Cost of the service. |
| `isActive` | BOOLEAN | Not Null, Default `true` | Availability status. |
| `createdAt` | TIMESTAMP | Not Null, Default `now()` | Timestamp of creation. |
| `updatedAt` | TIMESTAMP | Not Null, Default `now()` | Timestamp of last edit. |

### 11.3 Bookings Table (`bookings`)
Stores customer booking requests.

| Column | Data Type | Modifiers | Description |
| :--- | :--- | :--- | :--- |
| `id` | SERIAL (int) | PK, Not Null | Unique identifier for the booking. |
| `customerName` | VARCHAR | Not Null | Name of the customer. |
| `customerEmail` | VARCHAR | Not Null | Email of the customer. |
| `customerPhone` | VARCHAR | Not Null | Exactly 10-digit phone number. |
| `bookingDate` | DATE | Not Null | Date of appointment (YYYY-MM-DD). |
| `bookingTime` | VARCHAR | Not Null | Time of appointment (HH:MM 24-hr format). |
| `status` | ENUM | Default `PENDING` | Status (`PENDING`, `CONFIRMED`, `COMPLETED`, `CANCELLED`). |
| `notes` | TEXT | Nullable | Optional instructions from the customer. |
| `serviceId` | INT | FK -> `services.id`, Cascade | Associated service ID. |
| `createdAt` | TIMESTAMP | Not Null, Default `now()` | Timestamp of creation. |
| `updatedAt` | TIMESTAMP | Not Null, Default `now()` | Timestamp of last edit. |

### 11.4 Indexes & Relationships
- **Composite Index**: `IDX_18881ff39e703e4863629ff7a7` is defined on `bookings("serviceId", "bookingDate", "bookingTime")`.
- **Foreign Key Constraint**: `bookings.serviceId` references `services.id`. If a service is deleted, all related bookings are automatically deleted (`ON DELETE CASCADE`).

---

## 12. Business Rules

1. **Past Date Prevention**: The `bookingDate` must represent the current date or a future date. Bookings for past dates are blocked with a `400 Bad Request` exception.
2. **Duplicate Booking Prevention**: Only one active booking (status NOT equal to `CANCELLED`) can exist for a specific `serviceId` at a specific `bookingDate` and `bookingTime`. If a matching slot is occupied, the API returns a `409 Conflict` exception.
3. **Status Progression Constraints**: If an appointment's status has been transitioned to `CANCELLED`, it can never be changed to `COMPLETED` directly. This restriction preserves data audit integrity.
4. **Privileged Configuration Management**: Regular users can create bookings and view services. Changing the service inventory catalogue (creation, update, removal) requires a valid authentication token.

---

## 13. Validation Rules

Validation constraints are enforced at the DTO layer:

| DTO Class | Field Name | Validation Decorators | Rules Enforced |
| :--- | :--- | :--- | :--- |
| **RegisterDto** | `name` | `@IsNotEmpty()` | Name string cannot be empty. |
| | `email` | `@IsEmail()` | Email must be a valid email structure. |
| | `password` | `@MinLength(6)` | Password must contain at least 6 characters. |
| **LoginDto** | `email` | `@IsEmail()` | Must be a valid email format. |
| | `password` | `@MinLength(6)` | Must be at least 6 characters. |
| **CreateServiceDto**| `title` | `@IsString()`, `@IsNotEmpty()` | Title string cannot be empty. |
| | `description` | `@IsString()`, `@IsNotEmpty()` | Description cannot be empty. |
| | `duration` | `@IsNumber()`, `@IsPositive()`| Must be a positive number. |
| | `price` | `@IsNumber()`, `@IsPositive()`| Must be a positive number. |
| | `isActive` | `@IsBoolean()` | Must be a boolean value. |
| **CreateBookingDto**| `customerName` | `@IsString()`, `@IsNotEmpty()` | Cannot be empty. |
| | `customerEmail` | `@IsEmail()` | Must be a valid email structure. |
| | `customerPhone`| `@IsString()`, `@Matches(/^\d{10}$/)`| Must be exactly 10 numeric digits. |
| | `serviceId` | `@IsInt()` | Must be an integer. |
| | `bookingDate` | `@IsDateString()` | Must match ISO Date string (YYYY-MM-DD). |
| | `bookingTime` | `@IsString()`, `@Matches(/^([01]\d\|2[0-3]):([0-5]\d)$/)`| Must be 24-hr `HH:MM` format. |
| | `notes` | `@IsOptional()`, `@IsString()`| Optional field. |
| **UpdateBookingStatusDto** | `status` | `@IsEnum(BookingStatus)` | Must be one of `PENDING`, `CONFIRMED`, `COMPLETED`, `CANCELLED`. |
| **QueryBookingDto** | `page` | `@IsOptional()`, `@Min(1)` | Optional page number (min 1, default 1). |
| | `limit` | `@IsOptional()`, `@Min(1)` | Optional records limit (min 1, default 10). |
| | `search` | `@IsOptional()`, `@IsString()` | Optional search term. |
| | `status` | `@IsOptional()`, `@IsEnum(BookingStatus)`| Optional status filter. |

---

## 14. Authentication
The authentication flow utilizes **JSON Web Tokens (JWT)**:
1. **Credentials Exchange**: The user POSTs email/password to `/auth/login`.
2. **Token Generation**: On success, the API signs a payload containing the user ID (`sub`) and email with `JWT_SECRET`, returning the token and a `token_type` of `Bearer`.
3. **Guarded Request Access**: For protected endpoints, the client attaches the JWT in the `Authorization: Bearer <token>` request header.
4. **Passport Strategy Verification**: The `JwtStrategy` interceptor extracts the token, validates the signature, and attaches the payload object to the Request (`req.user`) context.

---

## 15. Error Handling
Global exceptions are intercepted by a custom `HttpExceptionFilter` registered in `main.ts`.

- **Internal Server Errors (500)**: Any unhandled exception is caught and formatted to prevent implementation details from leaking.
- **REST Standard Responses**: Errors return a uniform JSON format:
```json
{
  "success": false,
  "statusCode": 409,
  "timestamp": "2026-07-12T15:11:34.903Z",
  "path": "/api/v1/bookings",
  "message": "Time slot already booked"
}
```

---

## 16. Assumptions & Constraints
- Database migrations must be run before startup.
- The environment configuration must define all Joi-required parameters (`DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_NAME`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`, `JWT_SECRET`).
- Datetime parameters must conform to UTC timezone standards to avoid scheduling conflicts across client applications.

---

## 17. Future Improvements
- **Role-Based Access Control (RBAC)**: Distinguish user registrations from admin accounts using `@Roles()` metadata.
- **Dynamic Overlap Checker**: Check appointment time against a service's `duration` instead of using static exact-time matches.
- **Mailing Notifications**: Automatically dispatch mail notifications to customers when a booking is created, approved, or cancelled.
