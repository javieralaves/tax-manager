'use client'
import { useState, useEffect } from 'react'

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
    <table className="w-full border mt-4">
      <thead>
        <tr className="bg-gray-100">
          <th className="p-2 text-left">Client</th>
          <th className="p-2 text-left">Amount</th>
          <th className="p-2 text-left">Status</th>
          <th className="p-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {invoices.map((inv) => (
          <tr key={inv.id} className="border-t">
            <td className="p-2">{inv.clientName}</td>
            <td className="p-2">{inv.amount}</td>
            <td className="p-2">{inv.status}</td>
            <td className="p-2 text-center">
              <button
                onClick={() => remove(inv.id)}
                className="text-red-600 hover:underline"
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
