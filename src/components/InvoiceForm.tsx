'use client'
import { useState } from 'react'

export default function InvoiceForm({ onSuccess }: { onSuccess: () => void }) {
  const [form, setForm] = useState({
    clientName: '',
    clientEmail: '',
    issueDate: '',
    dueDate: '',
    amount: '',
    taxRate: '0',
  })
  const [loading, setLoading] = useState(false)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        amount: parseFloat(form.amount),
        taxRate: parseFloat(form.taxRate),
      }),
    })
    setLoading(false)
    setForm({ clientName: '', clientEmail: '', issueDate: '', dueDate: '', amount: '', taxRate: '0' })
    onSuccess()
  }
  return (
    <form onSubmit={submit} className="space-y-2 border p-4 rounded">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          name="clientName"
          value={form.clientName}
          onChange={handleChange}
          placeholder="Client Name"
          required
          className="border p-2 rounded flex-1"
        />
        <input
          name="clientEmail"
          value={form.clientEmail}
          onChange={handleChange}
          placeholder="Client Email"
          className="border p-2 rounded flex-1"
        />
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="date"
          name="issueDate"
          value={form.issueDate}
          onChange={handleChange}
          required
          className="border p-2 rounded flex-1"
        />
        <input
          type="date"
          name="dueDate"
          value={form.dueDate}
          onChange={handleChange}
          required
          className="border p-2 rounded flex-1"
        />
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="number"
          step="0.01"
          name="amount"
          value={form.amount}
          onChange={handleChange}
          placeholder="Amount"
          required
          className="border p-2 rounded flex-1"
        />
        <input
          type="number"
          step="0.01"
          name="taxRate"
          value={form.taxRate}
          onChange={handleChange}
          placeholder="Tax Rate"
          className="border p-2 rounded flex-1"
        />
      </div>
      <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">
        {loading ? 'Saving...' : 'Create Invoice'}
      </button>
    </form>
  )
}
