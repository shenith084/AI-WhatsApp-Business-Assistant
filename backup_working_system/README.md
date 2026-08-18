# AI WhatsApp Business Assistant

> **n8n + WAHA + Google Gemini + Supabase**  
> AI-powered WhatsApp sales assistant for SMEs — built for Pixzora Lab2, August 2026 sprint.

---

## Overview

This system sits between a business's WhatsApp number and their product/discount data. It reads incoming messages, classifies customer intent using AI, looks up real product and pricing data, handles bulk orders automatically, and escalates to a human only when needed.

**Tech Stack:**
| Layer | Technology |
|---|---|
| Automation Engine | n8n (self-hosted, Docker) |
| WhatsApp Gateway | WAHA — WhatsApp HTTP API (Docker) |
| AI / NLP | Google Gemini (`gemini-2.0-flash-lite` + `gemini-2.5-pro`) |
| Database | PostgreSQL via Supabase |
| Images | Cloudinary |
| Email | Brevo |
| Dashboard | Next.js 14 (in `dashboard/`) |

---

## Quick Start

### Prerequisites
- Docker Desktop installed and running ✅
- A dedicated WhatsApp number (not personal) ready to scan QR
- Accounts created for: Supabase, Google AI Studio, Brevo, Cloudinary

### Step 1 — Clone & Configure

```bash
# Copy env template
cp .env.example .env

# Fill in ALL values in .env before continuing
# Critical: WAHA_API_KEY, GEMINI_API_KEY, Supabase credentials
```

### Step 2 — Start Containers

```bash
docker compose up -d
```

Wait ~30 seconds for both services to be healthy.

- **n8n UI:** http://localhost:5678 (login with `N8N_BASIC_AUTH_USER` / `N8N_BASIC_AUTH_PASSWORD`)
- **WAHA Dashboard:** http://localhost:3000

### Step 3 — Link WhatsApp Number

1. Open WAHA Dashboard at http://localhost:3000
2. Click **"Start Session"** → session name: `fashion-gallery`
3. Scan the QR code with the business's WhatsApp (on the phone, go to Settings → Linked Devices → Link a Device)
4. Session status should turn **CONNECTED** ✅

### Step 4 — Set WAHA Webhook

```bash
# Replace YOUR_N8N_WEBHOOK_URL with your actual n8n webhook URL
# (get it from n8n after importing Workflow 1)
curl -X PUT http://localhost:3000/api/sessions/fashion-gallery \
  -H "X-Api-Key: YOUR_WAHA_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "config": {
      "webhooks": [{
        "url": "YOUR_N8N_WEBHOOK_URL/webhook/whatsapp-webhook",
        "events": ["message"],
        "hmac": { "key": "YOUR_HMAC_SECRET" }
      }]
    }
  }'
```

### Step 5 — Set Up Supabase Database

