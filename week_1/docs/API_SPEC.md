# API Specification

## Overview
This document outlines the REST API endpoints for the travel booking platform. The API follows RESTful principles and uses JSON for request/response bodies.

## Base URL
```
https://api.travelbooking.com/v1
```

## Authentication
- JWT (JSON Web Token) based authentication
- Token format: `Bearer <token>`
- Token expiration: 24 hours
- Refresh token mechanism available

## Common Headers
```
Content-Type: application/json
Accept: application/json
Authorization: Bearer <token>  # Required for authenticated endpoints
```

## Common Query Parameters
- `limit`: Number of records to return (default: 20, max: 100)
- `offset`: Number of records to skip (default: 0)
- `sortBy`: Field to sort by (default: created_at)
- `sortOrder`: Sort order (asc/desc, default: desc)

## Common Error Responses
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {} // Optional additional error details
  }
}
```

Common HTTP Status Codes:
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 422: Validation Error
- 429: Too Many Requests
- 500: Internal Server Error

## Endpoints

### Authentication Module

#### Register User
- **Path**: `POST /auth/register`
- **Description**: Create a new user account
- **Authentication**: None
- **Request Body**:
```json
{
  "email": "string",
  "password": "string",
  "firstName": "string",
  "lastName": "string",
  "phoneNumber": "string" // optional
}
```
- **Success Response**: 201 Created
```json
{
  "user": {
    "id": "uuid",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "phoneNumber": "string",
    "createdAt": "timestamp"
  },
  "token": "string"
}
```

#### Login
- **Path**: `POST /auth/login`
- **Description**: Authenticate user and get access token
- **Authentication**: None
- **Request Body**:
```json
{
  "email": "string",
  "password": "string"
}
```
- **Success Response**: 200 OK
```json
{
  "user": {
    "id": "uuid",
    "email": "string",
    "firstName": "string",
    "lastName": "string"
  },
  "token": "string",
  "refreshToken": "string"
}
```

### Destinations Module

#### List Destinations
- **Path**: `GET /destinations`
- **Description**: Get paginated list of destinations
- **Authentication**: None
- **Query Parameters**:
  - `search`: Search term for name/location
  - `category`: Filter by category
  - `country`: Filter by country
- **Success Response**: 200 OK
```json
{
  "destinations": [
    {
      "id": "uuid",
      "name": "string",
      "location": "string",
      "country": "string",
      "category": "string",
      "description": "string",
      "images": [
        {
          "id": "uuid",
          "url": "string",
          "isPrimary": "boolean"
        }
      ],
      "averageRating": "number"
    }
  ],
  "pagination": {
    "total": "number",
    "limit": "number",
    "offset": "number"
  }
}
```

#### Get Destination Details
- **Path**: `GET /destinations/{id}`
- **Description**: Get detailed information about a destination
- **Authentication**: None
- **Path Parameters**:
  - `id`: Destination UUID
- **Success Response**: 200 OK
```json
{
  "id": "uuid",
  "name": "string",
  "location": "string",
  "country": "string",
  "category": "string",
  "description": "string",
  "images": [
    {
      "id": "uuid",
      "url": "string",
      "isPrimary": "boolean"
    }
  ],
  "experiences": [
    {
      "id": "uuid",
      "name": "string",
      "type": "string",
      "price": "number",
      "currency": "string"
    }
  ],
  "reviews": [
    {
      "id": "uuid",
      "rating": "number",
      "comment": "string",
      "user": {
        "id": "uuid",
        "firstName": "string",
        "lastName": "string"
      },
      "createdAt": "timestamp"
    }
  ],
  "averageRating": "number"
}
```

### Experiences Module

#### List Experiences
- **Path**: `GET /experiences`
- **Description**: Get paginated list of experiences
- **Authentication**: None
- **Query Parameters**:
  - `destinationId`: Filter by destination
  - `type`: Filter by experience type
  - `minPrice`: Minimum price
  - `maxPrice`: Maximum price
  - `date`: Filter by availability date
- **Success Response**: 200 OK
```json
{
  "experiences": [
    {
      "id": "uuid",
      "name": "string",
      "type": "string",
      "description": "string",
      "price": "number",
      "currency": "string",
      "destination": {
        "id": "uuid",
        "name": "string",
        "location": "string"
      },
      "availability": [
        {
          "date": "date",
          "availableQuantity": "number",
          "priceModifier": "number"
        }
      ]
    }
  ],
  "pagination": {
    "total": "number",
    "limit": "number",
    "offset": "number"
  }
}
```

#### Get Experience Details
- **Path**: `GET /experiences/{id}`
- **Description**: Get detailed information about an experience
- **Authentication**: None
- **Path Parameters**:
  - `id`: Experience UUID
- **Success Response**: 200 OK
```json
{
  "id": "uuid",
  "name": "string",
  "type": "string",
  "description": "string",
  "price": "number",
  "currency": "string",
  "destination": {
    "id": "uuid",
    "name": "string",
    "location": "string",
    "country": "string"
  },
  "availability": [
    {
      "date": "date",
      "availableQuantity": "number",
      "priceModifier": "number"
    }
  ],
  "reviews": [
    {
      "id": "uuid",
      "rating": "number",
      "comment": "string",
      "user": {
        "id": "uuid",
        "firstName": "string",
        "lastName": "string"
      },
      "createdAt": "timestamp"
    }
  ],
  "averageRating": "number"
}
```

### Bookings Module

#### Create Booking
- **Path**: `POST /bookings`
- **Description**: Create a new booking
- **Authentication**: JWT Required
- **Request Body**:
```json
{
  "experienceId": "uuid",
  "bookingDate": "date",
  "numberOfTravelers": "number"
}
```
- **Success Response**: 201 Created
```json
{
  "id": "uuid",
  "experience": {
    "id": "uuid",
    "name": "string",
    "type": "string"
  },
  "bookingDate": "date",
  "numberOfTravelers": "number",
  "totalPrice": "number",
  "currency": "string",
  "status": "string",
  "paymentStatus": "string",
  "createdAt": "timestamp"
}
```

#### List User Bookings
- **Path**: `GET /bookings`
- **Description**: Get paginated list of user's bookings
- **Authentication**: JWT Required
- **Query Parameters**:
  - `status`: Filter by booking status
  - `startDate`: Filter by booking date range start
  - `endDate`: Filter by booking date range end
- **Success Response**: 200 OK
```json
{
  "bookings": [
    {
      "id": "uuid",
      "experience": {
        "id": "uuid",
        "name": "string",
        "type": "string"
      },
      "bookingDate": "date",
      "numberOfTravelers": "number",
      "totalPrice": "number",
      "currency": "string",
      "status": "string",
      "paymentStatus": "string",
      "createdAt": "timestamp"
    }
  ],
  "pagination": {
    "total": "number",
    "limit": "number",
    "offset": "number"
  }
}
```

#### Get Booking Details
- **Path**: `GET /bookings/{id}`
- **Description**: Get detailed information about a booking
- **Authentication**: JWT Required
- **Path Parameters**:
  - `id`: Booking UUID
- **Success Response**: 200 OK
```json
{
  "id": "uuid",
  "experience": {
    "id": "uuid",
    "name": "string",
    "type": "string",
    "description": "string",
    "price": "number",
    "currency": "string",
    "destination": {
      "id": "uuid",
      "name": "string",
      "location": "string"
    }
  },
  "bookingDate": "date",
  "numberOfTravelers": "number",
  "totalPrice": "number",
  "currency": "string",
  "status": "string",
  "paymentStatus": "string",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

#### Cancel Booking
- **Path**: `POST /bookings/{id}/cancel`
- **Description**: Cancel an existing booking
- **Authentication**: JWT Required
- **Path Parameters**:
  - `id`: Booking UUID
- **Success Response**: 200 OK
```json
{
  "id": "uuid",
  "status": "cancelled",
  "updatedAt": "timestamp"
}
```

### Reviews Module

#### Create Review
- **Path**: `POST /reviews`
- **Description**: Create a new review for a destination
- **Authentication**: JWT Required
- **Request Body**:
```json
{
  "destinationId": "uuid",
  "bookingId": "uuid",
  "rating": "number",
  "comment": "string"
}
```
- **Success Response**: 201 Created
```json
{
  "id": "uuid",
  "rating": "number",
  "comment": "string",
  "user": {
    "id": "uuid",
    "firstName": "string",
    "lastName": "string"
  },
  "createdAt": "timestamp"
}
```

#### List Destination Reviews
- **Path**: `GET /destinations/{id}/reviews`
- **Description**: Get paginated list of reviews for a destination
- **Authentication**: None
- **Path Parameters**:
  - `id`: Destination UUID
- **Query Parameters**:
  - `rating`: Filter by rating
- **Success Response**: 200 OK
```json
{
  "reviews": [
    {
      "id": "uuid",
      "rating": "number",
      "comment": "string",
      "user": {
        "id": "uuid",
        "firstName": "string",
        "lastName": "string"
      },
      "createdAt": "timestamp"
    }
  ],
  "pagination": {
    "total": "number",
    "limit": "number",
    "offset": "number"
  }
}
```

## Security Notes

### Rate Limiting
- Authentication endpoints: 5 requests per minute
- Other endpoints: 60 requests per minute
- Rate limit headers included in responses:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`

### Input Validation
- All input is validated against schemas
- Maximum lengths enforced for text fields
- Numeric ranges enforced for ratings and prices
- Date formats must be ISO 8601

### Security Headers
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

### CORS
- Allowed origins: Configured per environment
- Allowed methods: GET, POST, PUT, DELETE, OPTIONS
- Allowed headers: Content-Type, Authorization, Accept
- Max age: 86400 seconds 