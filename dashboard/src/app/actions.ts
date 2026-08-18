'use server';

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

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
  const { data: user } = await supabase.from('admin_users').select('role').eq('id', id).single();
  if (user && user.role === 'platform_super_admin') {
    return { error: { message: "Action Denied: You cannot delete a Platform Super Admin." } };
  }

  const { error } = await supabase.from('admin_users').delete().eq('id', id);
  return { error };
}

export async function changePassword(id: string, password_hash: string) {
  const { error } = await supabase.from('admin_users').update({ password_hash }).eq('id', id);
  return { error };
}

// --- ORDER ACTIONS ---
export async function updateOrderStatus(id: string, status: string) {
  const { error } = await supabase.from('orders').update({ status }).eq('id', id);
  return { error };
}

// --- PERMISSION ACTIONS ---
export async function getPermissions() {
  const { data, error } = await supabase
    .from('role_permissions')
    .select('*')
    .order('created_at', { ascending: true });
  return { data, error };
}

export async function updatePermission(id: string, payload: any) {
  const { error } = await supabase
    .from('role_permissions')
    .update(payload)
    .eq('id', id);
  return { error };
}

// --- AUTHENTICATION ACTIONS ---
export async function loginAction(email: string, password?: string) {
  // Query the admin_users table for the provided email
  const { data, error } = await supabase
    .from('admin_users')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !data) {
    return { error: 'Invalid email or user not found.' };
  }

  if (!data.is_active) {
    return { error: 'This account has been deactivated.' };
  }

  // Basic plain-text verification for MVP (since we reset bcrypt to plain text)
  if (password && data.password_hash !== password) {
    return { error: 'Incorrect password.' };
  }
  
  // Fetch role permissions
  const { data: perms } = await supabase
    .from('role_permissions')
    .select('*')
    .eq('role', data.role)
    .single();

  // Set secure HTTP cookie
  const cookieStore = await cookies();
  cookieStore.set('waba_auth_token', JSON.stringify({
    id: data.id,
    name: data.name,
    email: data.email,
    role: data.role,
    business_id: data.business_id,
    permissions: perms || null
  }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7 // 1 week
  });

  return { success: true, user: data };
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('waba_auth_token');
  return { success: true };
}

export async function getAuthSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('waba_auth_token')?.value;
  if (!token) return null;
  return JSON.parse(token);
}

// --- DASHBOARD ACTIONS ---
export async function getDashboardMetrics() {
  const [{ count: orderCount }, { data: orderData }, { count: messageCount }, { count: openTickets }] = await Promise.all([
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('total_price'),
    supabase.from('conversations').select('*', { count: 'exact', head: true }).gte('created_at', new Date(new Date().setHours(0,0,0,0)).toISOString()),
    supabase.from('support_tickets').select('*', { count: 'exact', head: true }).eq('status', 'open')
  ]);

  const totalRevenue = orderData?.reduce((sum, order) => sum + (Number(order.total_price) || 0), 0) || 0;

  return {
    orders: orderCount || 0,
    revenue: totalRevenue,
    messagesToday: messageCount || 0,
    openTickets: openTickets || 0
  };
}

// --- TICKET ACTIONS ---
export async function getTickets() {
  const { data, error } = await supabase
    .from('support_tickets')
    .select('*')
    .order('created_at', { ascending: false });
  return { data, error };
}

export async function updateTicketStatus(id: string, status: string, assignedAgent?: string) {
  const payload: any = { status };
  if (assignedAgent) payload.assigned_agent = assignedAgent;
  if (status === 'resolved') payload.resolved_at = new Date().toISOString();

  const { error } = await supabase
    .from('support_tickets')
    .update(payload)
    .eq('id', id);
  return { error };
}
