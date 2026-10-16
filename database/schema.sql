-- APAAR Blockchain Verifier Database Schema (MySQL 8)
-- Minimum tables needed for MVP: users, institutions, credentials, verifications

CREATE DATABASE IF NOT EXISTS apaar_verifier;
USE apaar_verifier;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    role ENUM('admin', 'institution', 'verifier') NOT NULL DEFAULT 'verifier',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Institutions Table
CREATE TABLE IF NOT EXISTS institutions (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE,
    wallet_address VARCHAR(42),
    contact_email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Credentials Table
CREATE TABLE IF NOT EXISTS credentials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    credential_id VARCHAR(100) NOT NULL UNIQUE,
    student_identifier VARCHAR(100) NOT NULL,
    institution_id VARCHAR(50) NOT NULL,
    credential_hash VARCHAR(66) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ISSUED',
    issue_date DATE NOT NULL,
    transaction_hash VARCHAR(66) DEFAULT NULL,
    payload_json JSON DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_credentials_credential_id (credential_id),
    INDEX idx_credentials_institution_id (institution_id),
    INDEX idx_credentials_hash (credential_hash)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Verifications Table
CREATE TABLE IF NOT EXISTS verifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    credential_id VARCHAR(100) NOT NULL,
    verification_result VARCHAR(20) NOT NULL,
    blockchain_verified BOOLEAN DEFAULT FALSE,
    verifier_ip VARCHAR(45) DEFAULT NULL,
    notes TEXT DEFAULT NULL,
    verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_verifications_credential_id (credential_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
