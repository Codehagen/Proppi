"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UninvoicedTable } from "./uninvoiced-table"
import { InvoiceHistoryTable } from "./invoice-history-table"

export function BillingTabs() {
  return (
    <Tabs defaultValue="uninvoiced" className="space-y-4">
      <TabsList>
        <TabsTrigger value="uninvoiced">Ikke fakturert</TabsTrigger>
        <TabsTrigger value="history">Fakturahistorikk</TabsTrigger>
      </TabsList>

      <TabsContent value="uninvoiced" className="mt-4">
        <UninvoicedTable />
      </TabsContent>

      <TabsContent value="history" className="mt-4">
        <InvoiceHistoryTable />
      </TabsContent>
    </Tabs>
  )
}
