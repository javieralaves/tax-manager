import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const invoices = await prisma.invoice.findMany({ orderBy: { issueDate: 'desc' } })
  return NextResponse.json(invoices)
}

export async function POST(request: Request) {
  const data = await request.json()

  // Basic validation
  if (!data.clientName || !data.issueDate || !data.dueDate || !data.amount) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    )
  }

  const invoice = await prisma.invoice.create({
    data: {
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      issueDate: new Date(data.issueDate),
      dueDate: new Date(data.dueDate),
      amount: data.amount,
      taxRate: data.taxRate ?? 0,
      status: data.status ?? 'PENDING',
    },
  })

  return NextResponse.json(invoice, { status: 201 })
}
