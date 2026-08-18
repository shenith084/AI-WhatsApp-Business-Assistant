require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const { data, error } = await supabase
    .from('admin_users')
    .update({ email: 'admin@gmail.com', name: 'admin' })
    .eq('email', 'ashan@fashiongallery.lk');
    
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Successfully updated admin user!');
  }
}

run();
