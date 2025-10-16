import dotenv from 'dotenv';
import pool from './config/database.js';

// Load environment variables
dotenv.config();

async function getUserIds() {
    try {
        const result = await pool.query('SELECT id, name, email FROM users ORDER BY name');
        
        console.log('\n🔑 TEST USER IDs FOR POSTMAN:\n');
        console.log('=' .repeat(50));
        
        result.rows.forEach((user, index) => {
            console.log(`\n📧 User ${index + 1}: ${user.name}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   UUID:  ${user.id}`);
        });
        
        console.log('\n' + '=' .repeat(50));
        console.log('\n💡 Copy these UUIDs for Postman testing!');
        
        await pool.end();
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

getUserIds();