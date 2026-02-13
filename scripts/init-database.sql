-- Database Initialization Script for Lottery App
-- This script creates all necessary tables for the application

-- Session defaults
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
SET sql_mode = 'STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO';
SET time_zone = '+00:00';
-- Users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    firstName VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    role ENUM('USER', 'VENDOR', 'ADMIN') DEFAULT 'USER',
    language VARCHAR(10) DEFAULT 'en',
    currency VARCHAR(3) DEFAULT 'USD',
    phoneNumber VARCHAR(20),
    isPhoneVerified BOOLEAN DEFAULT FALSE,
    isEmailVerified BOOLEAN DEFAULT FALSE,
    profileImage VARCHAR(500),
    dateOfBirth DATE,
    address TEXT,
    preferences JSON,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    lastLoginAt TIMESTAMP,
    isActive BOOLEAN DEFAULT TRUE,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_language (language)
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(7),
    isActive BOOLEAN DEFAULT TRUE,
    sortOrder INT DEFAULT 0,
    parentCategoryId VARCHAR(255),
    image VARCHAR(500),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_isActive (isActive),
    INDEX idx_sortOrder (sortOrder),
    FOREIGN KEY (parentCategoryId) REFERENCES categories(id) ON DELETE SET NULL
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Products table
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    categoryId VARCHAR(255) NOT NULL,
    brand VARCHAR(100),
    model VARCHAR(100),
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    originalPrice DECIMAL(10,2),
    discountPercentage INT DEFAULT 0,
    images JSON,
    specifications JSON,
    features JSON,
    isActive BOOLEAN DEFAULT TRUE,
    stockQuantity INT DEFAULT 0,
    weight DECIMAL(8,3),
    dimensions JSON,
    tags JSON,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_categoryId (categoryId),
    INDEX idx_brand (brand),
    INDEX idx_price (price),
    INDEX idx_isActive (isActive),
    FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE CASCADE
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Games table
CREATE TABLE IF NOT EXISTS games (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    categoryId VARCHAR(255) NOT NULL,
    type ENUM('daily', 'weekly', 'monthly', 'special') DEFAULT 'daily',
    status ENUM('DRAFT', 'ACTIVE', 'DRAWING', 'CLOSED', 'CANCELLED') DEFAULT 'DRAFT',
    ticketPrice DECIMAL(10,2) NOT NULL,
    maxParticipants INT NOT NULL,
    currentParticipants INT DEFAULT 0,
    totalPrizePool DECIMAL(12,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    startDate TIMESTAMP NOT NULL,
    endDate TIMESTAMP NOT NULL,
    drawDate TIMESTAMP,
    rules JSON,
    images JSON,
    isPromoted BOOLEAN DEFAULT FALSE,
    viewCount INT DEFAULT 0,
    createdBy VARCHAR(255) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_title (title),
    INDEX idx_categoryId (categoryId),
    INDEX idx_status (status),
    INDEX idx_type (type),
    INDEX idx_startDate (startDate),
    INDEX idx_endDate (endDate),
    INDEX idx_createdBy (createdBy),
    INDEX idx_isPromoted (isPromoted),
    FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE CASCADE,
    FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE CASCADE
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Prizes table
CREATE TABLE IF NOT EXISTS prizes (
    id VARCHAR(255) PRIMARY KEY,
    gameId VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    value DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    type ENUM('PRODUCT', 'CASH', 'GIFT_CARD', 'EXPERIENCE') DEFAULT 'PRODUCT',
    productId VARCHAR(255),
    image VARCHAR(500),
    quantity INT DEFAULT 1,
    isActive BOOLEAN DEFAULT TRUE,
    sortOrder INT DEFAULT 0,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_gameId (gameId),
    INDEX idx_type (type),
    INDEX idx_value (value),
    INDEX idx_isActive (isActive),
    FOREIGN KEY (gameId) REFERENCES games(id) ON DELETE CASCADE,
    FOREIGN KEY (productId) REFERENCES products(id) ON DELETE SET NULL
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Tickets table
CREATE TABLE IF NOT EXISTS tickets (
    id VARCHAR(255) PRIMARY KEY,
    gameId VARCHAR(255) NOT NULL,
    userId VARCHAR(255) NOT NULL,
    ticketNumber VARCHAR(50) UNIQUE NOT NULL,
    status ENUM('ACTIVE', 'WINNER', 'EXPIRED', 'CANCELLED') DEFAULT 'ACTIVE',
    purchaseDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    paymentMethod VARCHAR(50),
    INDEX idx_gameId (gameId),
    INDEX idx_userId (userId),
    INDEX idx_ticketNumber (ticketNumber),
    INDEX idx_status (status),
    INDEX idx_purchaseDate (purchaseDate),
    INDEX idx_game_user (gameId, userId),
    FOREIGN KEY (gameId) REFERENCES games(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Winners table
CREATE TABLE IF NOT EXISTS winners (
    id VARCHAR(255) PRIMARY KEY,
    gameId VARCHAR(255) NOT NULL,
    userId VARCHAR(255) NOT NULL,
    ticketId VARCHAR(255) NOT NULL,
    prizeId VARCHAR(255) NOT NULL,
    prizeValue DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    winDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    isClaimed BOOLEAN DEFAULT FALSE,
    claimedDate TIMESTAMP,
    deliveryStatus ENUM('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED') DEFAULT 'PENDING',
    deliveryTrackingNumber VARCHAR(100),
    deliveryAddress TEXT,
    notes TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_gameId (gameId),
    INDEX idx_userId (userId),
    INDEX idx_winDate (winDate),
    INDEX idx_isClaimed (isClaimed),
    INDEX idx_deliveryStatus (deliveryStatus),
    UNIQUE KEY unique_game_user (gameId, userId),
    FOREIGN KEY (gameId) REFERENCES games(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (ticketId) REFERENCES tickets(id) ON DELETE CASCADE,
    FOREIGN KEY (prizeId) REFERENCES prizes(id) ON DELETE CASCADE
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Stats table
CREATE TABLE IF NOT EXISTS stats (
    id VARCHAR(255) PRIMARY KEY,
    type ENUM('GLOBAL', 'GAME', 'USER', 'CATEGORY') NOT NULL,
    referenceId VARCHAR(255),
    metric VARCHAR(100) NOT NULL,
    value DECIMAL(15,2) NOT NULL,
    unit VARCHAR(20),
    date DATE NOT NULL,
    period ENUM('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY') DEFAULT 'DAILY',
    metadata JSON,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_type (type),
    INDEX idx_referenceId (referenceId),
    INDEX idx_metric (metric),
    INDEX idx_date (date),
    INDEX idx_period (period),
    UNIQUE KEY unique_stat (type, referenceId, metric, date, period)
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(255) PRIMARY KEY,
    userId VARCHAR(255) NOT NULL,
    gameId VARCHAR(255),
    ticketId VARCHAR(255),
    type ENUM('PURCHASE', 'REFUND', 'WINNING', 'ADMIN_ADJUSTMENT') NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status ENUM('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED') DEFAULT 'PENDING',
    paymentMethod VARCHAR(50),
    paymentProvider VARCHAR(50),
    transactionId VARCHAR(255),
    description TEXT,
    metadata JSON,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_userId (userId),
    INDEX idx_gameId (gameId),
    INDEX idx_type (type),
    INDEX idx_status (status),
    INDEX idx_createdAt (createdAt),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (gameId) REFERENCES games(id) ON DELETE SET NULL,
    FOREIGN KEY (ticketId) REFERENCES tickets(id) ON DELETE SET NULL
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(255) PRIMARY KEY,
    userId VARCHAR(255) NOT NULL,
    type ENUM('GAME_UPDATE', 'WINNING', 'PROMOTION', 'SYSTEM', 'SECURITY') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    isRead BOOLEAN DEFAULT FALSE,
    readAt TIMESTAMP,
    actionUrl VARCHAR(500),
    metadata JSON,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_userId (userId),
    INDEX idx_type (type),
    INDEX idx_isRead (isRead),
    INDEX idx_createdAt (createdAt),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Insert default categories
INSERT INTO categories (id, name, description, icon, color, sortOrder) VALUES
('tech', 'Technology', 'Latest tech gadgets and electronics', '💻', '#3B82F6', 1),
('fashion', 'Fashion', 'Trendy clothing and accessories', '👗', '#EC4899', 2),
('sneakers', 'Sneakers', 'Premium footwear collection', '👟', '#10B981', 3),
('home', 'Home & Living', 'Home appliances and furniture', '🏠', '#F59E0B', 4),
('gaming', 'Gaming', 'Gaming consoles and accessories', '🎮', '#8B5CF6', 5),
('sports', 'Sports', 'Sports equipment and gear', '⚽', '#EF4444', 6)
ON DUPLICATE KEY UPDATE id = VALUES(id);


-- Insert sample products
INSERT INTO products (id, name, description, categoryId, brand, price, images) VALUES
('iphone15', 'iPhone 15 Pro Max', 'Latest iPhone with advanced features', 'tech', 'Apple', 1199.99, '["/images/iphone15promax.webp"]'),
('nike-air', 'Nike Air Max', 'Premium sneakers for style and comfort', 'sneakers', 'Nike', 129.99, '["/images/nikeAirMax.webp"]'),
('refrigerator', 'Smart Refrigerator', 'Modern refrigerator with smart features', 'home', 'Samsung', 899.99, '["/images/refrigerator.jpeg"]')
ON DUPLICATE KEY UPDATE id = VALUES(id);

-- Insert sample stats
INSERT INTO stats (id, type, metric, value, unit, date, period) VALUES
('global_players', 'GLOBAL', 'total_players', 15000, 'users', CURDATE(), 'DAILY'),
('global_winners', 'GLOBAL', 'total_winners', 2500, 'users', CURDATE(), 'DAILY'),
('global_prizes', 'GLOBAL', 'total_prizes_delivered', 1800, 'items', CURDATE(), 'DAILY'),
('global_value', 'GLOBAL', 'total_prize_value', 2500000, 'USD', CURDATE(), 'DAILY')
ON DUPLICATE KEY UPDATE id = VALUES(id);


-- Create indexes for better performance
CREATE INDEX idx_games_status_date ON games(status, startDate, endDate);
CREATE INDEX idx_tickets_game_status ON tickets(gameId, status);
CREATE INDEX idx_winners_game_date ON winners(gameId, winDate);
CREATE INDEX idx_stats_metric_date ON stats(metric, date);
CREATE INDEX idx_transactions_user_date ON transactions(userId, createdAt);
CREATE INDEX idx_notifications_user_read ON notifications(userId, isRead);
