require('dotenv').config({ path: '../.env' });
const { Client } = require('pg');

async function setup() {
  const client = new Client({
    host: process.env.SUPABASE_DB_HOST,
    port: process.env.SUPABASE_DB_PORT,
    user: process.env.SUPABASE_DB_USER,
    password: process.env.SUPABASE_DB_PASSWORD,
    database: process.env.SUPABASE_DB_NAME,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Connected to Supabase PostgreSQL.");

    // Create table
    await client.query(`
      CREATE TABLE IF NOT EXISTS role_permissions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        role VARCHAR(30) UNIQUE NOT NULL,
        can_view_orders BOOLEAN DEFAULT false,
        can_edit_orders BOOLEAN DEFAULT false,
        can_view_products BOOLEAN DEFAULT false,
        can_edit_products BOOLEAN DEFAULT false,
        can_manage_discounts BOOLEAN DEFAULT false,
        can_manage_staff BOOLEAN DEFAULT false,
        can_handle_tickets BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);
    console.log("Table 'role_permissions' created or already exists.");

    // Seed default roles
    await client.query(`
      INSERT INTO role_permissions (role, can_view_orders, can_edit_orders, can_view_products, can_edit_products, can_manage_discounts, can_manage_staff, can_handle_tickets)
      VALUES 
        ('business_owner', true, true, true, true, true, true, true),
        ('staff', true, false, true, false, false, false, true),
        ('platform_super_admin', true, true, true, true, true, true, true)
      ON CONFLICT (role) DO NOTHING;
    `);
    console.log("Default permissions seeded.");

  } catch (e) {
    console.error("Error setting up DB:", e);
  } finally {
    await client.end();
  }
}

setup();
