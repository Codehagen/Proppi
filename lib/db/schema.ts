import {
  pgTable,
  text,
  timestamp,
  boolean,
  index,
  jsonb,
} from "drizzle-orm/pg-core";

// ============================================================================
// Workspace (must be defined before user due to foreign key reference)
// ============================================================================

export const workspace = pgTable("workspace", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),

  // White-label branding
  logo: text("logo"),
  primaryColor: text("primary_color"),
  secondaryColor: text("secondary_color"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ============================================================================
// Better-Auth Tables
// ============================================================================

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),

  // Workspace relation
  workspaceId: text("workspace_id").references(() => workspace.id, {
    onDelete: "cascade",
  }),
  role: text("role").notNull().default("member"), // "owner" | "admin" | "member"
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)]
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [index("account_userId_idx").on(table.userId)]
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)]
);

// ============================================================================
// Image Generation
// ============================================================================

export const imageGeneration = pgTable(
  "image_generation",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    // Image data
    originalImageUrl: text("original_image_url").notNull(),
    resultImageUrl: text("result_image_url"),
    prompt: text("prompt").notNull(),

    // Status tracking
    status: text("status").notNull().default("pending"), // pending | processing | completed | failed
    errorMessage: text("error_message"),

    // Metadata (model used, tokens, cost, etc.)
    metadata: jsonb("metadata"),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("image_generation_workspace_idx").on(table.workspaceId),
    index("image_generation_user_idx").on(table.userId),
  ]
);

// ============================================================================
// Type Exports
// ============================================================================

export type Workspace = typeof workspace.$inferSelect;
export type NewWorkspace = typeof workspace.$inferInsert;

export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;

export type ImageGeneration = typeof imageGeneration.$inferSelect;
export type NewImageGeneration = typeof imageGeneration.$inferInsert;

export type UserRole = "owner" | "admin" | "member";
export type ImageStatus = "pending" | "processing" | "completed" | "failed";

// ============================================================================
// BILLING SCHEMA (TODO: Uncomment when ready to implement)
// ============================================================================

/*
// Add these fields to workspace table:
// organizationNumber: text("organization_number"), // Norwegian org number (9 digits)
// fikenContactId: integer("fiken_contact_id"),     // Fiken contact ID for invoicing

export const project = pgTable(
  "project",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    // Project details
    name: text("name").notNull(),
    styleTemplateId: text("style_template_id"),

    // Image tracking (max 10 per project)
    imageCount: integer("image_count").notNull().default(0),
    completedImageCount: integer("completed_image_count").notNull().default(0),

    // Billing status: draft | completed | invoiced
    status: text("status").notNull().default("draft"),

    // Invoice reference (when invoiced)
    invoiceId: text("invoice_id").references(() => invoice.id),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    completedAt: timestamp("completed_at"),
  },
  (table) => [
    index("project_workspace_idx").on(table.workspaceId),
    index("project_user_idx").on(table.userId),
    index("project_status_idx").on(table.status),
  ]
);

export const invoice = pgTable(
  "invoice",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),

    // Fiken reference
    fikenInvoiceId: integer("fiken_invoice_id"),
    fikenInvoiceNumber: text("fiken_invoice_number"),

    // Invoice details
    amount: integer("amount").notNull(), // Amount in øre (Norwegian cents)
    currency: text("currency").notNull().default("NOK"),

    // Status: pending | sent | paid | cancelled
    status: text("status").notNull().default("pending"),

    // Dates
    issueDate: timestamp("issue_date").notNull(),
    dueDate: timestamp("due_date").notNull(),

    // Metadata
    description: text("description"),
    projectIds: jsonb("project_ids").$type<string[]>(), // Array of project IDs included

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("invoice_workspace_idx").on(table.workspaceId),
    index("invoice_status_idx").on(table.status),
    index("invoice_fiken_idx").on(table.fikenInvoiceId),
  ]
);

// Type exports for billing
export type Project = typeof project.$inferSelect;
export type NewProject = typeof project.$inferInsert;
export type ProjectStatus = "draft" | "completed" | "invoiced";

export type Invoice = typeof invoice.$inferSelect;
export type NewInvoice = typeof invoice.$inferInsert;
export type InvoiceStatus = "pending" | "sent" | "paid" | "cancelled";
*/
