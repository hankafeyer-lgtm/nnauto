"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BusinessAdsShell,
  formatCzk,
  InvoiceStatusBadge,
} from "./BusinessAdsShell";
import { useScopedInvoices } from "@/lib/ads";

export default function AdvertiserInvoicesPage() {
  const invoices = useScopedInvoices();

  return (
    <BusinessAdsShell title="Faktury">
      {invoices.length === 0 ? (
        <Card className="rounded-xl border-dashed bg-white/60">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Žádné faktury. Objeví se po platbě za kampaň.
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Mobile cards */}
          <ul className="space-y-2 sm:hidden">
            {invoices.map((inv) => (
              <li
                key={inv.id}
                className="rounded-xl border bg-white p-3.5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm">{inv.number}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {inv.campaignName}
                    </p>
                  </div>
                  <InvoiceStatusBadge status={inv.status} />
                </div>
                <div className="mt-2.5 flex items-end justify-between gap-2">
                  <p className="text-xs text-neutral-500">{inv.issuedAt}</p>
                  <p className="text-base font-semibold tabular-nums text-[#8a6508]">
                    {formatCzk(inv.amount)}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          {/* Desktop table */}
          <Card className="hidden rounded-xl border bg-white/90 sm:block">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Číslo</TableHead>
                      <TableHead>Datum</TableHead>
                      <TableHead>Kampaň</TableHead>
                      <TableHead>Částka</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((inv) => (
                      <TableRow key={inv.id}>
                        <TableCell className="font-medium whitespace-nowrap">
                          {inv.number}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {inv.issuedAt}
                        </TableCell>
                        <TableCell>{inv.campaignName}</TableCell>
                        <TableCell className="tabular-nums whitespace-nowrap">
                          {formatCzk(inv.amount)}
                        </TableCell>
                        <TableCell>
                          <InvoiceStatusBadge status={inv.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </BusinessAdsShell>
  );
}
