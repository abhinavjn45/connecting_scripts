-- Role-Based Access Control (RBAC) & CRUD Permission Matrix Database Schema
-- Database: seoc_agency_db
-- Generated on: 2026-07-12

-- 1. Create Users Table
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `unique_id` VARCHAR(36) NOT NULL UNIQUE COMMENT 'UUID for external references',
  `first_name` VARCHAR(50) NOT NULL,
  `last_name` VARCHAR(50) NOT NULL,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `company_email` VARCHAR(100) NOT NULL UNIQUE,
  `personal_email` VARCHAR(100) NULL COMMENT 'Personal contact address',
  `password` VARCHAR(255) NOT NULL COMMENT 'Hashed password string',
  `phone_number` VARCHAR(20) NULL COMMENT 'With country code, e.g., +15550192834',
  `bio` TEXT NULL,
  `gender` ENUM('Male', 'Female', 'Others') DEFAULT 'Others',
  `joining_date` DATE NOT NULL COMMENT 'Contract or join date',
  `designation` VARCHAR(100) NULL COMMENT 'Job title, e.g., Lead Developer',
  `role` ENUM('Super Admin', 'Admin', 'Editor', 'Viewer') NOT NULL DEFAULT 'Viewer',
  `status` ENUM('Active', 'Inactive', 'Suspended', 'Pending') NOT NULL DEFAULT 'Pending',
  `profile_image` VARCHAR(255) NULL COMMENT 'File system path or CDN URL',
  
  -- OTP & Verification
  `otp_code` VARCHAR(10) NULL COMMENT 'One-Time Password for password recovery/2FA',
  `otp_expires_at` DATETIME NULL COMMENT 'OTP Expiration timestamp',
  `two_factor_enabled` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '2FA status toggle',
  
  -- Security Audit Logs
  `failed_login_attempts` INT NOT NULL DEFAULT 0,
  `last_failed_login_at` DATETIME NULL DEFAULT NULL,
  `last_login_at` DATETIME NULL,
  
  -- Timestamps
  `added_on` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_on` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes for optimization
  INDEX `idx_unique_id` (`unique_id`),
  INDEX `idx_username` (`username`),
  INDEX `idx_company_email` (`company_email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Create Modules Table
CREATE TABLE IF NOT EXISTS `modules` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `module_key` VARCHAR(100) NOT NULL UNIQUE COMMENT 'Unique identifier for system routes/submenus',
  `module_name` VARCHAR(100) NOT NULL COMMENT 'Display name of module',
  `category` VARCHAR(50) NOT NULL COMMENT 'Heading category, e.g. Content, CRM, Accounting',
  `added_on` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Create User-Module CRUD Permission Matrix Table
CREATE TABLE IF NOT EXISTS `user_module_permissions` (
  `user_id` INT NOT NULL,
  `module_key` VARCHAR(100) NOT NULL,
  `can_read` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Permission to view module page list',
  `can_create` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Permission to insert new records',
  `can_update` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Permission to modify existing records',
  `can_delete` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Permission to remove records',
  `granted_by` INT NULL COMMENT 'ID of admin who granted permission',
  `updated_on` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`, `module_key`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`module_key`) REFERENCES `modules` (`module_key`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- SEED DATA SETUP
-- ==========================================

-- Insert system modules list
INSERT INTO `modules` (`module_key`, `module_name`, `category`) VALUES
-- Content Management
('services', 'Services', 'Content Management'),
('case_studies', 'Case Study', 'Content Management'),
('products', 'Products', 'Content Management'),
('blogs', 'Blogs', 'Content Management'),
('seo', 'SEO Management', 'Content Management'),
-- CRM
('websites', 'Websites', 'CRM'),
('clients', 'Clients', 'CRM'),
('design_demos', 'Design Demos', 'CRM'),
-- Accounting
('invoices', 'Invoices', 'Accounting'),
('expenses', 'Expenses', 'Accounting'),
('reports', 'Reports', 'Accounting'),
-- Leads Management
('contact_queries', 'Contact Queries', 'Leads Management'),
('leads_extractor', 'Leads Extractor', 'Leads Management'),
('other_queries', 'Other Queries', 'Leads Management'),
-- Administration
('users', 'User Management', 'Administration'),
('passwords', 'Password Manager', 'Administration'),
('backups', 'Database Backups', 'Administration'),
('site_health', 'Site Health', 'Administration'),
('settings', 'Settings', 'Administration');

-- Insert Example Admin User (Password is hashed equivalent of "admin123")
INSERT INTO `users` (
  `unique_id`, `first_name`, `last_name`, `username`, `company_email`, `personal_email`, `password`, 
  `phone_number`, `bio`, `gender`, `joining_date`, `designation`, `role`, `status`
) VALUES (
  'a2a5ef52-613d-11ed-ad41-0242ac120002', 'Abhinav', 'Jain', 'abhinav_jn_45', 'abhinav@connectingscripts.co.in', NULL, 
  '$2a$10$CMinQqjcskt4.qNRUiLTquhclc39y3QJn.BsQgICAvgnNeRIEKJRS', '+15550192834', 
  'Super Administrator for agency operations dashboard.', 'Others', '2026-06-15', 
  'Lead Operator', 'Super Admin', 'Active'
);

-- Grant Example Admin User full CRUD permissions on all modules
INSERT INTO `user_module_permissions` (`user_id`, `module_key`, `can_read`, `can_create`, `can_update`, `can_delete`) 
SELECT 1, module_key, 1, 1, 1, 1 FROM `modules`;
