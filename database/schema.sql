-- =============================================================================
-- AI WhatsApp Business Assistant — Database Schema
-- Run this in your Supabase SQL Editor (Project → SQL Editor → New query)
-- Based on §8 of the Master Prompt — production-ready DDL
-- =============================================================================

-- Enable UUID generation extension (already enabled on Supabase by default)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 8.1  Businesses (tenants)
-- =============================================================================
CREATE TABLE IF NOT EXISTS businesses (
  id                UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name     VARCHAR(150) NOT NULL,
  owner_name        VARCHAR(150) NOT NULL,
  owner_email       VARCHAR(150) UNIQUE NOT NULL,
  whatsapp_number   VARCHAR(20)  UNIQUE NOT NULL,
  waha_session      VARCHAR(50)  UNIQUE NOT NULL,  -- e.g. 'fashion-gallery'
  industry_type     VARCHAR(50),                    -- clothing | bakery | restaurant | grocery
  subscription_plan VARCHAR(20)  DEFAULT 'starter', -- starter | pro | business
  status            VARCHAR(20)  DEFAULT 'trial',   -- trial | active | suspended
  created_at        TIMESTAMPTZ  DEFAULT now()
);

-- =============================================================================
-- 8.2  Products
-- =============================================================================
CREATE TABLE IF NOT EXISTS products (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id   UUID          NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name          VARCHAR(150)  NOT NULL,
  description   TEXT,
  price         DECIMAL(10,2) NOT NULL,
  category      VARCHAR(80),
  stock         INT           DEFAULT 0,
  variants      JSONB,        -- {"size": ["S","M","L"], "color": ["red","blue"]}
  image_url     TEXT,
  tags          TEXT[],       -- {"best seller","new","limited"}
  is_active     BOOLEAN       DEFAULT true,
  created_at    TIMESTAMPTZ   DEFAULT now()
);

-- =============================================================================
-- 8.3  Discount Rules
-- =============================================================================
CREATE TABLE IF NOT EXISTS discount_rules (
  id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id       UUID          NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  rule_name         VARCHAR(100),                   -- human-readable label
  product_category  VARCHAR(80),                    -- NULL = applies across all categories
  min_quantity      INT           NOT NULL,
  max_quantity      INT,                            -- NULL = no upper bound
  discount_type     VARCHAR(20)   NOT NULL          -- percentage | fixed_price
                    CHECK (discount_type IN ('percentage', 'fixed_price')),
  discount_value    DECIMAL(10,2) NOT NULL,
  valid_from        DATE,
  valid_to          DATE,
  is_active         BOOLEAN       DEFAULT true,
  created_at        TIMESTAMPTZ   DEFAULT now()
);

-- =============================================================================
-- 8.4  Customers
-- =============================================================================
CREATE TABLE IF NOT EXISTS customers (
  id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id      UUID         NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  phone_number     VARCHAR(20)  NOT NULL,
  name             VARCHAR(150),
  total_orders     INT          DEFAULT 0,
  last_order_date  TIMESTAMPTZ,
  tags             TEXT[],      -- {"VIP","new","bulk buyer"}
  created_at       TIMESTAMPTZ  DEFAULT now(),
  UNIQUE (business_id, phone_number)
);

-- =============================================================================
-- 8.5  Orders
-- =============================================================================
CREATE TABLE IF NOT EXISTS orders (
  id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id      UUID          NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id      UUID          REFERENCES customers(id),
  customer_number  VARCHAR(20)   NOT NULL,
  items            JSONB         NOT NULL,   -- [{product_id, name, qty, unit_price}]
  total_price      DECIMAL(10,2) NOT NULL,
  discount_applied DECIMAL(10,2) DEFAULT 0,
  status           VARCHAR(20)   DEFAULT 'pending'
                   CHECK (status IN ('pending', 'confirmed', 'cancelled', 'fulfilled')),
  notes            TEXT,
  created_at       TIMESTAMPTZ   DEFAULT now()
);

-- =============================================================================
-- 8.6  Conversations (chat log — powers context + handoff)
-- =============================================================================
CREATE TABLE IF NOT EXISTS conversations (
  id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id      UUID         NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  customer_number  VARCHAR(20)  NOT NULL,
  direction        VARCHAR(10)  NOT NULL
                   CHECK (direction IN ('inbound', 'outbound')),
  message_text     TEXT,
  detected_intent  VARCHAR(40),
  confidence       NUMERIC(3,2),
  created_at       TIMESTAMPTZ  DEFAULT now()
);

-- =============================================================================
-- 8.7  Support Tickets (human handoff)
-- =============================================================================
CREATE TABLE IF NOT EXISTS support_tickets (
  id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id      UUID         NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  customer_number  VARCHAR(20)  NOT NULL,
  reason           VARCHAR(50)
                   CHECK (reason IN ('low_confidence', 'customer_request', 'complaint')),
  chat_snapshot    JSONB,       -- last N messages as JSON array
  suggested_reply  TEXT,
  status           VARCHAR(20)  DEFAULT 'open'
                   CHECK (status IN ('open', 'in_progress', 'resolved')),
  assigned_agent   VARCHAR(150),
  resolved_at      TIMESTAMPTZ,
  created_at       TIMESTAMPTZ  DEFAULT now()
);

