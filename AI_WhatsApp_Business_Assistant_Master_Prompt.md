# AI WhatsApp Business Assistant — Master Prompt
### AI/ML & Workflow-Automation Development Specification

| | |
|---|---|
| **Product Name** | AI WhatsApp Business Assistant for SMEs |
| **System Type** | Automation SaaS (n8n + WAHA WhatsApp HTTP API + Gemini AI) |
| **Based On** | Pixzora LABS (Pvt) Ltd — Developer Task Assignment, v1.0 (Approved) |
| **Prepared By** | Senith Chanidu — Group B, Pixzora Lab2 |
| **Document Type** | Master Prompt |
| **Version** | 1.0 |
| **Project Duration** | 4 August 2026 – 18 August 2026 (2 weeks) |
| **Document Date** | 4 August 2026 |

---

## 0. Master Prompt — Build Instructions

You are an expert workflow-automation and AI-integration engineer building the **AI WhatsApp Business Assistant** described below. Treat this document as the single source of truth for the build:

- Use **§7 System Architecture** for every technology decision — don't substitute a different stack unless a constraint below forces it.
- Use **§8 Database Schema** exactly as written; it is production-ready DDL, not a rough sketch.
- Use **§9 AI/NLP Layer** prompts verbatim as the starting system prompts for the Gemini nodes — tune wording only after the workflow runs end-to-end.
- Use **§10 n8n Workflow Specifications** as the literal node-by-node build order for each of the five workflows.
- Build in the sequence given in **§15 Implementation Roadmap** — it is sequenced so that each day's output is independently demoable.
- Where this document doesn't specify something, state the assumption you're making rather than silently deciding — log it against **§19 Assumptions & Out of Scope**.

---

## 1. Executive Summary

Small businesses selling on WhatsApp — clothing brands, bakeries, restaurants, grocers — lose sales because a human can't watch the chat 24/7. The **AI WhatsApp Business Assistant** is a multi-tenant automation layer, built on **n8n**, that sits between WhatsApp — via a self-hosted WAHA gateway — and a business's product/discount data. It reads incoming messages, classifies what the customer wants using AI, looks up real product and pricing data, calculates bulk-order discounts automatically, and replies in seconds — handing off to a human only when it should.

This document expands the original task assignment into a build-ready specification: full database schema, AI prompt contracts, and a node-by-node n8n workflow design, sequenced against the actual **4–18 August 2026** project window.

---

## 2. Problem Statement

Small businesses currently face:

- Slow response to customer inquiries, and messages missed entirely during busy hours
- No structured product catalog — availability and pricing live in someone's head
- Bulk orders handled manually, with pricing worked out ad hoc
- No consistent discount logic — different customers may get different deals with no record of why
- No automation for FAQs, running offers, or product recommendations

The result is lost sales, inconsistent customer experience, and hours of manual admin work per week.

## 3. Proposed Solution

An AI-powered WhatsApp assistant that:

1. Responds to customers instantly, 24/7
2. Understands customer intent using AI rather than rigid keyword rules
3. Suggests products automatically based on what's asked
4. Handles bulk-order requests — quantity, pricing, and discount — without a human
5. Applies discount rules pulled from the business's own database, not hardcoded
6. Sends clearly structured, confirmable order summaries
7. Escalates to a human the moment it's uncertain, angry, or explicitly asked to

## 4. Objectives & Success Criteria

| Objective | How it's measured |
|---|---|
| Instant response | AI reply sent within 5 seconds of message receipt (95th percentile) |
| Accurate intent detection | ≥ 85% of test messages classified with the correct intent at ≥ 0.6 confidence |
| Correct bulk pricing | 100% of discount calculations match the rules table for the test dataset |
| Safe escalation | Every complaint, explicit agent request, and low-confidence message reaches §10.5 Workflow 5 with no false negatives |
| Demo-ready by deadline | A working end-to-end conversation (inquiry → bulk order → confirmation) runnable live on 18 August 2026 |

## 5. User Roles

