/**
 * Fiken API Client for invoice management
 * Documentation: https://api.fiken.no/api/v2/docs/
 */

// =============================================================================
// Types
// =============================================================================

export interface FikenContact {
  contactId: number;
  name: string;
  organizationNumber?: string;
  customerNumber?: number;
  customerAccountCode?: string;
  customer: boolean;
  supplier: boolean;
  currency: string;
  language: string;
  inactive: boolean;
  address?: {
    streetAddress?: string;
    city?: string;
    postCode?: string;
    country?: string;
  };
}

export interface FikenInvoiceLine {
  quantity: number;
  unitPrice: number; // in øre (100000 = 1000 NOK)
  vatType: "HIGH" | "LOW" | "MEDIUM" | "EXEMPT" | "OUTSIDE";
  description: string;
  incomeAccount: string;
}

export interface CreateInvoiceRequest {
  issueDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  customerId: number;
  bankAccountCode: string;
  cash: boolean;
  lines: FikenInvoiceLine[];
}

export interface CreateContactRequest {
  name: string;
  organizationNumber: string;
  customer?: boolean;
  language?: string;
  currency?: string;
}

// =============================================================================
// Configuration
// =============================================================================

export const FIKEN_CONFIG = {
  bankAccountCode: "1920:10001",
  incomeAccount: "3000",
  vatType: "HIGH" as const,
  projectPrice: 100000, // 1000 NOK in øre
  defaultDueDays: 14,
} as const;

// =============================================================================
// Client
// =============================================================================

export class FikenClient {
  private baseUrl = "https://api.fiken.no/api/v2";
  private companySlug: string;
  private apiKey: string;

