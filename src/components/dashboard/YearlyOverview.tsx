"use client"
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import SummaryCardGroup from './SummaryCardGroup'

export default function YearlyOverview({
  currency,
  totalIncome,
  taxableIncome,
  stateTax,
  regionalTax,
  tax,
  ssAnnual,
  ssMonthly,
  effectiveRate,
  takeHomeAnnual,
  takeHomeMonthly,
}: {
  currency: 'USD' | 'EUR'
  totalIncome: number
  taxableIncome: number
  stateTax: number
  regionalTax: number
  tax: number
  ssAnnual: number
  ssMonthly: number
  effectiveRate: number
  takeHomeAnnual: number
  takeHomeMonthly: number
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Yearly Summary</h2>
      <SummaryCardGroup>
        <Card>
          <CardHeader>
            <CardTitle>Total Income</CardTitle>
          </CardHeader>
          <CardContent>{formatCurrency(totalIncome, currency)}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Taxable Income</CardTitle>
          </CardHeader>
          <CardContent>{formatCurrency(taxableIncome, currency)}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>IRPF (State)</CardTitle>
          </CardHeader>
          <CardContent>{formatCurrency(stateTax, currency)}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>IRPF (Madrid)</CardTitle>
          </CardHeader>
          <CardContent>{formatCurrency(regionalTax, currency)}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>IRPF (Total)</CardTitle>
          </CardHeader>
          <CardContent>{formatCurrency(tax, currency)}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Social Security (Annual)</CardTitle>
          </CardHeader>
          <CardContent>{formatCurrency(ssAnnual, currency)}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Social Security (Monthly)</CardTitle>
          </CardHeader>
          <CardContent>{formatCurrency(ssMonthly, currency)}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Effective Tax Rate</CardTitle>
          </CardHeader>
          <CardContent>{effectiveRate.toFixed(2)}%</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Take-Home Income (Annual)</CardTitle>
          </CardHeader>
          <CardContent>{formatCurrency(takeHomeAnnual, currency)}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Take-Home Income (Monthly)</CardTitle>
          </CardHeader>
          <CardContent>{formatCurrency(takeHomeMonthly, currency)}</CardContent>
        </Card>
      </SummaryCardGroup>
    </section>
  )
}