-- =============================================================================
-- 8.8  Admin Users (Phase 2 dashboard access)
-- =============================================================================
CREATE TABLE IF NOT EXISTS admin_users (
  id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id    UUID         REFERENCES businesses(id) ON DELETE CASCADE, -- NULL = platform super admin
  name           VARCHAR(150) NOT NULL,
  email          VARCHAR(150) UNIQUE NOT NULL,
  password_hash  TEXT         NOT NULL,
  role           VARCHAR(30)  NOT NULL
                 CHECK (role IN ('platform_super_admin', 'business_owner', 'staff')),
  is_active      BOOLEAN      DEFAULT true,
  last_login_at  TIMESTAMPTZ,
  created_at     TIMESTAMPTZ  DEFAULT now()
);

-- =============================================================================
-- INDEXES — performance for the most common query patterns
-- Every Workflow filters by business_id; conversations also filters by customer_number
-- =============================================================================

-- Products
CREATE INDEX IF NOT EXISTS idx_products_business        ON products (business_id);
CREATE INDEX IF NOT EXISTS idx_products_category        ON products (business_id, category);
CREATE INDEX IF NOT EXISTS idx_products_name            ON products USING gin (to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_products_tags            ON products USING gin (tags);

-- Discount Rules
CREATE INDEX IF NOT EXISTS idx_discount_business        ON discount_rules (business_id);
CREATE INDEX IF NOT EXISTS idx_discount_active_dates    ON discount_rules (business_id, is_active, valid_from, valid_to);

-- Customers
CREATE INDEX IF NOT EXISTS idx_customers_business       ON customers (business_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone          ON customers (business_id, phone_number);

-- Orders
CREATE INDEX IF NOT EXISTS idx_orders_business          ON orders (business_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_number   ON orders (business_id, customer_number);
CREATE INDEX IF NOT EXISTS idx_orders_status            ON orders (business_id, status);

-- Conversations — most queried per-customer for context
CREATE INDEX IF NOT EXISTS idx_conversations_business   ON conversations (business_id);
CREATE INDEX IF NOT EXISTS idx_conversations_customer   ON conversations (business_id, customer_number, created_at DESC);

-- Support Tickets
CREATE INDEX IF NOT EXISTS idx_tickets_business         ON support_tickets (business_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status           ON support_tickets (business_id, status);

-- =============================================================================
-- ROW-LEVEL SECURITY (RLS) — enable for Supabase security
-- Service-role key (used by n8n) bypasses RLS; anon/authenticated keys respect it
-- =============================================================================

ALTER TABLE businesses        ENABLE ROW LEVEL SECURITY;
ALTER TABLE products          ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_rules    ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers         ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders            ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations     ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets   ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users       ENABLE ROW LEVEL SECURITY;

-- Note: n8n uses the service-role key which bypasses RLS.
-- The dashboard (Next.js) should use per-user JWTs and RLS policies.
-- Add RLS policies after setting up Supabase Auth for the dashboard.

-- =============================================================================
-- COMMENTS — self-documenting schema
-- =============================================================================

COMMENT ON TABLE businesses        IS 'Multi-tenant root: one row per SME using the assistant';
COMMENT ON TABLE products          IS 'Product catalog; each product belongs to one business';
COMMENT ON TABLE discount_rules    IS 'Quantity-based discount rules; best-matching rule wins (no stacking)';
COMMENT ON TABLE customers         IS 'WhatsApp customers identified by phone number per business';
COMMENT ON TABLE orders            IS 'Captured orders (lead capture — no payment gateway in scope)';
COMMENT ON TABLE conversations     IS 'Full chat log; last N rows power the AI context window';
COMMENT ON TABLE support_tickets   IS 'Human handoff records with chat snapshot and suggested reply';
COMMENT ON TABLE admin_users       IS 'Dashboard users; NULL business_id = platform super admin';

COMMENT ON COLUMN businesses.waha_session     IS 'Must match WAHA session name; used to resolve business_id from webhook';
COMMENT ON COLUMN products.variants           IS 'JSONB: {"size":["S","M","L"],"color":["red","blue"]}';
COMMENT ON COLUMN discount_rules.discount_type IS 'percentage: off unit price; fixed_price: final unit price override';
COMMENT ON COLUMN orders.items                IS 'JSONB array: [{product_id, name, qty, unit_price}]';
COMMENT ON COLUMN conversations.direction     IS 'inbound = from customer; outbound = sent by bot or agent';
COMMENT ON COLUMN support_tickets.chat_snapshot IS 'Last 10 conversation rows as JSONB array for agent context';