| Role | Description |
|---|---|
| **End Customer** | Messages the business's WhatsApp number; only ever interacts through WhatsApp, never sees the backend |
| **Business Owner** | The SME using the assistant; receives order/handoff notifications; owns their product catalog and discount rules |
| **Staff / Agent** | Optional — a business owner may delegate human-handoff conversations to staff (Phase 2, admin dashboard) |
| **Platform Super Admin** | Pixzora Lab2 / platform operator; manages all tenant businesses, subscription status, and platform-wide settings (Phase 2+) |

---

## 6. Core Feature Specifications

### 6.1 Customer Chat Automation
Instant WhatsApp replies to product inquiries, price questions, availability, offers, bulk orders, and delivery questions. The AI must use conversation context (last few messages), not just the single incoming message, since customers often ask follow-ups like "and in blue?" without repeating the product name.

### 6.2 Product Knowledge System
Each product record (§8.2) carries name, description, price, category, stock, variants (size/color/flavor), an image, and free-form tags such as "best seller" or "new" so the AI can recommend intelligently, not just retrieve by exact name match.

### 6.3 Offer & Discount Engine
Discount rules are data, not code: a business owner (or the assignment's seed script) defines quantity bands, a discount type (percentage or fixed price), an optional category restriction, and an optional validity window for time-based offers. The engine always applies the **best applicable rule**, never stacks multiple rules.

### 6.4 AI Bulk Order Handler
On detecting `BULK_ORDER` intent, the system extracts quantity and product type, fetches matching products, checks discount rules, computes a full pricing breakdown, and responds with total price, discount applied, a relevant product suggestion, and a clear call to action (Confirm order / Talk to agent).

### 6.5 Smart Product Recommendation
The AI suggests best-sellers, similar products, budget-based alternatives, or combo offers (e.g., "buy 3 cakes, get 1 free cupcake set") using the `tags` and `category` fields — this is prompt-driven, not a separate recommendation model, to keep the MVP scope realistic for two weeks.

### 6.6 Order Capture System
On confirmation, the system creates an order record, notifies the business owner (WhatsApp + email), and sends the customer a confirmation. **Note:** per the source brief, this is an order/lead capture flow, not a live payment checkout — no payment gateway is in scope (see §19).

### 6.7 Human Handoff System
Triggers on low AI confidence (< 0.6), an explicit request for a human, or a detected complaint. Sends the assigned agent the chat history, customer details, and an AI-drafted suggested reply, so the handoff doesn't cost the business owner a cold start.

---

## 7. System Architecture

### 7.1 Component Overview

```
 WhatsApp Customer
        │
        ▼
 WAHA (self-hosted WhatsApp HTTP API)  ──(webhook)──▶  n8n (orchestration layer)
                                              │
                    ┌─────────────────────────┼─────────────────────────┐
                    ▼                         ▼                         ▼
           Google Gemini API          Supabase / PostgreSQL      Cloudinary (images)
        (intent + entity + reply)     (products, orders, etc.)
                    │                         │
                    └─────────────┬───────────┘
                                  ▼
                       n8n sends reply via WAHA API
                                  │
                                  ▼
                          WhatsApp Customer
```

WAHA runs a real WhatsApp Web session inside a Docker container, linked to the business's number by scanning a QR code once. Business owner notifications branch off the Order Confirmation and Human Handoff workflows via the same WAHA API and Brevo (email).

### 7.2 Recommended Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Automation engine | **Self-hosted n8n**, via Docker Compose on the same host as WAHA (n8n Cloud remains an option if you'd rather not manage the VPS) | WAHA already needs a Docker host to run, so co-locating n8n keeps WAHA↔n8n traffic on an internal network instead of exposing WAHA's API publicly; native Postgres + LangChain (Gemini) nodes either way |
| Messaging (BSP) | **WAHA** (WhatsApp HTTP API) — self-hosted, open source | No Meta Business verification or app-review wait — link the business's own number by scanning a QR code and you're sending/receiving within minutes, a good fit for a 2-week timeline. Document Meta's official Cloud API as the production alternative (§11.1) |
| AI / NLP | **Google Gemini API** — `gemini-3.5-flash-lite` for classification/entity extraction, `gemini-3.1-pro` for final reply generation | Flash-Lite is built for exactly this: cheap, low-latency calls on every single incoming message; Pro gives noticeably better natural-language replies where tone matters. Confirm current model IDs in Google AI Studio before locking them in — the Gemini lineup moves fast |
| Database | **PostgreSQL via Supabase** | Managed Postgres, generous free tier, native n8n Postgres node, instant REST layer if the admin dashboard needs it later |
| Image storage | **Cloudinary** | Free tier, simple upload API, automatic image optimization for WhatsApp media messages |
| Transactional email | **Brevo** | Free tier, simple SMTP/API for business-owner order and handoff notifications |
| Admin dashboard (Phase 2, stretch) | **Next.js 14** on the same Supabase Postgres instance | Reuses the stack you're already fluent in; not required for the MVP demo |

---

## 8. Database Schema

All tables are scoped by `business_id` for multi-tenancy — every query in every n8n workflow must filter on it.

```sql
-- 8.1 Businesses (tenants)
CREATE TABLE businesses (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name    VARCHAR(150) NOT NULL,
  owner_name       VARCHAR(150) NOT NULL,
  owner_email      VARCHAR(150) UNIQUE NOT NULL,
  whatsapp_number  VARCHAR(20)  UNIQUE NOT NULL,
  waha_session     VARCHAR(50)  UNIQUE NOT NULL, -- name of this business's WAHA session, e.g. 'fashion-gallery'
  industry_type    VARCHAR(50),                  -- clothing, bakery, restaurant, grocery...
  subscription_plan VARCHAR(20) DEFAULT 'starter', -- starter | pro | business
  status           VARCHAR(20) DEFAULT 'trial',     -- trial | active | suspended
  created_at       TIMESTAMPTZ DEFAULT now()
);

-- 8.2 Products
CREATE TABLE products (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id   UUID REFERENCES businesses(id) ON DELETE CASCADE,
  name          VARCHAR(150) NOT NULL,
  description   TEXT,
  price         DECIMAL(10,2) NOT NULL,
  category      VARCHAR(80),
  stock         INT DEFAULT 0,
  variants      JSONB,                 -- {"size": ["S","M","L"], "color": ["red","blue"]}
  image_url     TEXT,
  tags          TEXT[],                -- {"best seller","new"}
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- 8.3 Discount Rules
CREATE TABLE discount_rules (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id       UUID REFERENCES businesses(id) ON DELETE CASCADE,
  product_category  VARCHAR(80),          -- NULL = applies across all categories
  min_quantity      INT NOT NULL,
  max_quantity      INT,                  -- NULL = no upper bound
  discount_type     VARCHAR(20) NOT NULL, -- percentage | fixed_price
  discount_value    DECIMAL(10,2) NOT NULL,
  valid_from        DATE,
  valid_to          DATE,
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- 8.4 Customers
CREATE TABLE customers (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id      UUID REFERENCES businesses(id) ON DELETE CASCADE,
  phone_number     VARCHAR(20) NOT NULL,
  name             VARCHAR(150),
  total_orders     INT DEFAULT 0,
  last_order_date  TIMESTAMPTZ,
  tags             TEXT[],               -- {"VIP","new","bulk buyer"}
  created_at       TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, phone_number)
);

-- 8.5 Orders
CREATE TABLE orders (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id       UUID REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id       UUID REFERENCES customers(id),
  customer_number   VARCHAR(20) NOT NULL,
  items             JSONB NOT NULL,       -- [{product_id, name, qty, unit_price}]
  total_price       DECIMAL(10,2) NOT NULL,
  discount_applied  DECIMAL(10,2) DEFAULT 0,
  status            VARCHAR(20) DEFAULT 'pending', -- pending | confirmed | cancelled | fulfilled
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- 8.6 Conversations (chat log — powers context + handoff)
CREATE TABLE conversations (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id      UUID REFERENCES businesses(id) ON DELETE CASCADE,
  customer_number  VARCHAR(20) NOT NULL,
  direction        VARCHAR(10) NOT NULL,  -- inbound | outbound
  message_text     TEXT,
  detected_intent  VARCHAR(40),
  confidence       NUMERIC(3,2),
  created_at       TIMESTAMPTZ DEFAULT now()
);

-- 8.7 Support Tickets (human handoff)
CREATE TABLE support_tickets (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id      UUID REFERENCES businesses(id) ON DELETE CASCADE,
  customer_number  VARCHAR(20) NOT NULL,
  reason           VARCHAR(50),           -- low_confidence | customer_request | complaint
  chat_snapshot    JSONB,
  suggested_reply  TEXT,
  status           VARCHAR(20) DEFAULT 'open', -- open | in_progress | resolved
  assigned_agent   VARCHAR(150),
  created_at       TIMESTAMPTZ DEFAULT now()
);

-- 8.8 Admin Users (Phase 2 dashboard access)
CREATE TABLE admin_users (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id    UUID REFERENCES businesses(id) ON DELETE CASCADE, -- NULL = platform super admin
  name           VARCHAR(150) NOT NULL,
  email          VARCHAR(150) UNIQUE NOT NULL,
  password_hash  TEXT NOT NULL,
  role           VARCHAR(30) NOT NULL,   -- platform_super_admin | business_owner | staff
  created_at     TIMESTAMPTZ DEFAULT now()
);
```

---

## 9. AI / NLP Layer

### 9.1 Intent Taxonomy

| Intent | Meaning | Example |
|---|---|---|
| `PRODUCT_INQUIRY` | Asking about a product generally | "Do you have summer dresses?" |
| `PRICE_CHECK` | Asking specifically for a price | "How much is the blue one?" |
| `AVAILABILITY_CHECK` | Stock question | "Is size M in stock?" |
| `OFFER_REQUEST` | Asking about deals/discounts | "Any offers running?" |
| `BULK_ORDER` | Quantity-driven order (rule of thumb: ≥10 units) | "I need 30 shirts for my shop" |
| `DELIVERY_QUESTION` | Shipping/delivery query | "Do you deliver to Kandy?" |
| `ORDER_CONFIRMATION` | Confirming a proposed order | "Yes, confirm it" |
| `COMPLAINT` | Dissatisfaction | "My last order was wrong" |
| `HUMAN_HANDOFF_REQUEST` | Explicitly wants a person | "Can I talk to someone?" |
| `GENERAL_QUESTION` | Fallback / FAQ | "What time do you close?" |

### 9.2 Classifier Output Contract

Used as the **Structured Output Parser** schema attached to the classification **AI Agent** node in Workflow 1.

```json
{
  "intent": "BULK_ORDER",
  "confidence": 0.94,
  "entities": {
    "product_name": "T-shirt",
    "product_category": "clothing",
    "quantity": 25,
    "variant": null,
    "budget": null
  },
  "language": "en"
}
```

### 9.3 Prompt Templates

**Classifier system prompt** (Google Gemini Chat Model feeding the classification AI Agent node):

```
You are the intent-and-entity extraction layer for {{business_name}}'s WhatsApp
sales assistant.

Given the customer's latest message and up to 3 prior turns of conversation
history for context, return ONLY a JSON object — no prose, no markdown —
matching this schema:

{
  "intent": "PRODUCT_INQUIRY | PRICE_CHECK | AVAILABILITY_CHECK | OFFER_REQUEST
            | BULK_ORDER | DELIVERY_QUESTION | ORDER_CONFIRMATION | COMPLAINT
            | HUMAN_HANDOFF_REQUEST | GENERAL_QUESTION",
  "confidence": <float 0-1>,
  "entities": {
    "product_name": <string or null>,
    "product_category": <string or null>,
    "quantity": <integer or null>,
    "variant": <string or null>,
    "budget": <number or null>
  },
  "language": "<ISO 639-1 code of the language the customer wrote in>"
}

Rules:
- A quantity of 10 or more units MUST be classified as BULK_ORDER.
- Never invent a product_name that wasn't in the message — leave it null if unclear.
- If confidence is below 0.6, still return your best guess; downstream logic
  handles escalation, not you.
```

**Response-generation system prompt** (used in Workflows 2 and 3):

```
You are {{business_name}}'s friendly WhatsApp sales assistant. Reply in the
customer's language ({{language}}).

Tone: warm, concise, like a helpful shop assistant — not corporate, not
robotic. Use at most 1–2 relevant emoji.

You are given:
- Customer intent: {{intent}}
- Matched product(s): {{products_json}}
- Applicable discount (if any): {{discount_json}}
- Order total (bulk orders only): {{pricing_json}}

Format rules:
- For bulk orders, show unit price, quantity, discount %, and final total as a
  clear line-by-line breakdown.
- Always end with one clear next step ("Would you like to confirm this
  order?" or two short reply options).
- Never state a price that isn't present in the data you were given.
- If no matching product was found, say so honestly and offer to connect them
  with the team — never guess at a product that might not exist.
```

### 9.4 Confidence & Escalation Thresholds

| Condition | Action |
|---|---|
| `confidence ≥ 0.6` | Proceed with the matched intent's workflow |
| `confidence < 0.6` | Route to Workflow 5 (Human Handoff), reason = `low_confidence` |
| `intent = COMPLAINT` | Always route to Workflow 5, regardless of confidence |
| `intent = HUMAN_HANDOFF_REQUEST` | Always route to Workflow 5, reason = `customer_request` |

---

## 10. n8n Workflow Specifications

Node names below match current n8n node types (`Webhook` — receives WAHA's POST callbacks, `HTTP Request` — calls WAHA's REST endpoints to send messages, `AI Agent` + `Google Gemini Chat Model` + `Structured Output Parser`, `Postgres`, `Switch`/`IF`, `Code`).

### 10.1 Workflow 1 — Incoming Message Router

| # | Node | Purpose |
|---|---|---|
| 1 | **Webhook** | Fires on WAHA's `message` event (POST from the WAHA container); ignore events where `payload.fromMe = true` so the bot doesn't react to its own outgoing messages |
| 2 | **Code** | Normalize payload — extract `payload.from`, `payload.body`, `payload.timestamp`, resolve `business_id` by matching the webhook's top-level `session` name against `businesses.waha_session` |
| 3 | **Postgres** | Insert into `conversations` (`direction = inbound`); fetch the last 5 messages for this customer as context |
| 4 | **AI Agent** (Google Gemini Chat Model + Structured Output Parser, §9.3 classifier prompt) | Classify intent, extract entities, return §9.2 contract |
| 5 | **Switch** | Route on `intent`: → Workflow 2 (inquiry intents), → Workflow 3 (`BULK_ORDER`), → Workflow 4 (`ORDER_CONFIRMATION`), → Workflow 5 (`COMPLAINT` / `HUMAN_HANDOFF_REQUEST` / low confidence), default → simple FAQ auto-reply |

### 10.2 Workflow 2 — Product Inquiry Flow
*(handles `PRODUCT_INQUIRY`, `PRICE_CHECK`, `AVAILABILITY_CHECK`, `OFFER_REQUEST`, `DELIVERY_QUESTION`, `GENERAL_QUESTION`)*

| # | Node | Purpose |
|---|---|---|
| 1 | **Postgres** | Query `products` where `business_id` = X and `name`/`category` matches extracted entities |
| 2 | **IF** | Check `stock > 0` |
| 3 | **AI Agent** (§9.3 response prompt) | Generate the reply using matched product data |
| 4 | **HTTP Request** (WAHA `POST /api/sendText`, or `POST /api/sendImage` for a visual reply using `image_url`) | Send the reply back to the customer's `chatId` |

### 10.3 Workflow 3 — Bulk Order Flow

| # | Node | Purpose |
|---|---|---|
| 1 | **Postgres** | Fetch matching products by category/name |
| 2 | **Postgres** | Fetch active `discount_rules` where quantity falls in `[min_quantity, max_quantity]` and today is within `[valid_from, valid_to]` |
| 3 | **Code** (JavaScript) | Calculate `unit_price × quantity`, apply the best-matching discount, compute final total |
| 4 | **AI Agent** (§9.3 response prompt) | Format the pricing breakdown into a friendly, structured reply |
| 5 | **HTTP Request** (WAHA `POST /api/sendText`) | Send the pricing breakdown with a clear text call-to-action — e.g. "Reply *CONFIRM* to place this order, or *AGENT* to talk to our team." WAHA's WhatsApp Web session doesn't reliably support Meta's native interactive-button messages, so confirmation is a free-text reply that Workflow 1's classifier interprets as `ORDER_CONFIRMATION` or `HUMAN_HANDOFF_REQUEST` |

### 10.4 Workflow 4 — Order Confirmation

| # | Node | Purpose |
|---|---|---|
| 1 | Trigger | Continuation of Workflow 1 when `intent = ORDER_CONFIRMATION` — the customer replying "confirm," "yes," etc., classified by the §9.3 prompt rather than a native button payload |
| 2 | **Postgres** | Insert into `orders` (`status = confirmed`, `items` as JSONB) |
| 3 | **Postgres** | Upsert `customers` — increment `total_orders`, update `last_order_date`, tag `bulk buyer` if qty ≥ 20 |
| 4 | **HTTP Request** (Brevo API) | Email the business owner the order details |
| 5 | **HTTP Request** (WAHA `POST /api/sendText`) | Notify the business owner's WhatsApp number too |
| 6 | **HTTP Request** (WAHA `POST /api/sendText`) | Send the customer their confirmation message |

### 10.5 Workflow 5 — Human Handoff

| # | Node | Purpose |
|---|---|---|
| 1 | Trigger | From Workflow 1's Switch: `COMPLAINT`, `HUMAN_HANDOFF_REQUEST`, or `confidence < 0.6` |
| 2 | **Postgres** | Fetch last 10 messages from `conversations` for this customer |
| 3 | **Postgres** | Insert `support_tickets` row with `chat_snapshot` and `reason` |
| 4 | **AI Agent** | Draft a `suggested_reply` for the human agent, summarizing the situation |
| 5 | **HTTP Request** (WAHA `POST /api/sendText`) / **HTTP Request** (Brevo) | Notify the assigned agent/business owner with chat history + suggested reply |
| 6 | **HTTP Request** (WAHA `POST /api/sendText`) | Send the customer a holding message ("Connecting you with our team — they'll reply shortly!") |

---

## 11. Third-Party Integrations

### 11.1 WhatsApp Integration (WAHA)
- **Primary:** WAHA (WhatsApp HTTP API) — an open-source, self-hosted gateway that drives a real WhatsApp Web session from inside a Docker container (`devlikeapro/waha` image). Deploy it on a small VPS, start a session, and link it to the business's number by scanning a QR code from the WAHA dashboard — no Meta app review, no Business Manager verification.
- **Session model:** each business's WhatsApp number = one named WAHA session (e.g. `fashion-gallery`, matching the new `businesses.waha_session` column in §8.1). Point that session's webhook at n8n's production Webhook URL — `PUT /api/sessions/{session}` with `config.webhooks[0].url` and `events: ["message"]` — so every inbound message reaches Workflow 1. One container can run multiple sessions, but each new business still needs a human to scan a QR code; there's no self-serve number provisioning the way Meta's Cloud API offers.
- **Credentials in n8n:** a single API key credential (WAHA's `X-Api-Key` header) attached to every `HTTP Request` node that calls WAHA — no OAuth flow, since there's no Meta app to register.
- **Sending messages:** `HTTP Request` node → `POST {WAHA_URL}/api/sendText` with a JSON body of `session`, `chatId` (format `<countrycode+number>@c.us`, not the "+94 7X XXX XXXX" format stored in the DB), and `text`; `POST /api/sendImage` for product photos, same `chatId` pattern.
- **Known constraint:** because WAHA automates WhatsApp Web rather than using Meta's official Business Platform, it doesn't get native interactive buttons/list messages or official message templates (see the text-based confirmation workaround in §10.3/§10.4), and Meta doesn't officially sanction this approach for commercial use at scale — heavy automated volume on one number carries a ban risk. Use a dedicated number for the bot, not the owner's personal WhatsApp, and keep volume realistic for the MVP demo.
- **Alternatives for production:** if the ban/session-stability risk becomes a real problem at scale, Meta's official WhatsApp Cloud API (directly, or via Twilio/360dialog) remains the fully compliant path — worth revisiting at Phase 4 (multi-business scaling) rather than for the MVP.

### 11.2 Google Gemini API
`gemini-3.5-flash-lite` for the classifier (Workflow 1) — fast and inexpensive enough to run on every single incoming message. `gemini-3.1-pro` for response generation (Workflows 2, 3, 5) where tone and naturalness matter more than raw speed. Both are called through n8n's **Google Gemini Chat Model** node, feeding into the relevant **AI Agent** node; a single Google AI Studio API key stored as an n8n credential covers both models. Double-check the current recommended model IDs in Google AI Studio before the build starts — Gemini's lineup gets renamed and superseded every few months.

### 11.3 Supabase / PostgreSQL
Run the DDL in §8 directly in the Supabase SQL editor. Use the native n8n **Postgres** node (not the HTTP Request node) for all reads/writes — it handles parameterized queries safely and avoids SQL injection from customer-supplied text.

### 11.4 Cloudinary
Store product images here; save the resulting secure URL into `products.image_url`. WhatsApp media messages require a publicly reachable HTTPS URL, which Cloudinary provides natively.

### 11.5 Brevo
Use for business-owner email notifications (Workflow 4 and 5) via Brevo's transactional email API, called from an n8n `HTTP Request` node with the Brevo API key stored as an n8n credential — never hardcoded in the node.

---

## 12. Admin Dashboard & Access Control *(Phase 2 — not required for the 2-week MVP)*

| Role | Scope |
|---|---|
| **Platform Super Admin** | All businesses; subscription/billing status; platform-wide settings |
| **Business Owner** | Own business only — products, discount rules, orders, support tickets |
| **Staff** | Own business only — can view/respond to support tickets, cannot edit discount rules or subscription |

`admin_users.role` (§8.8) enforces this; a Next.js 14 dashboard reading the same Supabase instance is the natural fit once this becomes in-scope.

---

## 13. Example Conversation Flows

### 13.1 Bulk Clothing Order
> **Customer:** "I need 25 T-shirts for my shop."
> **System:** intent → `BULK_ORDER` · fetch T-shirt products · match discount rule (20+ items → 10%) · calculate: unit $10 × 25 = $250, discount $25, final $225.
>
> **Reply:**
> "We found a great deal for you 🎉
> 👕 T-Shirt (Premium Cotton) — Qty: 25 — Unit Price: $10
> 💰 Discount Applied: 10% — Total Price: $225
> Would you like to confirm this order?"

### 13.2 Simple Product Inquiry
> **Customer:** "Do you have chocolate cake, and how much?"
> **System:** intent → `PRODUCT_INQUIRY` + `PRICE_CHECK` · fetch product `Chocolate Cake` · stock check passes.
>
> **Reply:**
> "Yes! 🍫 Our Chocolate Cake is $18 (serves 6–8). Want me to check delivery to your area, or would you like to order one?"

### 13.3 Complaint → Human Handoff
> **Customer:** "This is the second time my order arrived late, I'm really unhappy."
> **System:** intent → `COMPLAINT` (always escalates regardless of confidence) · chat history + suggested reply sent to business owner.
>
> **Reply to customer:** "I'm really sorry to hear that. I'm connecting you with our team right now so they can sort this out for you directly."

---

## 14. Non-Functional Requirements

| Category | Requirement |
|---|---|
| **Performance** | End-to-end reply (webhook → classify → query → respond) under 5 seconds, 95th percentile |
| **Scalability** | Every table and every n8n query scoped by `business_id`; no business-specific hardcoding in workflow logic |
| **Security** | Verify WAHA's `X-Webhook-Hmac` signature (SHA-512 HMAC over the raw request body, set via `config.webhooks[].hmac.key`) on every inbound Webhook call — the WAHA equivalent of checking Meta's `X-Hub-Signature-256`; all API keys — WAHA's `X-Api-Key`, the Gemini API key, Brevo — stored as n8n credentials, never inline in node parameters; Postgres queries always parameterized via the Postgres node |
| **Data privacy** | Phone numbers and chat content are PII — restrict Supabase access to service-role keys used only inside n8n, define a data-retention policy for `conversations` |
| **Reliability** | Attach n8n error workflows / retry-on-fail to every external API call (WAHA, Gemini, Brevo) — these are the nodes most likely to time out. Also watch WAHA's `session.status` webhook event: unlike Meta's Cloud API, a WAHA session can drop if the linked phone loses connectivity or gets logged out, and needs a fresh QR scan to recover |
| **Localization** | Reply in the customer's detected language; for a Sri Lanka–oriented deployment this typically means Sinhala or Tamil alongside English — the `language` field in §9.2 already carries this signal |

---

## 15. Implementation Roadmap — 2-Week Sprint (4–18 August 2026)

### Week 1 — Core MVP (Aug 4–10)
| Day | Focus |
|---|---|
| 1–2 | n8n instance, WAHA container deployed + business number linked via QR scan, Google AI Studio (Gemini) API key, Supabase project, run §8 schema |
| 3–4 | Build Workflow 1 (router) + tune the §9.3 classifier prompt + build Workflow 2 (product inquiry) |
| 5–6 | Seed a demo business + product catalog; test end-to-end inquiry conversations in English and one local language |
| 7 | Buffer, bug-fixing, checkpoint demo |

### Week 2 — Discounts, Bulk Orders, Handoff, Polish (Aug 11–18)
| Day | Focus |
|---|---|
| 8–9 | Seed `discount_rules`; build Workflow 3 (bulk order + pricing calculation) |
| 10–11 | Build Workflow 4 (order confirmation) and Workflow 5 (human handoff) |
| 12–13 | End-to-end testing across all 5 workflows; edge cases — out of stock, no matching discount, low-confidence fallback; add retries/error handling |
| 14 (Aug 18) | Final polish, documentation, demo run-through, submission |

### Beyond the Assignment — Phase 2–4 (Future Roadmap)
- **Phase 2:** Admin dashboard (§12), refined discount/bulk-order logic
- **Phase 3:** Analytics, automated customer tagging, smarter recommendations
- **Phase 4 (SaaS scaling):** Multi-business self-serve onboarding, white-label, subscription billing

---

## 16. Monetization Model

| Plan | Price | Includes |
|---|---|---|
| Starter | $15/month | 1 business |
| Pro | $49/month | Automation + AI |
| Business | $99/month | Multi-agent + analytics |

**Extra revenue:** setup fees, custom integrations, white-label licensing.

## 17. Competitive Advantage

Most WhatsApp bots only answer FAQs. This system additionally understands business logic, handles pricing rules, manages bulk orders, and acts like a real sales assistant — AI reasoning combined with structured business rules, not one or the other.

## 18. Future Expansion

- Voice WhatsApp assistant
- An AI sales agent that closes deals end-to-end
- Instagram DM automation
- Shopify integration
- CRM dashboard

---

## 19. Assumptions & Out of Scope

- WAHA (self-hosted WhatsApp HTTP API) is the primary WhatsApp gateway for the build, running one session for the pilot business; Meta's official Cloud API is documented as a production alternative (§11.1) but not implemented in parallel.
- The 2-week MVP is built and tested against **one pilot/demo business**; true multi-tenant self-service onboarding is Phase 4.
- Localization is demonstrated in English + one local language for the MVP, not full multi-language coverage.
- The admin dashboard (§12) is out of scope for the 2-week deliverable — only the database/schema needed to support it later is built now.
- No payment gateway is in scope: consistent with the source brief, "Order Capture" creates a confirmed order record and notifies the owner — actual payment collection (e.g., Cash on Delivery) happens outside the system, off-platform.

## 20. Appendix — Sample Payloads

**Business-owner order notification (WhatsApp text):**
```
🆕 New Order Confirmed
Customer: +94 7X XXX XXXX
Items: T-Shirt (Premium Cotton) × 25
Total: $225 (10% bulk discount applied)
Status: Pending fulfillment
```

**Support ticket handoff summary (sent to agent):**
```json
{
  "customer_number": "+94 7X XXX XXXX",
  "reason": "complaint",
  "chat_snapshot": ["...last 10 messages..."],
  "suggested_reply": "Apologize for the delayed delivery, confirm the order number, and offer a revised delivery window."
}
```
