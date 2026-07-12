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
