
AI WhatsApp Business Assistant (n8n Automation System)
AI/ML Engineer Task Assignment Document




Project Name: AI WhatsApp Business Assistant Document Type: Developer Task Assignment Prepared For: Development Team
Prepared By: Pixzora LABS (Pvt) Ltd
Project Owner: Pixzora LABS (Pvt) Ltd
Version: Version 1.0
Document Status: Approved

Project Duration: 4th August,2026 - 18th August,2026

Prepared Date: 4th August, 2026






 
1.	Project Overview

Product Name
AI WhatsApp Business Assistant for SMEs

Type
Automation SaaS (built using n8n + WhatsApp API + AI)

Purpose
To help small businesses (clothing brands, bakeries, restaurants, food sellers, etc.) automate customer communication, order handling, product suggestions, and bulk discount management via WhatsApp.

2.	Problem Statement
Small businesses face:

●	Slow response to customer inquiries
●	Missed WhatsApp messages
●	No proper product catalog management
●	Manual handling of bulk orders
●	No structured discount system
●	No automation for FAQs, offers, or product recommendations

Result:
Lost sales + poor customer experience + time waste


3.	Solution
An AI-powered WhatsApp assistant that:

●	Responds instantly to customers
●	Understands customer intent using AI
●	Suggests products automatically
●	Handles bulk order requests intelligently
●	Applies discount rules from the database
●	Sends structured order messages
●	Escalates to a human when needed
 
4.	Core Features

4.1	Customer Chat Automation
●	Instant WhatsApp replies
●	AI understands message context
●	Handles:
○	Product inquiries
○	Price questions
○	Availability
○	Offers
○	Bulk orders
○	Delivery questions

4.2	Product Knowledge System
Stored in database:

Each product contains:

●	Name
●	Description
●	Price
●	Category
●	Stock availability
●	Variants (size, color, flavor)
●	Images
●	Tags (e.g., “best seller”, “new”)

4.3	Offer & Discount Engine
Business can be defined:

Discount Rules Table:
●	Min quantity (e.g., 10 items)
●	Max quantity
●	Discount type:
○	Percentage
○	Fixed price
●	Category-based discount
●	Time-based offers (festive, weekend deals)



Example:
 
Condition	Discount
10–20 items	5%
21–50 items	10%
50+ items	15%

4.4	AI Bulk Order Handler
When the customer says:

“I want 30 shirts for my shop.” System will:
1.	Detect intent = BULK_ORDER
2.	Extract quantity + product type
3.	Fetch matching products
4.	Check discount rules
5.	Generate pricing table
6.	Respond with:
○	Total price
○	Discount applied
○	Product recommendation
○	CTA (Confirm order / Talk to agent)

4.5	Smart Product Recommendation
AI suggests:

●	Best-selling products
●	Similar products
●	Budget-based alternatives
●	Combo offers Example:
“If you buy 3 cakes, you get 1 free cupcake set”

4.6	Order Capture System
When customer confirms:

●	Create order entry
●	Store in database
●	Notify business owner
●	Send confirmation to customer
 
4.7	Human Handoff System
Triggers when:

●	AI confidence is low
●	Customer requests agent
●	Complaint detected Sends:
●	Chat history
●	Customer details
●	Suggested reply
 
5.	System Architecture

Tech Stack
Backend Automation
●	n8n (core engine)

AI Layer
●	OpenAI / GPT API

Messaging
●	WhatsApp Business API (Meta / Twilio / 360dialog)

Database
●	PostgreSQL / MySQL (recommended)
●	Airtable (MVP option)

Storage
●	S3 / Cloudinary (product images)




6.	Database Structure

6.1	Products Table
id business_id name description price category stock variants image_url tags created_at
 
6.2	Discount Rules Table
id business_id
product_category min_quantity max_quantity discount_type discount_value valid_from valid_to

6.3	Orders Table
id customer_number business_id
items (JSON) total_price discount_applied status created_at

6.4	Customers Table
id phone_number name total_orders last_order_date
tags (VIP, new, bulk buyer)
 
7.	AI Decision Flow Logic
When the message arrives:

Step 1: Message Classification
AI classifies intent:

●	Product inquiry
●	Bulk order
●	Price check
●	Offer request
●	Complaint
●	General question

Step 2: Entity Extraction
Extract:

●	Product name
●	Quantity
●	Budget
●	Category

Step 3: Database Lookup
Search:

●	Product table
●	Discount rules
●	Stock availability

Step 4: Business Logic Processing
IF bulk order:

●	Check discount rules
●	Calculate price
●	Apply best discount
●	Suggest bundles
 
Step 5: AI Response Generation
AI formats response:

●	Friendly tone
●	Structured pricing
●	CTA buttons
●	Product suggestions


8.	n8n Workflow Structure

Workflow 1: Incoming WhatsApp Message

Nodes:
1.	WhatsApp Trigger Node
2.	Webhook Receiver
3.	AI Intent Classifier (OpenAI node)
4.	Switch Node (Intent Routing)

Workflow 2: Product Inquiry Flow
1.	Query product DB
2.	Fetch product details
3.	AI response generator
4.	Send WhatsApp message

Workflow 3: Bulk Order Flow
1.	Extract quantity + product
2.	Fetch product list
3.	Fetch discount rules
4.	Calculate pricing (Function Node)
5.	AI formatting node
6.	Send structured response

Workflow 4: Order Confirmation
1.	Detect "confirm order"
2.	Save to Orders DB
3.	Notify business owner (Email/WhatsApp)
4.	Send confirmation to customer
 
Workflow 5: Human Handoff
1.	Detect escalation trigger
2.	Send chat history to admin
3.	Create support ticket
4.	Notify human agent


9.	Example Customer Flow
Scenario: Bulk Clothing Order
Customer:

“I need 25 T-shirts for my shop.” System:
1.	Detect intent → Bulk Order
2.	Fetch T-shirt products
3.	Check discount:
○	20+ items → 10% discount
4.	Calculate:
○	Unit price: $10
○	Total: $250
○	Discount: $25
○	Final: $225

Response:
We found a great deal for you 🎉
👕 T-Shirt (Premium Cotton) Qty: 25
Unit Price: $10
💰 Discount Applied: 10% Total Price: $225

Would you like to confirm this order?
 
10.	MVP Development Plan
Phase 1 (Core MVP)
●	WhatsApp integration
●	Product database
●	AI chat responses
●	Basic order handling

Phase 2
●	Discount engine
●	Bulk order logic
●	Admin dashboard

Phase 3
●	Analytics
●	Customer tagging
●	Smart recommendations

Phase 4 (SaaS Scaling)
●	Multi-business support
●	White-label system
●	Subscription billing


11.	Key Features That Make It Powerful
●	24/7 automated sales assistant
●	Converts chats into sales
●	Handles bulk pricing automatically
●	Removes human workload
●	Increases conversion rate
●	Works in local language + English


12.	Monetization Model
SaaS Pricing:
●	Starter: $15/month (1 business)
●	Pro: $49/month (automation + AI)
●	Business: $99/month (multi-agent + analytics)
 
Extra Revenue:
●	Setup fee
●	Custom integrations
●	White-label licensing


13.	Competitive Advantage
Most WhatsApp bots:
●	Only reply to FAQs This system:
✔ Understands business logic
✔ Handles pricing rules
✔ Manages bulk orders
✔ Acts like a real sales assistant
✔ Uses AI + structured business rules

14.	Future Expansion
●	Voice WhatsApp assistant
●	An AI sales agent that closes deals
●	Instagram DM automation
●	Shopify integration
●	CRM dashboard
