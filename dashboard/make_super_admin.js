require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const { error } = await supabase
    .from('admin_users')
    .update({ role: 'platform_super_admin' })
    .eq('email', 'admin@gmail.com');
    
  if (error) {
    console.error('Error updating admin role:', error);
  } else {
    console.log('Successfully updated admin@gmail.com to platform_super_admin.');
  }
}

run();
