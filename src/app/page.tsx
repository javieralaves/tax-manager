"use client"
import InvoiceForm from '@/components/InvoiceForm'
import InvoiceList from '@/components/InvoiceList'
import { useState } from 'react'

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0)
  return (
    <main className="max-w-2xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-semibold">Invoices</h1>
      <InvoiceForm onSuccess={() => setRefreshKey((k) => k + 1)} />
      <InvoiceList refreshKey={refreshKey} />
    </main>
  )
}
