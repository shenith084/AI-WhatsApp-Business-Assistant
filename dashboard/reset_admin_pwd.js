require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const { error } = await supabase
    .from('admin_users')
    .update({ password_hash: 'Admin@123' })
    .eq('email', 'admin@gmail.com');
    
  if (error) {
    console.error('Error updating admin password:', error);
  } else {
    console.log('Successfully updated admin password hash to plain text for MVP.');
  }
}

run();
