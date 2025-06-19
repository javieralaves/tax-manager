'use client'
import { useState, useEffect } from 'react'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { getQuarter } from 'date-fns'
import type { Invoice } from '@/types/invoice'

export default function InvoiceList({ refreshKey }: { refreshKey: number }) {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  useEffect(() => {
    fetch('/api/invoices')
      .then((res) => res.json())
      .then(setInvoices)
  }, [refreshKey])

  const remove = async (id: string) => {
    await fetch(`/api/invoices/${id}`, { method: 'DELETE' })
    setInvoices((prev) => prev.filter((i) => i.id !== id))
  }

  const markPaid = async (id: string) => {
    const res = await fetch(`/api/invoices/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'PAID' }),
    })
    if (res.ok) {
      const updated = await res.json()
      setInvoices((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status: updated.status } : i))
      )
    }
  }

  if (!invoices.length) return <p>No invoices yet.</p>

  return (
    <Table className="border mt-4">
      <TableHeader>
        <TableRow className="bg-gray-100">
          <TableHead className="p-2 text-left">Client</TableHead>
          <TableHead className="p-2 text-left">Issue Date</TableHead>
          <TableHead className="p-2 text-left">Quarter</TableHead>
          <TableHead className="p-2 text-left">Amount</TableHead>
          <TableHead className="p-2 text-left">Status</TableHead>
          <TableHead className="p-2 text-center">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((inv) => {
          const q = `Q${getQuarter(new Date(inv.issueDate))}`
          const statusColor =
            inv.status === 'PAID'
              ? 'bg-green-500'
              : inv.status === 'PENDING'
              ? 'bg-yellow-500'
              : 'bg-red-500'
          return (
            <TableRow key={inv.id} className="border-t">
              <TableCell className="p-2">{inv.clientName}</TableCell>
              <TableCell className="p-2">{formatDate(inv.issueDate)}</TableCell>
              <TableCell className="p-2">{q}</TableCell>
              <TableCell className="p-2">
                {formatCurrency(
                  Number(
                    inv.currency === 'USD' ? inv.amountUSD : inv.amountEUR
                  ),
                  inv.currency as 'USD' | 'EUR'
                )}
              </TableCell>
              <TableCell className="p-2 flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${statusColor}`}></span>
                {inv.status}
              </TableCell>
              <TableCell className="p-2 text-center">
                <Button
                  variant="link"
                  className="text-red-600 hover:underline"
                  onClick={() => remove(inv.id)}
                >
                  Delete
                </Button>
                {inv.status === 'PENDING' && (
                  <Button
                    variant="link"
                    className="text-green-600 hover:underline ml-2"
                    onClick={() => markPaid(inv.id)}
                  >
                    Mark as Paid
                  </Button>
                )}
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
