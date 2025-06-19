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

export type Invoice = {
  id: string
  clientName: string
  clientEmail: string | null
  issueDate: string
  dueDate: string
  amount: string
  taxRate: number
  status: string
}

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

  if (!invoices.length) return <p>No invoices yet.</p>

  return (
    <Table className="border mt-4">
      <TableHeader>
        <TableRow className="bg-gray-100">
          <TableHead className="p-2 text-left">Client</TableHead>
          <TableHead className="p-2 text-left">Amount</TableHead>
          <TableHead className="p-2 text-left">Status</TableHead>
          <TableHead className="p-2 text-center">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((inv) => (
          <TableRow key={inv.id} className="border-t">
            <TableCell className="p-2">{inv.clientName}</TableCell>
            <TableCell className="p-2">{inv.amount}</TableCell>
            <TableCell className="p-2">{inv.status}</TableCell>
            <TableCell className="p-2 text-center">
              <Button
                variant="link"
                className="text-red-600 hover:underline"
                onClick={() => remove(inv.id)}
              >
                Delete
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
