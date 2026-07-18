const fs = require('fs');
const path = require('path');
const db = require('./db');

async function initializeDatabase() {
  try {
    console.log('Verifying database tables connection...');
    
    // Check if the 'users' table already exists
    const [rows] = await db.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = ? AND table_name = 'users'
    `, [process.env.DB_NAME]);
    
    if (rows[0].count > 0) {
      console.log('Database tables already exist. Checking for email column migration...');
      
      // Check if 'email' column still exists and needs to be renamed
      const [columns] = await db.query(`
        SELECT COLUMN_NAME 
        FROM information_schema.columns 
        WHERE table_schema = ? AND table_name = 'users' AND column_name = 'email'
      `, [process.env.DB_NAME]);
      
      if (columns.length > 0) {
        console.log('Migrating users table: renaming email -> company_email, adding personal_email...');
        // 1. Rename email to company_email
        await db.query('ALTER TABLE users CHANGE COLUMN email company_email VARCHAR(100) NOT NULL');
        // 2. Add personal_email if it doesn't exist
        const [personalCheck] = await db.query(`
          SELECT COLUMN_NAME 
          FROM information_schema.columns 
          WHERE table_schema = ? AND table_name = 'users' AND column_name = 'personal_email'
        `, [process.env.DB_NAME]);
        if (personalCheck.length === 0) {
          await db.query('ALTER TABLE users ADD COLUMN personal_email VARCHAR(100) NULL AFTER company_email');
        }
        console.log('Database column migrations completed successfully!');
      }

      // Ensure last_failed_login_at column exists (added for H-1 account lockout)
      const [lockoutCheck] = await db.query(`
        SELECT COLUMN_NAME 
        FROM information_schema.columns 
        WHERE table_schema = ? AND table_name = 'users' AND column_name = 'last_failed_login_at'
      `, [process.env.DB_NAME]);
      if (lockoutCheck.length === 0) {
        await db.query('ALTER TABLE users ADD COLUMN last_failed_login_at DATETIME NULL DEFAULT NULL AFTER failed_login_attempts');
        console.log('Migration: added last_failed_login_at column to users table.');
      }

      // Ensure otp_code can fit bcrypt hashes (VARCHAR(255))
      const [otpCheck] = await db.query(`
        SELECT CHARACTER_MAXIMUM_LENGTH 
        FROM information_schema.columns 
        WHERE table_schema = ? AND table_name = 'users' AND column_name = 'otp_code'
      `, [process.env.DB_NAME]);
      if (otpCheck.length > 0 && otpCheck[0].CHARACTER_MAXIMUM_LENGTH < 255) {
        await db.query('ALTER TABLE users MODIFY otp_code VARCHAR(255)');
        console.log('Migration: expanded otp_code column to VARCHAR(255) to support bcrypt hashes.');
      }

      // Ensure vault_items table exists
      const [vaultCheck] = await db.query(`
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_schema = ? AND table_name = 'vault_items'
      `, [process.env.DB_NAME]);
      
      if (vaultCheck[0].count === 0) {
        console.log('Migration: Creating Password Manager (Vault) tables...');
        await db.query(`
          CREATE TABLE IF NOT EXISTS \`vault_items\` (
            \`id\` INT AUTO_INCREMENT PRIMARY KEY,
            \`title\` VARCHAR(255) NOT NULL,
            \`url\` VARCHAR(255) NULL,
            \`username\` VARCHAR(255) NULL,
            \`auth_type\` ENUM('password', 'oauth') NOT NULL DEFAULT 'password',
            \`oauth_provider\` VARCHAR(50) NULL,
            \`encrypted_password\` TEXT NULL,
            \`iv\` VARCHAR(255) NULL,
            \`auth_tag\` VARCHAR(255) NULL,
            \`notes\` TEXT NULL,
            \`added_by\` INT NOT NULL,
            \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (\`added_by\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        await db.query(`
          CREATE TABLE IF NOT EXISTS \`vault_item_access\` (
            \`item_id\` INT NOT NULL,
            \`user_id\` INT NOT NULL,
            PRIMARY KEY (\`item_id\`, \`user_id\`),
            FOREIGN KEY (\`item_id\`) REFERENCES \`vault_items\`(\`id\`) ON DELETE CASCADE,
            FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        await db.query(`
          CREATE TABLE IF NOT EXISTS \`vault_audit_logs\` (
            \`id\` INT AUTO_INCREMENT PRIMARY KEY,
            \`user_id\` INT NOT NULL,
            \`item_id\` INT NOT NULL,
            \`action\` ENUM('viewed_password', 'copied_password', 'edited', 'created') NOT NULL,
            \`timestamp\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE,
            FOREIGN KEY (\`item_id\`) REFERENCES \`vault_items\`(\`id\`) ON DELETE CASCADE
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        console.log('Migration: Password Manager tables created successfully.');
      }
      
      // Ensure backup_schedules table exists
      const [backupSchedulesCheck] = await db.query(`
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_schema = ? AND table_name = 'backup_schedules'
      `, [process.env.DB_NAME]);
      
      if (backupSchedulesCheck[0].count === 0) {
        console.log('Migration: Creating Backup Schedules table...');
        await db.query(`
          CREATE TABLE IF NOT EXISTS \`backup_schedules\` (
            \`id\` INT AUTO_INCREMENT PRIMARY KEY,
            \`schedule_time\` VARCHAR(5) NOT NULL,
            \`is_active\` BOOLEAN DEFAULT TRUE,
            \`added_by\` INT NOT NULL,
            \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (\`added_by\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        console.log('Migration: Backup Schedules table created successfully.');
      }

      return;
    }

    console.log('Tables do not exist. Starting schema initialization...');
    
    // Read the schema.sql file
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema DDL script not found at path: ${schemaPath}`);
    }
    
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    // Split statements by semicolon (excluding those in comments or quotes)
    // A robust split is using a regex or simple line-by-line parsing
    const statements = schemaSql
      .split(/;(?=(?:[^']*'[^']*')*[^']*$)/) // split on semicolons not enclosed in single quotes
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);

    for (let statement of statements) {
      // Remove starting comments if any
      const cleaned = statement
        .replace(/^--.*$/gm, '') // remove line comments
        .trim();
      
      if (cleaned) {
        await db.query(cleaned);
      }
    }
    
    console.log('Database tables and seed data initialized successfully!');
  } catch (error) {
    console.error('Failed to initialize database tables:', error);
    process.exit(1);
  }
}

module.exports = initializeDatabase;
