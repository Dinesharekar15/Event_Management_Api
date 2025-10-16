import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

// Simple Neon database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Test connection
pool.connect()
  .then(() => console.log('✅ Connected to Neon database'))
  .catch(err => console.error('❌ Database connection error:', err.message));

export default pool;