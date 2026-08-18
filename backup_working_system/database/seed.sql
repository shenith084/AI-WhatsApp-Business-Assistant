-- =============================================================================
-- AI WhatsApp Business Assistant — Demo Seed Data
-- Pilot Business: "Fashion Gallery" (clothing industry)
-- Run AFTER schema.sql — in Supabase SQL Editor
-- =============================================================================

-- =============================================================================
-- 1. Pilot Business
-- =============================================================================
INSERT INTO businesses (
  id, business_name, owner_name, owner_email,
  whatsapp_number, waha_session, industry_type,
  subscription_plan, status
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Fashion Gallery',
  'Ashan Perera',
  'ashan@fashiongallery.lk',
  '94771234567',
  'fashion-gallery',
  'clothing',
  'pro',
  'active'
) ON CONFLICT (id) DO NOTHING;

-- Save this for your .env PILOT_BUSINESS_ID:
-- 11111111-1111-1111-1111-111111111111

-- =============================================================================
-- 2. Admin User for the Dashboard
-- password_hash below = bcrypt of 'Admin@123' (change before production!)
-- =============================================================================
INSERT INTO admin_users (
  business_id, name, email, password_hash, role
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Ashan Perera',
  'ashan@fashiongallery.lk',
  '$2b$12$xQZ3K9mNpL8vY2kW4jHs5OqBt7uR1dGnIeJwFoCs6PlAhTmVXrUy.',   -- Admin@123
  'business_owner'
) ON CONFLICT (email) DO NOTHING;

-- =============================================================================
-- 3. Products — 12 items across 4 categories
-- =============================================================================
INSERT INTO products (business_id, name, description, price, category, stock, variants, image_url, tags)
VALUES
  -- ── T-Shirts ──────────────────────────────────────────────────────────────
  (
    '11111111-1111-1111-1111-111111111111',
    'Premium Cotton T-Shirt',
    'Soft 100% combed cotton T-shirt, pre-shrunk, unisex fit. Perfect for everyday wear or bulk branding.',
    10.00,
    'tshirt',
    500,
    '{"size": ["XS","S","M","L","XL","XXL"], "color": ["white","black","navy","grey","red"]}',
    'https://res.cloudinary.com/demo/image/upload/v1/fashion-gallery/tshirt-premium.jpg',
    ARRAY['best seller','bulk popular','unisex']
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    'Polo T-Shirt',
    'Classic pique polo shirt with embroidered collar. Ideal for corporate orders.',
    15.00,
    'tshirt',
    300,
    '{"size": ["S","M","L","XL","XXL"], "color": ["white","black","navy","dark green"]}',
    'https://res.cloudinary.com/demo/image/upload/v1/fashion-gallery/polo-shirt.jpg',
    ARRAY['corporate','bulk popular','formal casual']
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    'V-Neck T-Shirt',
    'Lightweight V-neck tee in breathable jersey fabric.',
    9.00,
    'tshirt',
    200,
    '{"size": ["XS","S","M","L","XL"], "color": ["white","pink","lavender","mint"]}',
    'https://res.cloudinary.com/demo/image/upload/v1/fashion-gallery/vneck-tshirt.jpg',
    ARRAY['new','women favourite']
  ),
  -- ── Dresses ───────────────────────────────────────────────────────────────
  (
    '11111111-1111-1111-1111-111111111111',
    'Floral Midi Dress',
    'Elegant floral print midi dress with flowy fabric, perfect for casual occasions.',
    35.00,
    'dress',
    80,
    '{"size": ["XS","S","M","L","XL"], "color": ["floral blue","floral pink","floral yellow"]}',
    'https://res.cloudinary.com/demo/image/upload/v1/fashion-gallery/floral-midi-dress.jpg',
    ARRAY['best seller','new arrival','women']
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    'Evening Gown',
    'Luxurious satin-finish evening gown with adjustable straps. Great for events.',
    85.00,
    'dress',
    30,
    '{"size": ["XS","S","M","L"], "color": ["midnight black","champagne","deep red"]}',
    'https://res.cloudinary.com/demo/image/upload/v1/fashion-gallery/evening-gown.jpg',
    ARRAY['premium','limited','formal']
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    'Casual Shirt Dress',
    'Breezy shirt-style dress with button-down front. Perfect for a relaxed daytime look.',
    28.00,
    'dress',
    120,
    '{"size": ["XS","S","M","L","XL"], "color": ["white","denim blue","olive"]}',
    'https://res.cloudinary.com/demo/image/upload/v1/fashion-gallery/shirt-dress.jpg',
    ARRAY['casual','new arrival']
  ),
  -- ── Trousers / Bottoms ────────────────────────────────────────────────────
  (
    '11111111-1111-1111-1111-111111111111',
    'Slim-Fit Chinos',
    'Stretch chinos with a modern slim fit. Wrinkle-resistant fabric.',
    22.00,
    'trousers',
    250,
    '{"size": ["28","30","32","34","36","38"], "color": ["khaki","navy","olive","black"]}',
    'https://res.cloudinary.com/demo/image/upload/v1/fashion-gallery/slim-chinos.jpg',
    ARRAY['best seller','men','smart casual']
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    'Formal Dress Trousers',
    'Classic straight-cut formal trousers. Ideal for office or corporate bulk orders.',
    28.00,
    'trousers',
    180,
    '{"size": ["28","30","32","34","36","38","40"], "color": ["black","charcoal","navy"]}',
    'https://res.cloudinary.com/demo/image/upload/v1/fashion-gallery/formal-trousers.jpg',
    ARRAY['formal','corporate','bulk popular']
  ),
  -- ── Jackets / Outerwear ───────────────────────────────────────────────────
  (
    '11111111-1111-1111-1111-111111111111',
    'Denim Jacket',
    'Classic washed denim jacket with silver-tone buttons. A wardrobe staple.',
    45.00,
    'jacket',
    90,
    '{"size": ["XS","S","M","L","XL","XXL"], "color": ["light blue","dark blue","black"]}',
    'https://res.cloudinary.com/demo/image/upload/v1/fashion-gallery/denim-jacket.jpg',
    ARRAY['best seller','trending','unisex']
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    'Bomber Jacket',
    'Lightweight nylon bomber jacket with ribbed cuffs and hem.',
    55.00,
    'jacket',
    60,
    '{"size": ["S","M","L","XL","XXL"], "color": ["olive","black","burgundy"]}',
    'https://res.cloudinary.com/demo/image/upload/v1/fashion-gallery/bomber-jacket.jpg',
    ARRAY['new arrival','trending']
  ),
  -- ── Accessories ───────────────────────────────────────────────────────────
  (
    '11111111-1111-1111-1111-111111111111',
    'Cotton Bucket Hat',
    'Packable cotton bucket hat with UPF 50+ protection.',
    8.00,
    'accessories',
    400,
    '{"size": ["one size"], "color": ["white","black","beige","pink","navy"]}',
    'https://res.cloudinary.com/demo/image/upload/v1/fashion-gallery/bucket-hat.jpg',
    ARRAY['accessories','summer','best seller']
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    'Canvas Tote Bag',
    'Heavy-duty cotton canvas tote. Popular as a gift or branding item with bulk orders.',
    6.00,
    'accessories',
    600,
    '{"size": ["standard"], "color": ["natural","black","navy"]}',
    'https://res.cloudinary.com/demo/image/upload/v1/fashion-gallery/canvas-tote.jpg',
    ARRAY['accessories','bulk popular','eco-friendly']
  );

