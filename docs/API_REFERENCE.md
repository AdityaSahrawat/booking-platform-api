# Booking Platform REST API - API Reference

This document provides detailed specification for all REST API endpoints. All request and response formats utilize JSON payloads.

---

## Table of Contents
1. [Global Configuration](#1-global-configuration)
2. [Authentication Endpoints](#2-authentication-endpoints)
   - [POST /auth/register](#post-authregister)
   - [POST /auth/login](#post-authlogin)
3. [Services Endpoints](#3-services-endpoints)
   - [POST /services](#post-services)
   - [GET /services](#get-services)
   - [GET /services/:id](#get-servicesid)
   - [PATCH /services/:id](#patch-servicesid)
   - [DELETE /services/:id](#delete-servicesid)
4. [Bookings Endpoints](#4-bookings-endpoints)
   - [POST /bookings](#post-bookings)
   - [GET /bookings](#get-bookings)
   - [GET /bookings/:id](#get-bookingsid)
   - [PATCH /bookings/:id/status](#patch-bookingsidstatus)
   - [PATCH /bookings/:id/cancel](#patch-bookingsidcancel)

---

## 1. Global Configuration
- **Base Path Prefix:** `/api/v1`
- **Port:** `3000` (Default)
- **Content-Type:** `application/json`

---

## 2. Authentication Endpoints

### `POST /auth/register`
Registers a new user account in the system.

- **URL:** `/api/v1/auth/register`
- **HTTP Method:** `POST`
- **Authentication:** None (Public)
- **Request Headers:**
  - `Content-Type: application/json`
- **Request Body Parameters:**
  - `name` (String, Required): Display name of the user. Cannot be empty.
  - `email` (String, Required): Valid email format. Must be unique.
  - `password` (String, Required): Minimum 6 characters.
- **Validation Rules:**
  - `@IsNotEmpty()` on name.
  - `@IsEmail()` on email.
  - `@MinLength(6)` on password.
- **Responses:**
  - **201 Created**: Registration successful.
    - *Body Example*:
      ```json
      {
        "message": "User registered successfully",
        "user": {
          "id": 1,
          "name": "Jane Doe",
          "email": "jane@example.com",
          "createdAt": "2026-07-12T15:10:00.000Z",
          "updatedAt": "2026-07-12T15:10:00.000Z"
        }
      }
      ```
  - **400 Bad Request**: Validation failed (e.g. email invalid, password too short).
  - **409 Conflict**: Email already registered.
    - *Body Example*:
      ```json
      {
        "success": false,
        "statusCode": 409,
        "timestamp": "2026-07-12T15:10:05.123Z",
        "path": "/api/v1/auth/register",
        "message": "Email already exists"
      }
      ```

---

### `POST /auth/login`
Authenticates a user and returns a JWT access token.

- **URL:** `/api/v1/auth/login`
- **HTTP Method:** `POST`
- **Authentication:** None (Public)
- **Request Headers:**
  - `Content-Type: application/json`
- **Request Body Parameters:**
  - `email` (String, Required): Valid email structure.
  - `password` (String, Required): Minimum 6 characters.
- **Validation Rules:**
  - `@IsEmail()` on email.
  - `@MinLength(6)` on password.
- **Responses:**
  - **200 OK**: Login successful.
    - *Body Example*:
      ```json
      {
        "access_token": "eyJhbGciOiJIUzI1NiIsIn...",
        "token_type": "Bearer"
      }
      ```
  - **400 Bad Request**: Invalid email or password structure format.
  - **401 Unauthorized**: Invalid credentials (incorrect password or user does not exist).
    - *Body Example*:
      ```json
      {
        "success": false,
        "statusCode": 401,
        "timestamp": "2026-07-12T15:11:00.222Z",
        "path": "/api/v1/auth/login",
        "message": "Invalid credentials"
      }
      ```

---

## 3. Services Endpoints

### `POST /services`
Creates a new service in the system.

- **URL:** `/api/v1/services`
- **HTTP Method:** `POST`
- **Authentication:** Private (Requires JWT Bearer Token)
- **Request Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <JWT_TOKEN>`
- **Request Body Parameters:**
  - `title` (String, Required): Non-empty name of the service.
  - `description` (String, Required): Detailed service description.
  - `duration` (Number, Required): Positive integer representing duration in minutes.
  - `price` (Number, Required): Positive cost amount.
  - `isActive` (Boolean, Required): Catalog availability status.
- **Validation Rules:**
  - `@IsString()`, `@IsNotEmpty()` on title and description.
  - `@IsNumber()`, `@IsPositive()` on duration and price.
  - `@IsBoolean()` on isActive.
- **Responses:**
  - **201 Created**: Service created.
    - *Body Example*:
      ```json
      {
        "id": 1,
        "title": "Himalayan Hot Stone Therapy",
        "description": "Luxurious hot stone massage.",
        "duration": 90,
        "price": 2499,
        "isActive": true,
        "createdAt": "2026-07-12T15:20:00.000Z",
        "updatedAt": "2026-07-12T15:20:00.000Z"
      }
      ```
  - **401 Unauthorized**: Missing or invalid token.

---

### `GET /services`
Retrieves a list of all registered services.

- **URL:** `/api/v1/services`
- **HTTP Method:** `GET`
- **Authentication:** None (Public)
- **Responses:**
  - **200 OK**: Success. Returns a list of all services sorted by creation date descending.
    - *Body Example*:
      ```json
      [
        {
          "id": 1,
          "title": "Himalayan Hot Stone Therapy",
          "description": "Luxurious hot stone massage.",
          "duration": 90,
          "price": "2499.00",
          "isActive": true,
          "createdAt": "2026-07-12T15:20:00.000Z",
          "updatedAt": "2026-07-12T15:20:00.000Z"
        }
      ]
      ```

---

### `GET /services/:id`
Retrieves details of a single service by ID.

- **URL:** `/api/v1/services/:id`
- **HTTP Method:** `GET`
- **Authentication:** None (Public)
- **Path Parameters:**
  - `id` (Integer): Service primary key.
- **Responses:**
  - **200 OK**: Success.
    - *Body Example*:
      ```json
      {
        "id": 1,
        "title": "Himalayan Hot Stone Therapy",
        "description": "Luxurious hot stone massage.",
        "duration": 90,
        "price": "2499.00",
        "isActive": true,
        "createdAt": "2026-07-12T15:20:00.000Z",
        "updatedAt": "2026-07-12T15:20:00.000Z"
      }
      ```
  - **404 Not Found**: Service ID does not exist in the database.
    - *Body Example*:
      ```json
      {
        "success": false,
        "statusCode": 404,
        "timestamp": "2026-07-12T15:21:00.000Z",
        "path": "/api/v1/services/999",
        "message": "Service not found"
      }
      ```

---

### `PATCH /services/:id`
Updates fields of an existing service.

- **URL:** `/api/v1/services/:id`
- **HTTP Method:** `PATCH`
- **Authentication:** Private (Requires JWT Bearer Token)
- **Request Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <JWT_TOKEN>`
- **Path Parameters:**
  - `id` (Integer): Service ID to update.
- **Request Body Parameters:**
  - Partial object of `CreateServiceDto` fields (all fields are optional inside `UpdateServiceDto`).
- **Responses:**
  - **200 OK**: Service updated successfully.
    - *Body Example*:
      ```json
      {
        "id": 1,
        "title": "Himalayan Hot Stone Therapy",
        "description": "Updated description text.",
        "duration": 90,
        "price": "2699.00",
        "isActive": true,
        "createdAt": "2026-07-12T15:20:00.000Z",
        "updatedAt": "2026-07-12T15:25:00.000Z"
      }
      ```
  - **401 Unauthorized**: Missing/invalid credentials.
  - **404 Not Found**: Service does not exist.

---

### `DELETE /services/:id`
Deletes a service from the database.

- **URL:** `/api/v1/services/:id`
- **HTTP Method:** `DELETE`
- **Authentication:** Private (Requires JWT Bearer Token)
- **Request Headers:**
  - `Authorization: Bearer <JWT_TOKEN>`
- **Path Parameters:**
  - `id` (Integer): Service ID to delete.
- **Responses:**
  - **200 OK**: Deletion successful.
    - *Body Example*:
      ```json
      {
        "message": "Service deleted successfully"
      }
      ```
  - **401 Unauthorized**: Missing/invalid credentials.
  - **404 Not Found**: Service not found.

---

## 4. Bookings Endpoints

### `POST /bookings`
Creates a new customer booking.

- **URL:** `/api/v1/bookings`
- **HTTP Method:** `POST`
- **Authentication:** None (Public)
- **Request Headers:**
  - `Content-Type: application/json`
- **Request Body Parameters:**
  - `customerName` (String, Required): Customer name.
  - `customerEmail` (String, Required): Valid email address.
  - `customerPhone` (String, Required): Exactly 10 digits.
  - `serviceId` (Number, Required): Target service ID.
  - `bookingDate` (String, Required): ISO Date format `YYYY-MM-DD`.
  - `bookingTime` (String, Required): Time formatted in 24-hr `HH:MM`.
  - `notes` (String, Optional): Any client comments.
- **Validation Rules:**
  - `@Matches(/^\d{10}$/)` on customerPhone.
  - `@Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)` on bookingTime.
  - `@IsDateString()` on bookingDate.
- **Responses:**
  - **201 Created**: Booking successfully reserved.
    - *Body Example*:
      ```json
      {
        "customerName": "Aditya Sharma",
        "customerEmail": "aditya.sharma@gmail.com",
        "customerPhone": "9876543210",
        "serviceId": 1,
        "bookingDate": "2026-07-15",
        "bookingTime": "10:00",
        "notes": "Window-side room preferred.",
        "status": "PENDING",
        "id": 1,
        "createdAt": "2026-07-12T15:30:00.000Z",
        "updatedAt": "2026-07-12T15:30:00.000Z"
      }
      ```
  - **400 Bad Request**: Past date, invalid phone structure, or invalid time format.
  - **409 Conflict**: Slot duplicate booked (active booking exists for the same service, date, and time).

---

### `GET /bookings`
Retrieves a paginated list of bookings. Supporting filtering and query search.

- **URL:** `/api/v1/bookings`
- **HTTP Method:** `GET`
- **Authentication:** Private (Requires JWT Bearer Token)
- **Request Headers:**
  - `Authorization: Bearer <JWT_TOKEN>`
- **Query Parameters:**
  - `page` (Number, Optional): Page index (Default: `1`).
  - `limit` (Number, Optional): Records per page (Default: `10`).
  - `search` (String, Optional): Fuzzy searches `customerName`, `customerEmail`, or `customerPhone`.
  - `status` (Enum, Optional): Filter by booking status (`PENDING`, `CONFIRMED`, `COMPLETED`, `CANCELLED`).
- **Responses:**
  - **200 OK**: Success.
    - *Body Example*:
      ```json
      {
        "data": [
          {
            "id": 1,
            "customerName": "Aditya Sharma",
            "customerEmail": "aditya.sharma@gmail.com",
            "customerPhone": "9876543210",
            "bookingDate": "2026-07-15",
            "bookingTime": "10:00",
            "status": "PENDING",
            "notes": "Window-side room preferred.",
            "serviceId": 1,
            "service": {
              "id": 1,
              "title": "Himalayan Hot Stone Therapy",
              "price": "2499.00"
            }
          }
        ],
        "page": 1,
        "limit": 10,
        "total": 1,
        "totalPages": 1
      }
      ```
  - **401 Unauthorized**: Missing/invalid token.

---

### `GET /bookings/:id`
Retrieves details of a specific booking by ID.

- **URL:** `/api/v1/bookings/:id`
- **HTTP Method:** `GET`
- **Authentication:** Private (Requires JWT Bearer Token)
- **Request Headers:**
  - `Authorization: Bearer <JWT_TOKEN>`
- **Path Parameters:**
  - `id` (Integer): Booking ID to fetch.
- **Responses:**
  - **200 OK**: Success. Returns detailed booking object including nested relational service information.
  - **401 Unauthorized**: Missing/invalid credentials.
  - **404 Not Found**: Booking ID does not exist in database.

---

### `PATCH /bookings/:id/status`
Updates the status of a booking.

- **URL:** `/api/v1/bookings/:id/status`
- **HTTP Method:** `PATCH`
- **Authentication:** Private (Requires JWT Bearer Token)
- **Request Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <JWT_TOKEN>`
- **Path Parameters:**
  - `id` (Integer): Booking ID to modify.
- **Request Body Parameters:**
  - `status` (Enum, Required): Must be one of: `PENDING`, `CONFIRMED`, `COMPLETED`, `CANCELLED`.
- **Responses:**
  - **200 OK**: Status updated successfully.
  - **400 Bad Request**: Invalid transition (e.g. attempting to complete a cancelled booking).
  - **401 Unauthorized**: Missing/invalid credentials.

---

### `PATCH /bookings/:id/cancel`
Cancels a booking.

- **URL:** `/api/v1/bookings/:id/cancel`
- **HTTP Method:** `PATCH`
- **Authentication:** Private (Requires JWT Bearer Token)
- **Request Headers:**
  - `Authorization: Bearer <JWT_TOKEN>`
- **Path Parameters:**
  - `id` (Integer): Booking ID to cancel.
- **Responses:**
  - **200 OK**: Booking status transitioned to `CANCELLED` successfully.
  - **401 Unauthorized**: Missing/invalid credentials.
  - **404 Not Found**: Booking ID does not exist.
