# Billing & Affiliate System Workflow

This document explains the billing workflow for Proppi, from project creation to affiliate payouts.

---

## Overview

The billing system tracks revenue from image and video projects, integrates with Fiken (Norwegian accounting software) for invoicing, and supports an affiliate program with commission tracking.

**Default Pricing:**
- Image projects: 1000 NOK (per project, up to 20 images)
- Video projects: 1000 NOK (per video)
- Custom pricing can be set per workspace via `workspacePricing` table

---

## Workflow Stages

### Stage 1: Invoice Line Item Creation (Automatic)

Invoice line items are created automatically when work is completed:

**Image Projects** (`lib/db/queries.ts` → `updateProjectCounts`):
- Triggered when the first image in a project completes successfully
- Checks `previousCompletedCount === 0 && completedCount > 0`
- Creates a "pending" invoice line item with workspace pricing

**Video Projects** (`lib/actions/video.ts` → `triggerVideoGeneration`):
- Triggered when video generation starts
- Creates a "pending" invoice line item immediately

**Important:** Line items are idempotent - the system checks for existing items before creating duplicates.

---

### Stage 2: Admin Review (`/admin/billing`)

The billing page shows two tabs:

**"Ikke fakturert" (Uninvoiced) Tab:**
- Lists all pending invoice line items
- Grouped by workspace with totals
- Shows warning icon if workspace is missing org.nr (required for invoicing)
- Admin can select multiple items and click "Send faktura"

**"Fakturahistorikk" (Invoice History) Tab:**
- Shows all created invoices with status
- Statuses: Utkast (draft), Sendt (sent), Betalt (paid), Forfalt (overdue), Kansellert (cancelled)

---

### Stage 3: Invoice Creation & Sending to Fiken

When admin clicks "Send faktura" (`lib/actions/billing.ts`):

1. **`createInvoiceFromLineItemsAction`**:
   - Groups selected line items by workspace
   - Creates one invoice per workspace
   - Links line items to the invoice
   - Updates line item status to "invoiced"

2. **`sendInvoiceToFikenAction`**:
   - Validates workspace has org.nr
   - Creates/finds customer contact in Fiken
   - Creates invoice in Fiken via API
   - Updates invoice with Fiken ID and invoice number
   - Sets invoice status to "sent"

---

### Stage 4: Payment & Affiliate Earnings

When admin marks an invoice as paid (`markInvoiceAsPaidAction`):

1. Updates invoice status to "paid"
2. Sets `paidAt` timestamp
3. **Checks for affiliate relationship** for the invoiced workspace
4. If affiliate exists, creates an `affiliateEarning` record:
   - Calculates commission based on relationship's `commissionPercent`
   - Status set to "pending" (awaiting payout)

---

### Stage 5: Affiliate Management (`/admin/affiliates`)

The affiliates page shows:

**Stats Bar:**
- Total pending earnings (awaiting payout)
- Total paid out
- Active affiliate count
- Pending payout count

**Relationships Table:**
- Affiliate workspace → Referred workspace
- Commission percentage (e.g., 20%, 50%)
- Active/Inactive status

**Earnings Table:**
- Lists all commission earnings
- Shows invoice reference, amounts, commission rate
- Admin can batch select and "Mark as paid out"

---

## Database Tables

| Table | Purpose |
|-------|---------|
| `workspacePricing` | Custom pricing per workspace (null = use defaults) |
| `invoiceLineItem` | Individual billable items linked to projects/videos |
| `invoice` | Invoice records with Fiken integration |
| `affiliateRelationship` | Links affiliate to referred workspace |
| `affiliateEarning` | Commission tracking per paid invoice |

---

## Key Files

| File | Responsibility |
|------|----------------|
| `lib/db/schema.ts` | Database table definitions |
| `lib/db/queries.ts` | Billing queries + `updateProjectCounts` hook |
| `lib/actions/billing.ts` | Invoice creation, Fiken integration, payment actions |
| `lib/actions/affiliate.ts` | Affiliate relationship and earnings management |
| `lib/fiken-client.ts` | Fiken API client + `BILLING_DEFAULTS` constant |
| `app/admin/billing/page.tsx` | Admin billing page |
| `app/admin/affiliates/page.tsx` | Admin affiliates page |

---

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER ACTION                                  │
├─────────────────────────────────────────────────────────────────────┤
│  User creates project/video and generates content                   │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    AUTOMATIC: Line Item Created                      │
├─────────────────────────────────────────────────────────────────────┤
│  • Image: On first completed generation                              │
│  • Video: On generation start                                        │
│  • Status: "pending"                                                 │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    ADMIN: /admin/billing                             │
├─────────────────────────────────────────────────────────────────────┤
│  1. Review uninvoiced items                                          │
│  2. Select items to invoice                                          │
│  3. Click "Send faktura"                                             │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    SYSTEM: Invoice Created & Sent                    │
├─────────────────────────────────────────────────────────────────────┤
│  • Invoice created in database                                       │
│  • Sent to Fiken via API                                             │
│  • Status: "sent"                                                    │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    ADMIN: Mark as Paid                               │
├─────────────────────────────────────────────────────────────────────┤
│  • Click checkmark on sent invoice                                   │
│  • Status: "paid"                                                    │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    AUTOMATIC: Affiliate Check                        │
├─────────────────────────────────────────────────────────────────────┤
│  IF workspace has affiliate relationship:                            │
│    → Create affiliateEarning with calculated commission              │
│    → Status: "pending"                                               │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    ADMIN: /admin/affiliates                          │
├─────────────────────────────────────────────────────────────────────┤
│  1. Review pending earnings                                          │
│  2. Select earnings to pay out                                       │
│  3. Click "Marker som utbetalt"                                      │
│  • Status: "paid_out"                                                │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Notes

- **Org.nr Required**: Workspaces must have an organization number before invoices can be sent to Fiken
- **Idempotency**: The system prevents duplicate invoice line items for the same project/video
- **Error Handling**: Billing operations are wrapped in try/catch to not fail core operations if billing has issues
- **Currency**: All amounts stored in øre (Norwegian cents). 100000 øre = 1000 NOK
