
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vjzrznpttehpmdtobxdi.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_GLrDuSJaE2j7R9vMbde4Aw_EkypQ6fm';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Fetching orders with join...");
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      customers (
        name,
        phone_number
      )
    `);
  
  if (error) {
    console.error("Order Fetch Error:", error);
  } else {
    console.log("Order Fetch Success, count:", data.length);
  }
}


test();
