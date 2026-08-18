import os

filepath = r'e:\MY Work\Task 07\AI WhatsApp Business Assistant\dashboard\src\app\actions.ts'

with open(filepath, 'r') as f:
    content = f.read()

new_actions = """

// --- PRODUCT ACTIONS ---
export async function addProduct(product: any) {
  const { error } = await supabase.from('products').insert(product);
  return { error };
}

export async function updateProduct(id: string, product: any) {
  const { error } = await supabase.from('products').update(product).eq('id', id);
  return { error };
}

export async function deleteProduct(id: string) {
  const { error } = await supabase.from('products').delete().eq('id', id);
  return { error };
}

// --- DISCOUNT RULES ACTIONS ---
export async function getDiscounts() {
  const { data, error } = await supabase
    .from('discount_rules')
    .select('*')
    .order('created_at', { ascending: false });
  return { data, error };
}

export async function addDiscountRule(rule: any) {
  const { error } = await supabase.from('discount_rules').insert(rule);
  return { error };
}

export async function updateDiscountRule(id: string, rule: any) {
  const { error } = await supabase.from('discount_rules').update(rule).eq('id', id);
  return { error };
}

export async function deleteDiscountRule(id: string) {
  const { error } = await supabase.from('discount_rules').delete().eq('id', id);
  return { error };
}

// --- STAFF ACTIONS ---
export async function addStaff(staff: any) {
  // In a real app we'd hash the password here or let Supabase Auth handle it. 
  // For MVP, we insert a placeholder hash.
  if (!staff.password_hash) {
      staff.password_hash = 'PLACEHOLDER_HASH';
  }
  const { error } = await supabase.from('admin_users').insert(staff);
  return { error };
}

export async function updateStaff(id: string, staff: any) {
  const { error } = await supabase.from('admin_users').update(staff).eq('id', id);
  return { error };
}

export async function deleteStaff(id: string) {
  const { error } = await supabase.from('admin_users').delete().eq('id', id);
  return { error };
}

// --- ORDER ACTIONS ---
export async function updateOrderStatus(id: string, status: string) {
  const { error } = await supabase.from('orders').update({ status }).eq('id', id);
  return { error };
}
"""

with open(filepath, 'a') as f:
    f.write(new_actions)

print("Appended new actions successfully!")
