"use client"
import InvoiceForm from '@/components/InvoiceForm'
import InvoiceList from '@/components/InvoiceList'
import Dashboard from '@/components/Dashboard'
import { useState } from 'react'

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0)
  return (
    <main className="max-w-4xl mx-auto p-4 space-y-8">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <Dashboard />
      <h2 className="text-xl font-semibold">Invoices</h2>
      <InvoiceForm onSuccess={() => setRefreshKey((k) => k + 1)} />
      <InvoiceList refreshKey={refreshKey} />
    </main>
  )
}
