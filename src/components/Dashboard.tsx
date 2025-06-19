'use client'
import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { calculateIrpf } from '@/lib/tax'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { eachMonthOfInterval, startOfYear, endOfYear, format } from 'date-fns'
import type { Invoice } from '@/types/invoice'

export default function Dashboard() {
  const [data, setData] = useState<{ name: string; income: number; tax: number }[]>([])
  const [totalIncome, setTotalIncome] = useState(0)
  const [tax, setTax] = useState(0)

  useEffect(() => {
    fetch('/api/invoices')
      .then((res) => res.json())
      .then((invoices: Invoice[]) => {
        const year = new Date().getFullYear()
        const paid = invoices.filter(
          (i) => i.status === 'PAID' && new Date(i.issueDate).getFullYear() === year
        )
        const income = paid.reduce((sum, i) => sum + Number(i.amount), 0)
        setTotalIncome(income)
        const irpf = calculateIrpf(income)
        setTax(irpf)

        const months = eachMonthOfInterval({
          start: startOfYear(new Date()),
          end: endOfYear(new Date()),
        })

        const chart = months.map((m) => {
          const monthIncome = paid
            .filter((inv) => new Date(inv.issueDate).getMonth() === m.getMonth())
            .reduce((sum, inv) => sum + Number(inv.amount), 0)
          return {
            name: format(m, 'MMM'),
            income: monthIncome,
            tax: calculateIrpf(monthIncome),
          }
        })
        setData(chart)
      })
  }, [])

  const net = totalIncome - tax
  const rate = totalIncome ? (tax / totalIncome) * 100 : 0

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Income</CardTitle>
          </CardHeader>
          <CardContent>{formatCurrency(totalIncome)}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Estimated IRPF</CardTitle>
          </CardHeader>
          <CardContent>{formatCurrency(tax)}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Effective Tax Rate</CardTitle>
          </CardHeader>
          <CardContent>{rate.toFixed(2)}%</CardContent>
        </Card>
        <Card className="sm:col-span-3">
          <CardHeader>
            <CardTitle>Net Income After Tax</CardTitle>
          </CardHeader>
          <CardContent>{formatCurrency(net)}</CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Monthly Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Bar dataKey="income" fill="#8884d8" name="Income" />
              <Bar dataKey="tax" fill="#82ca9d" name="Tax" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
