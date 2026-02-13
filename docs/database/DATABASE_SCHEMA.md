# Database Schema Documentation

## Overview

This document describes the database schema for the Lottery App, including both SQL and Firestore implementations.

## Database Tables/Collections

### 1. Users

**Purpose**: Store user account information and preferences

**Fields**:

- `id` (String): Unique user identifier
- `email` (String): User's email address (unique)
- `firstName` (String): User's first name
- `lastName` (String): User's last name
- `role` (Enum): User role (USER, VENDOR, ADMIN)
- `language` (String): Preferred language (en, fr)
- `currency` (String): Preferred currency (USD, EUR)
- `phoneNumber` (String): Phone number for verification
- `isPhoneVerified` (Boolean): Phone verification status
- `isEmailVerified` (Boolean): Email verification status
- `profileImage` (String): Profile picture URL
- `dateOfBirth` (Date): User's birth date
- `address` (Text): User's address
- `preferences` (JSON): User preferences and settings
- `createdAt` (Timestamp): Account creation date
- `updatedAt` (Timestamp): Last update date
- `lastLoginAt` (Timestamp): Last login timestamp
- `isActive` (Boolean): Account active status

**Indexes**: email, role, language

### 2. Categories

**Purpose**: Organize products and games by category

**Fields**:

- `id` (String): Unique category identifier
- `name` (String): Category name
- `description` (Text): Category description
- `icon` (String): Category icon (emoji or icon name)
- `color` (String): Category color (hex code)
- `isActive` (Boolean): Category active status
- `sortOrder` (Integer): Display order
- `parentCategoryId` (String): Parent category reference
- `image` (String): Category image URL
- `createdAt` (Timestamp): Creation date
- `updatedAt` (Timestamp): Last update date

**Indexes**: name, isActive, sortOrder

### 3. Products

**Purpose**: Store product information for prizes

**Fields**:

- `id` (String): Unique product identifier
- `name` (String): Product name
- `description` (Text): Product description
- `categoryId` (String): Category reference
- `brand` (String): Product brand
- `model` (String): Product model
- `price` (Decimal): Current price
- `currency` (String): Price currency
- `originalPrice` (Decimal): Original price
- `discountPercentage` (Integer): Discount percentage
- `images` (JSON): Product image URLs
- `specifications` (JSON): Technical specifications
- `features` (JSON): Product features
- `isActive` (Boolean): Product active status
- `stockQuantity` (Integer): Available stock
- `weight` (Decimal): Product weight
- `dimensions` (JSON): Product dimensions
- `tags` (JSON): Product tags
- `createdAt` (Timestamp): Creation date
- `updatedAt` (Timestamp): Last update date

**Indexes**: name, categoryId, brand, price, isActive

### 4. Games

**Purpose**: Store lottery game information

**Fields**:

- `id` (String): Unique game identifier
- `title` (String): Game title
- `description` (Text): Game description
- `categoryId` (String): Category reference
- `type` (Enum): Game type (daily, weekly, monthly, special)
- `status` (Enum): Game status (DRAFT, ACTIVE, DRAWING, CLOSED, CANCELLED)
- `ticketPrice` (Decimal): Price per ticket
- `maxParticipants` (Integer): Maximum participants
- `currentParticipants` (Integer): Current participant count
- `totalPrizePool` (Decimal): Total prize value
- `currency` (String): Prize currency
- `startDate` (Timestamp): Game start date
- `endDate` (Timestamp): Game end date
- `drawDate` (Timestamp): Drawing date
- `rules` (JSON): Game rules
- `images` (JSON): Game images
- `isPromoted` (Boolean): Promotion status
- `viewCount` (Integer): View count
- `createdBy` (String): Creator user reference
- `createdAt` (Timestamp): Creation date
- `updatedAt` (Timestamp): Last update date

**Indexes**: title, categoryId, status, type, startDate, endDate, createdBy, isPromoted

### 5. Prizes

**Purpose**: Store prize information for games

**Fields**:

- `id` (String): Unique prize identifier
- `gameId` (String): Game reference
- `name` (String): Prize name
- `description` (Text): Prize description
- `value` (Decimal): Prize value
- `currency` (String): Prize currency
- `type` (Enum): Prize type (PRODUCT, CASH, GIFT_CARD, EXPERIENCE)
- `productId` (String): Product reference (if applicable)
- `image` (String): Prize image URL
- `quantity` (Integer): Available quantity
- `isActive` (Boolean): Prize active status
- `sortOrder` (Integer): Display order
- `createdAt` (Timestamp): Creation date
- `updatedAt` (Timestamp): Last update date

**Indexes**: gameId, type, value, isActive

### 6. Tickets

**Purpose**: Store user ticket purchases

**Fields**:

- `id` (String): Unique ticket identifier
- `gameId` (String): Game reference
- `userId` (String): User reference
- `ticketNumber` (String): Unique ticket number
- `status` (Enum): Ticket status (ACTIVE, WINNER, EXPIRED, CANCELLED)
- `purchaseDate` (Timestamp): Purchase date
- `price` (Decimal): Ticket price
- `currency` (String): Price currency
- `paymentMethod` (String): Payment method used
- `transactionId` (String): Payment transaction ID
- `isPaid` (Boolean): Payment status
- `createdAt` (Timestamp): Creation date
- `updatedAt` (Timestamp): Last update date

