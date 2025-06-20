import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getExchangeRate } from '@/lib/utils'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const invoice = await prisma.invoice.findUnique({ where: { id } })
  if (!invoice) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json(invoice)
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const data = await request.json()
  let amountUSD: number | undefined
  let amountEUR: number | undefined
  let rate: number | undefined
  if (data.amount && data.currency) {
    rate = await getExchangeRate(
      data.issueDate ? new Date(data.issueDate) : new Date()
    )
    const amt = parseFloat(data.amount)
    amountUSD =
      data.currency === 'USD' ? amt : parseFloat((amt * rate).toFixed(2))
    amountEUR =
      data.currency === 'EUR' ? amt : parseFloat((amt / rate).toFixed(2))
  }
  const invoice = await prisma.invoice.update({
    where: { id },
    data: {
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      issueDate: data.issueDate ? new Date(data.issueDate) : undefined,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      currency: data.currency,
      amountUSD,
      amountEUR,
      exchangeRate: rate,
      status: data.status,
    },
  })
  return NextResponse.json(invoice)
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { status } = await request.json()
  const invoice = await prisma.invoice.update({
    where: { id },
    data: { status },
  })
  return NextResponse.json(invoice)
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await prisma.invoice.delete({ where: { id } })
  return NextResponse.json({})
}
