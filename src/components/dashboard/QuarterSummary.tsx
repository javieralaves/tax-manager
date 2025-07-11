"use client"
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'

export default function QuarterSummary({
  currency,
  quarterIncome,
  quarterGeneral,
  ssQuarter,
  quarterAdvance,
  quarterNet,
  nextPaymentMessage,
}: {
  currency: 'USD' | 'EUR'
  quarterIncome: number
  quarterGeneral: number
  ssQuarter: number
  quarterAdvance: number
  quarterNet: number
  nextPaymentMessage?: string
}) {
  return (
    <section className="space-y-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>This Quarter Income</CardTitle>
          </CardHeader>
          <CardContent>{formatCurrency(quarterIncome, currency)}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>General Deduction</CardTitle>
          </CardHeader>
          <CardContent>{formatCurrency(quarterGeneral, currency)}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Social Security (Quarter)</CardTitle>
          </CardHeader>
          <CardContent>{formatCurrency(ssQuarter, currency)}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>IRPF Advance (Modelo 130)</CardTitle>
          </CardHeader>
          <CardContent>{formatCurrency(quarterAdvance, currency)}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Net Take-Home (Quarter)</CardTitle>
          </CardHeader>
          <CardContent>{formatCurrency(quarterNet, currency)}</CardContent>
        </Card>
      </div>
      {nextPaymentMessage && (
        <p className="text-sm font-medium text-center">{nextPaymentMessage}</p>
      )}
    </section>
  )
}
