const { Client } = require('pg');

const client = new Client({
  host: 'db.vjzrznpttehpmdtobxdi.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'shenith10774'
});

async function run() {
  try {
    await client.connect();
    console.log("Connected to Supabase Postgres.");

    await client.query(`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'cod',
      ADD COLUMN IF NOT EXISTS receipt_url TEXT;
    `);

    console.log("Successfully altered orders table.");
  } catch (err) {
    console.error("Error altering table:", err);
  } finally {
    await client.end();
  }
}

run();
