"use client"
import InvoiceForm from '@/components/InvoiceForm'
import InvoiceList from '@/components/InvoiceList'
import Dashboard from '@/components/Dashboard'
import { useState } from 'react'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [open, setOpen] = useState(false)
  return (
    <main className="max-w-4xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <Dashboard />
        </TabsContent>
        <TabsContent value="invoices" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>Add Invoice</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New Invoice</DialogTitle>
                </DialogHeader>
                <InvoiceForm
                  onSuccess={() => {
                    setRefreshKey((k) => k + 1)
                    setOpen(false)
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
          <InvoiceList refreshKey={refreshKey} />
        </TabsContent>
      </Tabs>
    </main>
  )
}
