# Booking Platform REST API - Entity Class Diagram

This document contains the UML class diagram representing the system's database entity models.

---

## Class Diagram Representation

```mermaid
classDiagram
    direction LR

    class User {
        +number id
        +string name
        +string email
        +string password
        +Date createdAt
        +Date updatedAt
    }

    class Service {
        +number id
        +string title
        +string description
        +number duration
        +number price
        +boolean isActive
        +Booking[] bookings
        +Date createdAt
        +Date updatedAt
    }

    class Booking {
        +number id
        +string customerName
        +string customerEmail
        +string customerPhone
        +string bookingDate
        +string bookingTime
        +BookingStatus status
        +string notes
        +Service service
        +number serviceId
        +Date createdAt
        +Date updatedAt
    }

    class BookingStatus {
        <<enumeration>>
        PENDING
        CONFIRMED
        COMPLETED
        CANCELLED
    }

    Service "1" --o "*" Booking : has many
    Booking ..> BookingStatus : uses
```

---

## Attributes & Field Explanations

### 1. User
- **id**: Numeric serial primary key.
- **name**: User display name.
- **email**: Unique email index (acts as username).
- **password**: Excluded Bcrypt hash string.

### 2. Service
- **id**: Numeric serial primary key.
- **title**: Name of service package.
- **description**: Detailed text explanation.
- **duration**: Integer minutes.
- **price**: Cost formatted as a decimal.
- **isActive**: Catalog boolean availability toggle.

### 3. Booking
- **id**: Numeric serial primary key.
- **customerName**: Client contact name.
- **customerEmail**: Client email validation target.
- **customerPhone**: 10-digit phone format target.
- **bookingDate**: SQL DATE representation target.
- **bookingTime**: 24-hr `HH:MM` format target.
- **status**: Defaults to `PENDING`. Linked to `BookingStatus` enum.
- **notes**: Optional customer details.
- **serviceId**: FK pointing to `Service.id`. Cascade on delete.