  constructor() {
    const apiKey = process.env.FIKEN_API_KEY;
    const companySlug = process.env.FIKEN_COMPANY_SLUG;

    if (!apiKey) {
      throw new Error("FIKEN_API_KEY environment variable is not set");
    }
    if (!companySlug) {
      throw new Error("FIKEN_COMPANY_SLUG environment variable is not set");
    }

    this.apiKey = apiKey;
    this.companySlug = companySlug;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<{ data: T | null; locationHeader?: string; status: number }> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Fiken API error: ${response.status} - ${errorText || response.statusText}`
      );
    }

    // Handle 201 Created with Location header (no body)
    if (response.status === 201) {
      return {
        data: null,
        locationHeader: response.headers.get("location") || undefined,
        status: response.status,
      };
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return { data: null, status: response.status };
    }

    const data = await response.json();
    return { data, status: response.status };
  }

  // ---------------------------------------------------------------------------
  // Contacts
  // ---------------------------------------------------------------------------

  /**
   * Search for a contact by organization number
   * Returns the contact if found, null if not found
   */
  async findContactByOrgNumber(
    organizationNumber: string
  ): Promise<FikenContact | null> {
    const { data } = await this.request<FikenContact[]>(
      `/companies/${this.companySlug}/contacts?organizationNumber=${organizationNumber}`
    );

    if (!data || data.length === 0) {
      return null;
    }

    return data[0];
  }

  /**
   * Create a new contact (customer)
   * Returns the contactId after creation
   */
  async createContact(contact: CreateContactRequest): Promise<number> {
    // Create the contact
    await this.request(`/companies/${this.companySlug}/contacts`, {
      method: "POST",
      body: JSON.stringify({
        name: contact.name,
        organizationNumber: contact.organizationNumber,
        customer: contact.customer ?? true,
        language: contact.language ?? "Norwegian",
        currency: contact.currency ?? "NOK",
      }),
    });

    // Fiken returns 201 with no body, need to search to get the contactId
    const createdContact = await this.findContactByOrgNumber(
      contact.organizationNumber
    );

    if (!createdContact) {
      throw new Error(
        `Failed to find contact after creation: ${contact.organizationNumber}`
      );
    }

    return createdContact.contactId;
  }

  /**
   * Get or create a contact by organization number
   * Returns the contactId
   */
  async getOrCreateContact(
    name: string,
    organizationNumber: string
  ): Promise<number> {
    // First, try to find existing contact
    const existingContact = await this.findContactByOrgNumber(organizationNumber);

    if (existingContact) {
      return existingContact.contactId;
    }

    // Contact doesn't exist, create it
    return this.createContact({ name, organizationNumber });
  }

  // ---------------------------------------------------------------------------
  // Invoices
  // ---------------------------------------------------------------------------

  /**
   * Create an invoice
   * Returns the invoiceId from the Location header
   */
  async createInvoice(invoice: CreateInvoiceRequest): Promise<number> {
    const { locationHeader } = await this.request(
      `/companies/${this.companySlug}/invoices`,
      {
        method: "POST",
        body: JSON.stringify(invoice),
      }
    );

    if (!locationHeader) {
      throw new Error("No Location header in invoice creation response");
    }

    // Extract invoiceId from Location header
    // Example: https://api.fiken.no/api/v2/companies/.../invoices/11305922354
    const invoiceId = parseInt(locationHeader.split("/").pop() || "", 10);

    if (isNaN(invoiceId)) {
      throw new Error(`Failed to parse invoiceId from Location: ${locationHeader}`);
    }

    return invoiceId;
  }

  /**
   * Create a single-project invoice
   * Convenience method for invoicing one project
   */
  async createSingleProjectInvoice(params: {
    customerId: number;
    projectName: string;
    issueDate?: string; // defaults to today
    dueDate?: string; // defaults to issueDate + 14 days
  }): Promise<number> {
    const today = new Date();
    const issueDate = params.issueDate || today.toISOString().split("T")[0];
    const dueDate =
      params.dueDate ||
      new Date(today.getTime() + FIKEN_CONFIG.defaultDueDays * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

    return this.createInvoice({
      issueDate,
      dueDate,
      customerId: params.customerId,
      bankAccountCode: FIKEN_CONFIG.bankAccountCode,
      cash: false,
      lines: [
        {
          quantity: 1,
          unitPrice: FIKEN_CONFIG.projectPrice,
          vatType: FIKEN_CONFIG.vatType,
          description: `AI Photo Editing - ${params.projectName}`,
          incomeAccount: FIKEN_CONFIG.incomeAccount,
        },
      ],
    });
  }

  /**
   * Create a batch invoice for multiple projects
   * Each project becomes a line item on the invoice
   */
  async createBatchInvoice(params: {
    customerId: number;
    projects: Array<{ name: string; description?: string }>;
    issueDate?: string; // defaults to today
    dueDate?: string; // defaults to issueDate + 14 days
  }): Promise<number> {
    const today = new Date();
    const issueDate = params.issueDate || today.toISOString().split("T")[0];
    const dueDate =
      params.dueDate ||
      new Date(today.getTime() + FIKEN_CONFIG.defaultDueDays * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

    const lines: FikenInvoiceLine[] = params.projects.map((project) => ({
      quantity: 1,
      unitPrice: FIKEN_CONFIG.projectPrice,
      vatType: FIKEN_CONFIG.vatType,
      description: project.description || `AI Photo Editing - ${project.name}`,
      incomeAccount: FIKEN_CONFIG.incomeAccount,
    }));

    return this.createInvoice({
      issueDate,
      dueDate,
      customerId: params.customerId,
      bankAccountCode: FIKEN_CONFIG.bankAccountCode,
      cash: false,
      lines,
    });
  }

  // ---------------------------------------------------------------------------
  // Full Invoice Flow
  // ---------------------------------------------------------------------------

  /**
   * Complete invoice flow: get/create contact, then create invoice
   * This is the main method to use for invoicing a workspace
   */
  async invoiceWorkspace(params: {
    workspaceName: string;
    organizationNumber: string;
    projects: Array<{ name: string; description?: string }>;
    issueDate?: string;
    dueDate?: string;
  }): Promise<{ contactId: number; invoiceId: number }> {
    // Step 1: Get or create contact
    const contactId = await this.getOrCreateContact(
      params.workspaceName,
      params.organizationNumber
    );

    // Step 2: Create invoice
    const invoiceId =
      params.projects.length === 1
        ? await this.createSingleProjectInvoice({
            customerId: contactId,
            projectName: params.projects[0].name,
            issueDate: params.issueDate,
            dueDate: params.dueDate,
          })
        : await this.createBatchInvoice({
            customerId: contactId,
            projects: params.projects,
            issueDate: params.issueDate,
            dueDate: params.dueDate,
          });

    return { contactId, invoiceId };
  }
}

// =============================================================================
// Singleton Export
// =============================================================================

let fikenClientInstance: FikenClient | null = null;

export function getFikenClient(): FikenClient {
  if (!fikenClientInstance) {
    fikenClientInstance = new FikenClient();
  }
  return fikenClientInstance;
}
