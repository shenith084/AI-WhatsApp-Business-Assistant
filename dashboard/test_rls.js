const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vjzrznpttehpmdtobxdi.supabase.co';
const supabaseKey = 'sb_publishable_dhvNkjTb1DRTWCzr5alyKw_p2TXevzD'; // ANON KEY

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from('products').select('*');
  if (error) {
    console.error("Error fetching with ANON KEY:", error);
  } else {
    console.log("Success with ANON KEY! Products found:", data.length);
  }
}

test();
