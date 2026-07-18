require('dotenv').config();
const db = require('../config/db');

async function createAuditTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS \`system_audit_logs\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`user_id\` INT NOT NULL,
        \`module_key\` VARCHAR(100) NOT NULL,
        \`action\` VARCHAR(50) NOT NULL COMMENT 'e.g., CREATE_BACKUP, DELETE_SCHEDULE',
        \`details\` TEXT NULL COMMENT 'JSON string or textual description of the action',
        \`ip_address\` VARCHAR(45) NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log("Audit table created!");
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}

createAuditTable();
