import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getExchangeRate } from '@/lib/utils'

export async function GET() {
  const invoices = await prisma.invoice.findMany({ orderBy: { issueDate: 'desc' } })

  // Backfill missing currency fields for older entries
  await Promise.all(
    invoices.map(async (inv) => {
      if (!inv.amountUSD || !inv.amountEUR || !inv.exchangeRate) {
        const rate = await getExchangeRate(inv.issueDate)
        const amountUSD = inv.amountUSD ?? parseFloat((Number(inv.amountEUR) * rate).toFixed(2))
        const amountEUR = inv.amountEUR ?? parseFloat((Number(inv.amountUSD) / rate).toFixed(2))
        await prisma.invoice.update({
          where: { id: inv.id },
          data: { amountUSD, amountEUR, exchangeRate: rate, currency: inv.currency ?? 'USD' },
        })
      }
    })
  )

  const fresh = await prisma.invoice.findMany({ orderBy: { issueDate: 'desc' } })
  return NextResponse.json(fresh)
}

export async function POST(request: Request) {
  const data = await request.json()

  // Basic validation
  if (
    !data.clientName ||
    !data.issueDate ||
    !data.dueDate ||
    !data.amount ||
    !data.currency
  ) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    )
  }

  const rate = await getExchangeRate(
    data.issueDate ? new Date(data.issueDate) : new Date()
  )
  const amount = parseFloat(data.amount)
  const amountUSD =
    data.currency === 'USD' ? amount : parseFloat((amount * rate).toFixed(2))
  const amountEUR =
    data.currency === 'EUR' ? amount : parseFloat((amount / rate).toFixed(2))

  const invoice = await prisma.invoice.create({
    data: {
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      issueDate: new Date(data.issueDate),
      dueDate: new Date(data.dueDate),
      currency: data.currency,
      amountUSD,
      amountEUR,
      exchangeRate: rate,
      taxRate: data.taxRate ?? 0,
      status: data.status ?? 'PENDING',
    },
  })

  return NextResponse.json(invoice, { status: 201 })
}
