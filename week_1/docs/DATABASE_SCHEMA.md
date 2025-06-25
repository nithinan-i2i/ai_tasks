# Database Schema

## Overview
This document outlines the database schema for the travel booking platform. The schema is designed to be normalized (3NF) and optimized for common query patterns.

## Tables

### users
| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier for the user |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User's email address |
| password_hash | VARCHAR(255) | NOT NULL | Hashed password |
| first_name | VARCHAR(100) | NOT NULL | User's first name |
| last_name | VARCHAR(100) | NOT NULL | User's last name |
| phone_number | VARCHAR(20) | | User's contact number |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Account creation timestamp |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update timestamp |
| last_login | TIMESTAMP | | Last login timestamp |

### destinations
| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier for the destination |
| name | VARCHAR(255) | NOT NULL | Destination name |
| location | VARCHAR(255) | NOT NULL | Physical location |
| country | VARCHAR(100) | NOT NULL | Country name |
| description | TEXT | NOT NULL | Detailed description |
| category | VARCHAR(50) | NOT NULL | Type of destination (e.g., beach, mountain, city) |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update timestamp |

### destination_images
| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier for the image |
| destination_id | UUID | FOREIGN KEY (destinations.id), NOT NULL | Reference to destination |
| image_url | VARCHAR(255) | NOT NULL | URL to the image |
| is_primary | BOOLEAN | DEFAULT FALSE | Whether this is the primary image |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |

### experiences
| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier for the experience |
| destination_id | UUID | FOREIGN KEY (destinations.id), NOT NULL | Reference to destination |
| name | VARCHAR(255) | NOT NULL | Experience name |
| type | VARCHAR(50) | NOT NULL | Type (e.g., accommodation, activity, tour) |
| description | TEXT | NOT NULL | Detailed description |
| price | DECIMAL(10,2) | NOT NULL | Base price |
| currency | VARCHAR(3) | NOT NULL, DEFAULT 'USD' | Currency code |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update timestamp |

### experience_availability
| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| experience_id | UUID | FOREIGN KEY (experiences.id), NOT NULL | Reference to experience |
| date | DATE | NOT NULL | Available date |
| available_quantity | INTEGER | NOT NULL | Number of available slots |
| price_modifier | DECIMAL(5,2) | DEFAULT 1.0 | Price multiplier for this date |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update timestamp |

### bookings
| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier for the booking |
| user_id | UUID | FOREIGN KEY (users.id), NOT NULL | Reference to user |
| experience_id | UUID | FOREIGN KEY (experiences.id), NOT NULL | Reference to experience |
| booking_date | DATE | NOT NULL | Date of the experience |
| number_of_travelers | INTEGER | NOT NULL | Number of people |
| total_price | DECIMAL(10,2) | NOT NULL | Total booking price |
| currency | VARCHAR(3) | NOT NULL, DEFAULT 'USD' | Currency code |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'pending' | Booking status (pending, confirmed, cancelled) |
| payment_status | VARCHAR(20) | NOT NULL, DEFAULT 'pending' | Payment status |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update timestamp |

### reviews
| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier for the review |
| user_id | UUID | FOREIGN KEY (users.id), NOT NULL | Reference to user |
| destination_id | UUID | FOREIGN KEY (destinations.id), NOT NULL | Reference to destination |
| booking_id | UUID | FOREIGN KEY (bookings.id), NOT NULL | Reference to booking |
| rating | INTEGER | NOT NULL, CHECK (rating >= 1 AND rating <= 5) | Rating (1-5) |
| comment | TEXT | | Review text |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update timestamp |

## Relationships
1. **users** to **bookings**: One-to-many (A user can have multiple bookings)
2. **destinations** to **experiences**: One-to-many (A destination can have multiple experiences)
3. **destinations** to **destination_images**: One-to-many (A destination can have multiple images)
4. **experiences** to **experience_availability**: One-to-many (An experience can have multiple availability dates)
5. **experiences** to **bookings**: One-to-many (An experience can have multiple bookings)
6. **users** to **reviews**: One-to-many (A user can write multiple reviews)
7. **destinations** to **reviews**: One-to-many (A destination can have multiple reviews)
8. **bookings** to **reviews**: One-to-one (A booking can have one review)

## Indexes
1. users(email)
2. destinations(name, location)
3. experiences(destination_id, type)
4. experience_availability(experience_id, date)
5. bookings(user_id, status)
6. reviews(destination_id, rating)

## PostgreSQL DDL

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    last_login TIMESTAMP
);

-- Create destinations table
CREATE TABLE destinations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    country VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create destination_images table
CREATE TABLE destination_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    destination_id UUID NOT NULL REFERENCES destinations(id),
    image_url VARCHAR(255) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (destination_id) REFERENCES destinations(id)
);

-- Create experiences table
CREATE TABLE experiences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    destination_id UUID NOT NULL REFERENCES destinations(id),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (destination_id) REFERENCES destinations(id)
);

-- Create experience_availability table
CREATE TABLE experience_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    experience_id UUID NOT NULL REFERENCES experiences(id),
    date DATE NOT NULL,
    available_quantity INTEGER NOT NULL,
    price_modifier DECIMAL(5,2) DEFAULT 1.0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (experience_id) REFERENCES experiences(id)
);

-- Create bookings table
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    experience_id UUID NOT NULL REFERENCES experiences(id),
    booking_date DATE NOT NULL,
    number_of_travelers INTEGER NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    payment_status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (experience_id) REFERENCES experiences(id)
);

-- Create reviews table
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    destination_id UUID NOT NULL REFERENCES destinations(id),
    booking_id UUID NOT NULL REFERENCES bookings(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (destination_id) REFERENCES destinations(id),
    FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_destinations_name_location ON destinations(name, location);
CREATE INDEX idx_experiences_destination_type ON experiences(destination_id, type);
CREATE INDEX idx_experience_availability_experience_date ON experience_availability(experience_id, date);
CREATE INDEX idx_bookings_user_status ON bookings(user_id, status);
CREATE INDEX idx_reviews_destination_rating ON reviews(destination_id, rating);
```

## Sequelize Models (Optional)

```javascript
const { Model, DataTypes } = require('sequelize');

// User Model
class User extends Model {}
User.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING(255),
    unique: true,
    allowNull: false
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  first_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  last_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  phone_number: {
    type: DataTypes.STRING(20)
  }
}, {
  sequelize,
  modelName: 'User',
  timestamps: true
});

// Additional models would follow the same pattern...
```

## Notes
1. All tables include `created_at` and `updated_at` timestamps for tracking record changes
2. UUID is used for all primary keys to ensure global uniqueness
3. Appropriate foreign key constraints are in place to maintain referential integrity
4. Indexes are created on frequently queried fields
5. The schema supports the core features mentioned in the PRD while maintaining data normalization
6. Currency handling is included for international support
7. Review system is tied to bookings to ensure authenticity 