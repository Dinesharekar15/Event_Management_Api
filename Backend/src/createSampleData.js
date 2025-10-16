import db from './config/database.js';

const createSampleData = async () => {
  try {
    console.log('🔧 Creating sample data...');

    // Create sample users
    const users = [
      { name: 'John Doe', email: 'john.doe@example.com' },
      { name: 'Jane Smith', email: 'jane.smith@example.com' },
      { name: 'Bob Wilson', email: 'bob.wilson@example.com' }
    ];

    for (const user of users) {
      await db.query(`
        INSERT INTO users (name, email)
        VALUES ($1, $2)
        ON CONFLICT (email) DO NOTHING
      `, [user.name, user.email]);
    }

    // Get created users
    const userResult = await db.query('SELECT * FROM users ORDER BY name');
    console.log('✅ Sample users created:', userResult.rows.length);

    // Create sample events
    const futureDate1 = new Date();
    futureDate1.setDate(futureDate1.getDate() + 7); // 1 week from now

    const futureDate2 = new Date();
    futureDate2.setDate(futureDate2.getDate() + 14); // 2 weeks from now

    const events = [
      {
        title: 'Tech Conference 2025',
        starts_at: futureDate1.toISOString(),
        ends_at: null,
        location: 'Convention Center',
        capacity: 100
      },
      {
        title: 'Workshop: Node.js Advanced',
        starts_at: futureDate2.toISOString(),
        ends_at: null,
        location: 'Training Room A',
        capacity: 25
      }
    ];

    for (const event of events) {
      await db.query(`
        INSERT INTO events (title, starts_at, ends_at, location, capacity)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT DO NOTHING
      `, [event.title, event.starts_at, event.ends_at, event.location, event.capacity]);
    }

    const eventResult = await db.query('SELECT * FROM events ORDER BY starts_at');
    console.log('✅ Sample events created:', eventResult.rows.length);

    console.log('✅ Sample data creation completed!');
    
  } catch (error) {
    console.error('❌ Sample data creation failed:', error.message);
  } finally {
    process.exit(0);
  }
};

createSampleData();