**Indexes**: gameId, userId, ticketNumber, status, purchaseDate

### 7. Winners

**Purpose**: Store game winners and prize claims

**Fields**:

- `id` (String): Unique winner identifier
- `gameId` (String): Game reference
- `userId` (String): Winner user reference
- `ticketId` (String): Winning ticket reference
- `prizeId` (String): Prize reference
- `prizeValue` (Decimal): Prize value
- `currency` (String): Prize currency
- `winDate` (Timestamp): Winning date
- `isClaimed` (Boolean): Claim status
- `claimedDate` (Timestamp): Claim date
- `deliveryStatus` (Enum): Delivery status (PENDING, PROCESSING, SHIPPED, DELIVERED)
- `deliveryTrackingNumber` (String): Shipping tracking number
- `deliveryAddress` (Text): Delivery address
- `notes` (Text): Additional notes
- `createdAt` (Timestamp): Creation date
- `updatedAt` (Timestamp): Last update date

**Indexes**: gameId, userId, winDate, isClaimed, deliveryStatus

### 8. Stats

**Purpose**: Store application statistics and metrics

**Fields**:

- `id` (String): Unique stat identifier
- `type` (Enum): Stat type (GLOBAL, GAME, USER, CATEGORY)
- `referenceId` (String): Reference to specific entity
- `metric` (String): Metric name
- `value` (Decimal): Metric value
- `unit` (String): Value unit
- `date` (Date): Stat date
- `period` (Enum): Time period (DAILY, WEEKLY, MONTHLY, YEARLY)
- `metadata` (JSON): Additional metadata
- `createdAt` (Timestamp): Creation date
- `updatedAt` (Timestamp): Last update date

**Indexes**: type, referenceId, metric, date, period

### 9. Transactions

**Purpose**: Store financial transactions

**Fields**:

- `id` (String): Unique transaction identifier
- `userId` (String): User reference
- `gameId` (String): Game reference (if applicable)
- `ticketId` (String): Ticket reference (if applicable)
- `type` (Enum): Transaction type (PURCHASE, REFUND, WINNING, ADMIN_ADJUSTMENT)
- `amount` (Decimal): Transaction amount
- `currency` (String): Transaction currency
- `status` (Enum): Transaction status (PENDING, COMPLETED, FAILED, CANCELLED)
- `paymentMethod` (String): Payment method
- `paymentProvider` (String): Payment provider
- `transactionId` (String): External transaction ID
- `description` (Text): Transaction description
- `metadata` (JSON): Additional metadata
- `createdAt` (Timestamp): Creation date
- `updatedAt` (Timestamp): Last update date

**Indexes**: userId, gameId, type, status, createdAt

### 10. Notifications

**Purpose**: Store user notifications

**Fields**:

- `id` (String): Unique notification identifier
- `userId` (String): User reference
- `type` (Enum): Notification type (GAME_UPDATE, WINNING, PROMOTION, SYSTEM, SECURITY)
- `title` (String): Notification title
- `message` (Text): Notification message
- `isRead` (Boolean): Read status
- `readAt` (Timestamp): Read timestamp
- `actionUrl` (String): Action URL
- `metadata` (JSON): Additional metadata
- `createdAt` (Timestamp): Creation date
- `updatedAt` (Timestamp): Last update date

**Indexes**: userId, type, isRead, createdAt

## Sample Data

### Default Categories

- **Technology** (💻): Latest tech gadgets and electronics
- **Fashion** (👗): Trendy clothing and accessories
- **Sneakers** (👟): Premium footwear collection
- **Home & Living** (🏠): Home appliances and furniture
- **Gaming** (🎮): Gaming consoles and accessories
- **Sports** (⚽): Sports equipment and gear

### Sample Products

- **iPhone 15 Pro Max**: Latest iPhone with advanced features
- **Nike Air Max**: Premium sneakers for style and comfort
- **Smart Refrigerator**: Modern refrigerator with smart features

### Sample Stats

- **Total Players**: 15,000 users
- **Total Winners**: 2,500 users
- **Total Prizes Delivered**: 1,800 items
- **Total Prize Value**: $2.5M USD

## Initialization

### SQL Database

Run the `scripts/init-database.sql` script to create all tables and sample data.

### Firestore

Run the `scripts/init-firestore.js` script to create all collections and sample data.

## Performance Considerations

### Indexes

- Primary keys on all tables
- Foreign key indexes for relationships
- Composite indexes for common queries
- Date-based indexes for time-series data

### Query Optimization

- Use appropriate WHERE clauses
- Limit result sets with LIMIT
- Use pagination for large datasets
- Cache frequently accessed data

## Security

### Firestore Rules

- Users can only read/write their own data
- Admins have full access
- Vendors can manage their games
- Public read access for games and categories

### Data Validation

- Input validation on all fields
- Type checking for JSON fields
- Size limits for text fields
- Required field validation

## Backup and Recovery

### Regular Backups

- Daily automated backups
- Point-in-time recovery
- Cross-region replication
- Version control for schema changes

### Disaster Recovery

- Multi-region deployment
- Automated failover
- Data replication
- Backup verification