-- =============================================================================
-- 4. Discount Rules — quantity-based bulk pricing
-- =============================================================================
INSERT INTO discount_rules (
  business_id, rule_name, product_category,
  min_quantity, max_quantity,
  discount_type, discount_value,
  valid_from, valid_to, is_active
)
VALUES
  -- Rule 1: 10 or more any item → 5% off
  (
    '11111111-1111-1111-1111-111111111111',
    'Small Bulk — 5% off',
    NULL,           -- applies to all categories
    10, 19,
    'percentage', 5.00,
    '2026-08-01', '2026-12-31', true
  ),
  -- Rule 2: 20–49 items → 10% off
  (
    '11111111-1111-1111-1111-111111111111',
    'Medium Bulk — 10% off',
    NULL,
    20, 49,
    'percentage', 10.00,
    '2026-08-01', '2026-12-31', true
  ),
  -- Rule 3: 50+ items → 15% off
  (
    '11111111-1111-1111-1111-111111111111',
    'Large Bulk — 15% off',
    NULL,
    50, NULL,       -- no upper bound
    'percentage', 15.00,
    '2026-08-01', '2026-12-31', true
  ),
  -- Rule 4: T-shirts only, 30+ → special 12% off
  (
    '11111111-1111-1111-1111-111111111111',
    'T-Shirt Bulk — 12% off',
    'tshirt',
    30, NULL,
    'percentage', 12.00,
    '2026-08-01', '2026-12-31', true
  ),
  -- Rule 5: Seasonal promo — any 5+ accessories → fixed $5/item
  (
    '11111111-1111-1111-1111-111111111111',
    'Accessories Flash Sale — $5 each',
    'accessories',
    5, NULL,
    'fixed_price', 5.00,
    '2026-08-05', '2026-08-18', true
  );

-- =============================================================================
-- 5. Verify seed data
-- =============================================================================
SELECT 'businesses' AS table_name, COUNT(*) FROM businesses
UNION ALL SELECT 'products',       COUNT(*) FROM products
UNION ALL SELECT 'discount_rules', COUNT(*) FROM discount_rules
UNION ALL SELECT 'admin_users',    COUNT(*) FROM admin_users;
