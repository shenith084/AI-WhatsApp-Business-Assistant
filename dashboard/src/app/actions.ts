'use server';

import { createClient } from '@supabase/supabase-js';

// Always use the Service Role key on the server to bypass RLS securely
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function getOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select('*, customers(name, phone_number)')
    .order('created_at', { ascending: false });
  return { data, error };
}

export async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });
  return { data, error };
}

export async function getStock() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('stock', { ascending: true });
  return { data, error };
}

export async function getStaff() {
  const { data, error } = await supabase
    .from('admin_users')
    .select('*')
    .order('created_at', { ascending: false });
  return { data, error };
}

export async function getSettings(businessId: string) {
  const { data, error } = await supabase
    .from('businesses')
    .select('business_name, admin_phone, waha_session')
    .eq('id', businessId)
    .single();
  return { data, error };
}

export async function updateSettings(businessId: string, payload: any) {
  const { error } = await supabase
    .from('businesses')
    .update(payload)
    .eq('id', businessId);
  return { error };
}


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
