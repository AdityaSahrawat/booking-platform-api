# Booking Platform REST API - Sequence Diagrams

This document contains UML sequence diagrams detailing transaction flows across the layers of the application.

---

## 1. User Registration Flow

```mermaid
sequenceDiagram
    autonumber
    actor Client
    participant AuthController
    participant AuthService
    participant UsersService
    participant UserRepository
    database Database

    Client->>AuthController: POST /auth/register (RegisterDto)
    Note over AuthController: ValidationPipe verifies inputs (DTO check)
    alt Validation Fails
        AuthController-->>Client: 400 Bad Request
    else Validation Passes
        AuthController->>AuthService: register(registerDto)
        AuthService->>UsersService: findByEmail(email)
        UsersService->>UserRepository: findOne(email)
        UserRepository->>Database: SELECT WHERE email = ?
        Database-->>UserRepository: User Record / Null
        UserRepository-->>UsersService: User Record / Null
        UsersService-->>AuthService: User Record / Null
        
        alt User Already Exists
            AuthService-->>AuthController: Throw ConflictException
            AuthController-->>Client: 409 Conflict
        else Email Available
            Note over AuthService: Hash password (bcrypt)
            AuthService->>UsersService: create(name, email, hashedPassword)
            UsersService->>UserRepository: save(userEntity)
            UserRepository->>Database: INSERT INTO users
            Database-->>UserRepository: Saved User Record
            UserRepository-->>UsersService: Saved User Record
            UsersService-->>AuthService: Saved User Record
            Note over AuthService: Exclude password from return payload
            AuthService-->>AuthController: User details (excl. password)
            AuthController-->>Client: 201 Created
        end
    end
```

---

## 2. User Authentication (Login) Flow

```mermaid
sequenceDiagram
    autonumber
    actor Client
    participant AuthController
    participant AuthService
    participant UsersService
    participant UserRepository
    database Database

    Client->>AuthController: POST /auth/login (LoginDto)
    Note over AuthController: ValidationPipe verifies email & password
    alt Validation Fails
        AuthController-->>Client: 400 Bad Request
    else Validation Passes
        AuthController->>AuthService: login(loginDto)
        AuthService->>UsersService: findByEmail(email)
        UsersService->>UserRepository: findOne(email)
        UserRepository->>Database: SELECT WHERE email = ?
        Database-->>UserRepository: User Record / Null
        UserRepository-->>UsersService: User Record / Null
        UsersService-->>AuthService: User Record / Null

        alt User Not Found
            AuthService-->>AuthController: Throw UnauthorizedException
            AuthController-->>Client: 401 Unauthorized
        else User Found
            Note over AuthService: Compare password using bcrypt
            alt Password Mis-match
                AuthService-->>AuthController: Throw UnauthorizedException
                AuthController-->>Client: 401 Unauthorized
            else Credentials Valid
                Note over AuthService: Sign JWT payload with secret
                AuthService-->>AuthController: { access_token, token_type }
                AuthController-->>Client: 200 OK
            end
        end
    end
```

---

## 3. Create Service Flow

```mermaid
sequenceDiagram
    autonumber
    actor Admin
    participant ServicesController
    participant JwtAuthGuard
    participant ServicesService
    participant ServiceRepository
    database Database

    Admin->>ServicesController: POST /services (CreateServiceDto, JWT Bearer Token)
    ServicesController->>JwtAuthGuard: canActivate(context)
    Note over JwtAuthGuard: Validate token signature & expiry
    alt Token Invalid / Missing
        JwtAuthGuard-->>Admin: 401 Unauthorized
    else Token Valid
        JwtAuthGuard-->>ServicesController: Allow access
        Note over ServicesController: ValidationPipe checks CreateServiceDto constraints
        alt Validation Fails
            ServicesController-->>Admin: 400 Bad Request
        else Validation Passes
            ServicesController->>ServicesService: create(createServiceDto)
            ServicesService->>ServiceRepository: create(s) & save(s)
            ServiceRepository->>Database: INSERT INTO services
            Database-->>ServiceRepository: Service persisted record
            ServiceRepository-->>ServicesService: Service persisted record
            ServicesService-->>ServicesController: Service object
            ServicesController-->>Admin: 201 Created
        end
    end
```

---

## 4. Create Booking Flow (Duplicate & Past Date Checked)