1. Go to [supabase.com](https://supabase.com) → create a new project
2. Open **SQL Editor** → paste contents of `database/schema.sql` → run
3. Paste contents of `database/seed.sql` → run
4. Copy the returned `business_id` (should be `11111111-1111-1111-1111-111111111111`)
5. Add to your `.env`: `PILOT_BUSINESS_ID=11111111-1111-1111-1111-111111111111`

### Step 6 — Import n8n Workflows

1. Open n8n UI at http://localhost:5678
2. Go to **Workflows** → **Import from file**
3. Import all 5 files from the `workflows/` folder in this order:
   - `01_incoming_message_router.json` → **Activate** ✅
   - `02_product_inquiry_flow.json` → Activate ✅
   - `03_bulk_order_flow.json` → Activate ✅
   - `04_order_confirmation.json` → Activate ✅
   - `05_human_handoff.json` → Activate ✅

### Step 7 — Configure n8n Credentials

In n8n, go to **Settings → Credentials** and add:

| Credential Name | Type | Details |
|---|---|---|
| `Supabase PostgreSQL` | Postgres | Host/DB/User/Password from Supabase dashboard |
| `Google Gemini API` | Google Gemini | Paste your Google AI Studio API key |

### Step 8 — Make WAHA Publicly Accessible (for webhooks)

If running locally, WAHA's webhook needs a public URL. Use **ngrok**:

```bash
# Install ngrok from https://ngrok.com
ngrok http 5678

# Copy the HTTPS URL (e.g., https://abc123.ngrok-free.app)
# Update .env: N8N_WEBHOOK_URL=https://abc123.ngrok-free.app
# Restart: docker compose restart n8n
```

For production, deploy on a VPS with a proper domain and SSL.

### Step 9 — Start the Admin Dashboard

```bash
cd dashboard
cp .env.local.example .env.local
# Fill in Supabase URL and anon key

npm run dev
# Open: http://localhost:3001
```

---

## Project Structure

```
AI WhatsApp Business Assistant/
├── docker-compose.yml          # n8n + WAHA containers
├── .env.example                # Environment variables template
├── README.md                   # This file
│
├── database/
│   ├── schema.sql              # All 8 tables DDL (run first)
│   └── seed.sql                # Demo Fashion Gallery data
│
├── prompts/
│   ├── classifier_system_prompt.txt      # Gemini intent classifier
│   └── response_generation_system_prompt.txt  # Gemini reply generator
│
├── workflows/
│   ├── 01_incoming_message_router.json   # Workflow 1: Router
│   ├── 02_product_inquiry_flow.json      # Workflow 2: Product inquiry
│   ├── 03_bulk_order_flow.json           # Workflow 3: Bulk orders
│   ├── 04_order_confirmation.json        # Workflow 4: Order capture
│   └── 05_human_handoff.json             # Workflow 5: Human handoff
│
└── dashboard/                  # Next.js 14 admin dashboard
    ├── src/app/                # App Router pages
    └── ...
```

---

## Test Scenarios (§13 Master Prompt)

Send these messages to the linked WhatsApp number:

### 1. Bulk Order (Workflow 3)
> **You:** "I need 25 T-shirts for my shop"  
> **Expected:** `BULK_ORDER` → 10% discount → total breakdown → CONFIRM/AGENT prompt

### 2. Product Inquiry (Workflow 2)
> **You:** "Do you have denim jackets and how much are they?"  
> **Expected:** `PRODUCT_INQUIRY` → product details with price → in stock

### 3. Complaint → Handoff (Workflow 5)
> **You:** "This is the second time my order arrived late, I'm really unhappy"  
> **Expected:** `COMPLAINT` → support ticket created → holding message to customer → agent notified

### 4. Human Request (Workflow 5)
> **You:** "Can I talk to someone please?"  
> **Expected:** `HUMAN_HANDOFF_REQUEST` → instant handoff, no hesitation

### 5. Low Confidence → Handoff (Workflow 5)
> **You:** "uuuhh idk maybe some blue thing?" (vague)  
> **Expected:** `confidence < 0.6` → `GENERAL_QUESTION` → escalate to human

---

## Discount Rules (Seeded)

| Rule | Category | Qty | Discount |
|---|---|---|---|
| Small Bulk | All | 10–19 | 5% off |
| Medium Bulk | All | 20–49 | 10% off |
| Large Bulk | All | 50+ | 15% off |
| T-Shirt Bulk | T-shirts | 30+ | 12% off |
| Accessories Flash | Accessories | 5+ | $5/item fixed |

> **Note:** The best single applicable rule wins — no stacking.

---

## Security Notes

- WAHA's `X-Webhook-Hmac` signature should be verified in Workflow 1's Webhook node (SHA-512 HMAC)
- All API keys are stored as n8n Credentials — never inline in node parameters
- Postgres queries use parameterized values via n8n's Postgres node (SQL injection safe)
- Use the Supabase **service-role key** in n8n (bypasses RLS); use **anon key** in the dashboard

---

## Troubleshooting

| Problem | Fix |
|---|---|
| WAHA session disconnects | Re-scan QR code; use a stable phone connection |
| Webhook not firing | Check `N8N_WEBHOOK_URL` is publicly accessible; verify ngrok is running |
| `gemini-2.0-flash-lite` not found | Check current model IDs at aistudio.google.com |
| n8n can't reach Supabase | Verify `SUPABASE_DB_HOST`, port 5432 is open; check Supabase connection pooling |
| No products returned | Run `seed.sql` and confirm `PILOT_BUSINESS_ID` matches seed data |
