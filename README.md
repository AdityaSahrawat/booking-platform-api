# Booking Platform API

Backend REST API built with NestJS for the EN2H Backend Engineering Internship Assessment.

## Tech Stack

- NestJS
- PostgreSQL
- TypeORM
- JWT Authentication
- Swagger
- Class Validator

## Installation

```bash
git clone <repo-url>

cd booking-platform-api

npm install
```

## Configure Environment

Create

```
.env
```

using

```
.env.example
```

## Generate Migration

```bash
npm run migration:generate
```

## Run Migration

```bash
npm run migration:run
```

## Start

```bash
npm run start:dev
```

Swagger

```
http://localhost:3000/api/docs
```

## Authentication

```
POST /api/auth/register
POST /api/auth/login
```

Use returned JWT token

```
Authorization

Bearer <token>
```

## Services

```
POST /api/services

GET /api/services

GET /api/services/:id

PATCH /api/services/:id

DELETE /api/services/:id
```

## Bookings

```
POST /api/bookings

GET /api/bookings

GET /api/bookings/:id

PATCH /api/bookings/:id/status

PATCH /api/bookings/:id/cancel
```

## Features

- JWT Authentication
- CRUD Services
- Booking Management
- Validation
- Swagger
- Pagination
- Search
- Filter by Status
- Duplicate Booking Prevention
- Exception Handling
- PostgreSQL
