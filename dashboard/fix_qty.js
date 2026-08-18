require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  // First, fetch rules where max < min
  const { data: badRules, error: fetchError } = await supabase
    .from('discount_rules')
    .select('*');

  if (fetchError) {
    console.error('Fetch error:', fetchError);
    return;
  }

  const toFix = badRules.filter(r => r.max_quantity !== null && r.max_quantity < r.min_quantity);

  for (const rule of toFix) {
    console.log(`Fixing rule: ${rule.rule_name} (${rule.min_quantity} - ${rule.max_quantity})`);
    // Assuming they meant "no max limit" if max < min
    const { error: updateError } = await supabase
      .from('discount_rules')
      .update({ max_quantity: null })
      .eq('id', rule.id);
      
    if (updateError) {
      console.error(`Error updating rule ${rule.id}:`, updateError);
    } else {
      console.log(`Successfully fixed rule ${rule.id}`);
    }
  }
  
  if (toFix.length === 0) {
    console.log('No bad rules found.');
  }
}

run();
