'use client'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'

export default function InvoiceForm({ onSuccess }: { onSuccess: () => void }) {
  const [form, setForm] = useState({
    clientName: '',
    clientEmail: '',
    issueDate: '',
    dueDate: '',
    amount: '',
    currency: 'USD',
    status: 'PAID',
  })
  const [loading, setLoading] = useState(false)
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
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
      }),
    })
    setLoading(false)
    setForm({
      clientName: '',
      clientEmail: '',
      issueDate: '',
      dueDate: '',
      amount: '',
      currency: 'USD',
      status: 'PAID',
    })
    onSuccess()
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex flex-1 flex-col gap-1">
          <Label htmlFor="clientName">Client Name</Label>
          <Input
            id="clientName"
            name="clientName"
            value={form.clientName}
            onChange={handleChange}
            placeholder="Client Name"
            required
          />
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <Label htmlFor="clientEmail">Client Email</Label>
          <Input
            id="clientEmail"
            name="clientEmail"
            value={form.clientEmail}
            onChange={handleChange}
            placeholder="Client Email"
          />
        </div>
      </div>
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex flex-1 flex-col gap-1">
          <Label htmlFor="issueDate">Issue Date</Label>
          <Input
            id="issueDate"
            type="date"
            name="issueDate"
            value={form.issueDate}
            onChange={handleChange}
            required
          />
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <Label htmlFor="dueDate">Due Date</Label>
          <Input
            id="dueDate"
            type="date"
            name="dueDate"
            value={form.dueDate}
            onChange={handleChange}
            required
          />
        </div>
      </div>
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex flex-1 flex-col gap-1">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            placeholder="Amount"
            required
          />
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <Label htmlFor="currency">Currency</Label>
          <Select value={form.currency} onValueChange={(v) => setForm({ ...form, currency: v })}>
            <SelectTrigger id="currency" name="currency">
              <SelectValue placeholder="Currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="EUR">EUR</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Switch
          id="status"
          checked={form.status === 'PAID'}
          onCheckedChange={(checked) =>
            setForm({ ...form, status: checked ? 'PAID' : 'PENDING' })
          }
          aria-label="Mark as paid"
        />
        <Label htmlFor="status">Mark as paid</Label>
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? 'Saving...' : 'Create Invoice'}
      </Button>
    </form>
  )
}
