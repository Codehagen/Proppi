"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  InvoiceHistoryRow,
  UninvoicedLineItemRow,
} from "@/lib/db/queries";
import { InvoiceHistoryTable } from "./invoice-history-table";
import { UninvoicedTable } from "./uninvoiced-table";

interface BillingTabsProps {
  uninvoicedItems: UninvoicedLineItemRow[];
  invoices: InvoiceHistoryRow[];
}

export function BillingTabs({ uninvoicedItems, invoices }: BillingTabsProps) {
  return (
    <Tabs className="space-y-4" defaultValue="uninvoiced">
      <TabsList>
        <TabsTrigger value="uninvoiced">Ikke fakturert</TabsTrigger>
        <TabsTrigger value="history">Fakturahistorikk</TabsTrigger>
      </TabsList>

      <TabsContent className="mt-4" value="uninvoiced">
        <UninvoicedTable items={uninvoicedItems} />
      </TabsContent>

      <TabsContent className="mt-4" value="history">
        <InvoiceHistoryTable invoices={invoices} />
      </TabsContent>
    </Tabs>
  );
}
