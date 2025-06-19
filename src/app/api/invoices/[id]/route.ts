import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const invoice = await prisma.invoice.findUnique({ where: { id: params.id } })
  if (!invoice) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json(invoice)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const data = await request.json()
  const invoice = await prisma.invoice.update({
    where: { id: params.id },
    data: {
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      issueDate: data.issueDate ? new Date(data.issueDate) : undefined,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      amount: data.amount,
      taxRate: data.taxRate,
      status: data.status,
    },
  })
  return NextResponse.json(invoice)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await prisma.invoice.delete({ where: { id: params.id } })
  return NextResponse.json({})
}