```mermaid
sequenceDiagram
    autonumber
    actor Client
    participant BookingsController
    participant BookingsService
    participant ServicesService
    participant BookingRepository
    database Database

    Client->>BookingsController: POST /bookings (CreateBookingDto)
    Note over BookingsController: ValidationPipe validates fields (Phone & Time format check)
    alt Validation Fails
        BookingsController-->>Client: 400 Bad Request
    else Validation Passes
        BookingsController->>BookingsService: create(dto)
        
        Note over BookingsService: Check if bookingDate is in the past
        alt Date is in Past
            BookingsService-->>BookingsController: Throw BadRequestException
            BookingsController-->>Client: 400 Bad Request
        else Date is Valid
            BookingsService->>ServicesService: findOne(serviceId)
            Note over ServicesService: Check service catalog existence
            alt Service not found
                ServicesService-->>BookingsService: Throw NotFoundException
                BookingsService-->>BookingsController: Forward exception
                BookingsController-->>Client: 404 Not Found
            else Service exists
                ServicesService-->>BookingsService: Service record
                
                Note over BookingsService: Check slot duplicates (status != CANCELLED)
                BookingsService->>BookingRepository: findOne(serviceId, Date, Time, status!=CANCELLED)
                BookingRepository->>Database: SELECT WHERE serviceId = ? AND Date = ? AND Time = ? AND status != 'CANCELLED'
                Database-->>BookingRepository: Booking / Null
                BookingRepository-->>BookingsService: Booking / Null
                
                alt Slot is Occupied
                    BookingsService-->>BookingsController: Throw ConflictException
                    BookingsController-->>Client: 409 Conflict
                else Slot Available
                    BookingsService->>BookingRepository: create(dto) & save(dto)
                    BookingRepository->>Database: INSERT INTO bookings (status='PENDING')
                    Database-->>BookingRepository: Persisted Booking Record
                    BookingRepository-->>BookingsService: Persisted Booking Record
                    BookingsService-->>BookingsController: Booking Record
                    BookingsController-->>Client: 201 Created
                end
            end
        end
    end
```

---

## 5. Update Booking Status Flow

```mermaid
sequenceDiagram
    autonumber
    actor Admin
    participant BookingsController
    participant JwtAuthGuard
    participant BookingsService
    participant BookingRepository
    database Database

    Admin->>BookingsController: PATCH /bookings/:id/status ({status}, JWT Bearer)
    BookingsController->>JwtAuthGuard: canActivate(context)
    alt Auth Fails
        JwtAuthGuard-->>Admin: 401 Unauthorized
    else Auth Success
        BookingsController->>BookingsService: updateStatus(id, dto)
        BookingsService->>BookingRepository: findOne(id)
        BookingRepository->>Database: SELECT WHERE id = ?
        Database-->>BookingRepository: Booking / Null
        BookingRepository-->>BookingsService: Booking / Null
        
        alt Booking Not Found
            BookingsService-->>BookingsController: Throw NotFoundException
            BookingsController-->>Admin: 404 Not Found
        else Booking Found
            Note over BookingsService: Check state rule: CANCELLED -> COMPLETED transition
            alt Transition Violates Rules
                BookingsService-->>BookingsController: Throw BadRequestException
                BookingsController-->>Admin: 400 Bad Request
            else Transition Allowed
                Note over BookingsService: Update status field
                BookingsService->>BookingRepository: save(updatedBooking)
                BookingRepository->>Database: UPDATE bookings SET status = ?
                Database-->>BookingRepository: Persisted updated record
                BookingRepository-->>BookingsService: Persisted updated record
                BookingsService-->>BookingsController: Updated Booking
                BookingsController-->>Admin: 200 OK
            end
        end
    end
```

---

## 6. Cancel Booking Flow

```mermaid
sequenceDiagram
    autonumber
    actor Admin
    participant BookingsController
    participant JwtAuthGuard
    participant BookingsService
    participant BookingRepository
    database Database

    Admin->>BookingsController: PATCH /bookings/:id/cancel (JWT Bearer)
    BookingsController->>JwtAuthGuard: canActivate(context)
    alt Auth Fails
        JwtAuthGuard-->>Admin: 401 Unauthorized
    else Auth Success
        BookingsController->>BookingsService: cancel(id)
        BookingsService->>BookingRepository: findOne(id)
        BookingRepository->>Database: SELECT WHERE id = ?
        Database-->>BookingRepository: Booking / Null
        BookingRepository-->>BookingsService: Booking / Null
        
        alt Booking Not Found
            BookingsService-->>BookingsController: Throw NotFoundException
            BookingsController-->>Admin: 404 Not Found
        else Booking Found
            Note over BookingsService: Set status to CANCELLED
            BookingsService->>BookingRepository: save(cancelledBooking)
            BookingRepository->>Database: UPDATE bookings SET status = 'CANCELLED'
            Database-->>BookingRepository: Persisted Booking
            BookingRepository-->>BookingsService: Persisted Booking
            BookingsService-->>BookingsController: Cancelled Booking
            BookingsController-->>Admin: 200 OK
        end
    end
```
