'use client'
import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import { formatCurrency } from '@/lib/utils'
import { calculateIrpf, IRPF_BRACKETS } from '@/lib/tax'
import { EUR_TO_USD, USD_TO_EUR } from '@/lib/utils'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  eachMonthOfInterval,
  startOfYear,
  endOfYear,
  format,
  getQuarter,
} from 'date-fns'
import type { Invoice } from '@/types/invoice'

export default function Dashboard() {
  const [data, setData] = useState<{ name: string; income: number; tax: number }[]>([])
  const [totalIncome, setTotalIncome] = useState(0)
  const [tax, setTax] = useState(0)
  const [quarterly, setQuarterly] = useState<{ quarter: string; income: number; tax: number }[]>([])
  const [nextBracketMsg, setNextBracketMsg] = useState('')

  useEffect(() => {
    fetch('/api/invoices')
      .then((res) => res.json())
      .then((invoices: Invoice[]) => {
        const year = new Date().getFullYear()
        const paid = invoices.filter(
          (i) => i.status === 'PAID' && new Date(i.issueDate).getFullYear() === year
        )
        const incomeUsd = paid.reduce((sum, i) => sum + Number(i.amount), 0)
        setTotalIncome(incomeUsd)
        const incomeEur = incomeUsd * USD_TO_EUR
        const irpfEur = calculateIrpf(incomeEur)
        const irpfUsd = irpfEur * EUR_TO_USD
        setTax(irpfUsd)

        const bracketsUsd = IRPF_BRACKETS.map((b) => ({
          limit: b.limit * EUR_TO_USD,
          rate: b.rate,
        }))
        const next = bracketsUsd.find((b) => incomeUsd < b.limit)
        if (next) {
          const diff = next.limit - incomeUsd
          setNextBracketMsg(
            `${formatCurrency(diff)} left until ${(next.rate * 100).toFixed(0)}% tax bracket.`
          )
        } else {
          setNextBracketMsg('Above highest tax bracket')
        }

        const months = eachMonthOfInterval({
          start: startOfYear(new Date()),
          end: endOfYear(new Date()),
        })

        const chart = months.map((m) => {
          const monthIncomeUsd = paid
            .filter((inv) => new Date(inv.issueDate).getMonth() === m.getMonth())
            .reduce((sum, inv) => sum + Number(inv.amount), 0)
          const monthIncomeEur = monthIncomeUsd * USD_TO_EUR
          return {
            name: format(m, 'MMM'),
            income: monthIncomeUsd,
            tax: calculateIrpf(monthIncomeEur) * EUR_TO_USD,
          }
        })
        setData(chart)

        const quarters = [1, 2, 3, 4].map((q) => {
          const incomeQUsd = paid
            .filter((inv) => getQuarter(new Date(inv.issueDate)) === q)
            .reduce((sum, inv) => sum + Number(inv.amount), 0)
          return {
            quarter: `Q${q}`,
            income: incomeQUsd,
            tax: incomeQUsd * 0.2,
          }
        })
        setQuarterly(quarters)
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
            <CardTitle>Income Until Next Bracket</CardTitle>
          </CardHeader>
          <CardContent>{nextBracketMsg}</CardContent>
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
      <Card>
        <CardHeader>
          <CardTitle>Quarterly Summary (20% IRPF)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quarter</TableHead>
                <TableHead>Income</TableHead>
                <TableHead>Advance Tax</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quarterly.map((q) => (
                <TableRow key={q.quarter}>
                  <TableCell>{q.quarter}</TableCell>
                  <TableCell>{formatCurrency(q.income)}</TableCell>
                  <TableCell>{formatCurrency(q.tax)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
