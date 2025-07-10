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
import {
  calculateStateIrpf,
  calculateRegionalIrpfMadrid,
  getRegionalIrpfCalculator,
  calculateIrpfBreakdown,
  IRPF_BRACKETS,
  type IrpfBreakdownEntry,
} from '@/lib/tax'
import { calculateSocialSecurityQuota } from '@/lib/socialSecurity'
import { calculateGeneralExpenses } from '@/lib/deductions'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
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
  const [stateTax, setStateTax] = useState(0)
  const [regionalTax, setRegionalTax] = useState(0)
  const [tax, setTax] = useState(0)
  const [quarterly, setQuarterly] = useState<{ quarter: string; income: number; tax: number }[]>([])
  const [nextBracketMsg, setNextBracketMsg] = useState('')
  const [currency, setCurrency] = useState<'USD' | 'EUR'>('USD')
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [breakdown, setBreakdown] = useState<IrpfBreakdownEntry[]>([])
  const [advancePaid, setAdvancePaid] = useState(0)
  const [finalBalance, setFinalBalance] = useState(0)
  const [ssMonthly, setSsMonthly] = useState(0)
  const [ssAnnual, setSsAnnual] = useState(0)
  const [ssNextMsg, setSsNextMsg] = useState('')
  const [generalExpenses, setGeneralExpenses] = useState(0)
  const [ssBase, setSsBase] = useState(0)
  const [taxableIncome, setTaxableIncome] = useState(0)

  useEffect(() => {
    fetch('/api/invoices')
      .then((res) => res.json())
      .then(setInvoices)
  }, [])

  useEffect(() => {
    const year = new Date().getFullYear()
    const paid = invoices.filter(
      (i) => i.status === 'PAID' && new Date(i.issueDate).getFullYear() === year
    )

    const totalUsd = paid.reduce((sum, i) => sum + Number(i.amountUSD), 0)
    const totalEur = paid.reduce((sum, i) => sum + Number(i.amountEUR), 0)
    const avgRate = totalEur ? totalUsd / totalEur : 1

    const total = currency === 'USD' ? totalUsd : totalEur
    setTotalIncome(total)

    const generalEur = calculateGeneralExpenses(totalEur)
    const generalCur = currency === 'USD' ? generalEur * avgRate : generalEur
    setGeneralExpenses(generalCur)

    const ssBaseEur = totalEur - generalEur
    const ssBaseCur = currency === 'USD' ? ssBaseEur * avgRate : ssBaseEur
    setSsBase(ssBaseCur)

    const ss = calculateSocialSecurityQuota(ssBaseEur)
    const ssMonthlyCur = currency === 'USD' ? ss.monthly * avgRate : ss.monthly
    const ssAnnualCur = currency === 'USD' ? ss.annual * avgRate : ss.annual
    setSsMonthly(ssMonthlyCur)
    setSsAnnual(ssAnnualCur)
    if (ss.toNextBand !== null) {
      const diff = currency === 'USD' ? ss.toNextBand * avgRate : ss.toNextBand
      setSsNextMsg(`${formatCurrency(diff, currency)} left until next SS band.`)
    } else {
      setSsNextMsg('Above highest SS quota band')
    }

    const taxableEur = ssBaseEur - ss.annual
    const taxableCur = currency === 'USD' ? taxableEur * avgRate : taxableEur
    setTaxableIncome(taxableCur)

    const state = calculateStateIrpf(taxableEur)
    const regional = getRegionalIrpfCalculator('madrid')(taxableEur)
    const taxEur = state.total + regional.total
    setStateTax(currency === 'USD' ? state.total * avgRate : state.total)
    setRegionalTax(
      currency === 'USD' ? regional.total * avgRate : regional.total,
    )
    const taxVal = currency === 'USD' ? taxEur * avgRate : taxEur
    setTax(taxVal)

    const bd = calculateIrpfBreakdown(taxableEur).map((b) => ({
      ...b,
      from: currency === 'USD' ? b.from * avgRate : b.from,
      to: currency === 'USD' ? b.to * avgRate : b.to,
      taxable: currency === 'USD' ? b.taxable * avgRate : b.taxable,
      tax: currency === 'USD' ? b.tax * avgRate : b.tax,
    }))
    setBreakdown(bd)

    const advance = taxableEur * 0.2
    setAdvancePaid(currency === 'USD' ? advance * avgRate : advance)
    const balance = taxEur - advance
    setFinalBalance(currency === 'USD' ? balance * avgRate : balance)

    const brackets = IRPF_BRACKETS.map((b) => ({
      limit: currency === 'USD' ? b.limit * avgRate : b.limit,
      rate: b.rate,
    }))
    const next = brackets.find((b) => taxableCur < b.limit)
    if (next) {
      const diff = next.limit - taxableCur
      setNextBracketMsg(
        `${formatCurrency(diff, currency)} left until ${(next.rate * 100).toFixed(0)}% tax bracket.`
      )
    } else {
      setNextBracketMsg('Above highest tax bracket')
    }

    const months = eachMonthOfInterval({
      start: startOfYear(new Date()),
      end: endOfYear(new Date()),
    })

    const chart = months.map((m) => {
      const monthUsd = paid
        .filter((inv) => new Date(inv.issueDate).getMonth() === m.getMonth())
        .reduce((sum, inv) => sum + Number(inv.amountUSD), 0)
      const monthEur = paid
        .filter((inv) => new Date(inv.issueDate).getMonth() === m.getMonth())
        .reduce((sum, inv) => sum + Number(inv.amountEUR), 0)
      const monthIncome = currency === 'USD' ? monthUsd : monthEur
      const monthState = calculateStateIrpf(monthEur).total
      const monthRegional = calculateRegionalIrpfMadrid(monthEur).total
      const monthTotal = monthState + monthRegional
      const taxMonth =
        currency === 'USD'
          ? monthTotal * (monthEur ? monthUsd / monthEur : avgRate)
          : monthTotal
      return {
        name: format(m, 'MMM'),
        income: monthIncome,
        tax: taxMonth,
      }
    })
    setData(chart)

    const quarters = [1, 2, 3, 4].map((q) => {
      const incomeUsd = paid
        .filter((inv) => getQuarter(new Date(inv.issueDate)) === q)
        .reduce((sum, inv) => sum + Number(inv.amountUSD), 0)
      const incomeEur = paid
        .filter((inv) => getQuarter(new Date(inv.issueDate)) === q)
        .reduce((sum, inv) => sum + Number(inv.amountEUR), 0)
      const income = currency === 'USD' ? incomeUsd : incomeEur
      return {
        quarter: `Q${q}`,
        income,
        tax: income * 0.2,
      }
    })
    setQuarterly(quarters)
  }, [invoices, currency])

  const net = totalIncome - generalExpenses - ssAnnual - tax
  const rate = totalIncome ? (tax / totalIncome) * 100 : 0

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Select value={currency} onValueChange={(v) => setCurrency(v as 'USD' | 'EUR')}>
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="USD">USD</SelectItem>
            <SelectItem value="EUR">EUR</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Income</CardTitle>
          </CardHeader>
          <CardContent>{formatCurrency(totalIncome, currency)}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>General Expenses (5%)</CardTitle>
          </CardHeader>
          <CardContent>{formatCurrency(generalExpenses, currency)}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>SS Base Income</CardTitle>
          </CardHeader>
          <CardContent>{formatCurrency(ssBase, currency)}</CardContent>
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
            <CardTitle>Effective Tax Rate</CardTitle>
          </CardHeader>
          <CardContent>{rate.toFixed(2)}%</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>SS Monthly Quota</CardTitle>
          </CardHeader>
          <CardContent>{formatCurrency(ssMonthly, currency)}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Annual SS Total</CardTitle>
          </CardHeader>
          <CardContent>{formatCurrency(ssAnnual, currency)}</CardContent>
        </Card>
        <Card className="sm:col-span-3">
          <CardHeader>
            <CardTitle>Income Until Next Bracket</CardTitle>
          </CardHeader>
          <CardContent>{nextBracketMsg}</CardContent>
        </Card>
        <Card className="sm:col-span-3">
          <CardHeader>
            <CardTitle>SS Band Info</CardTitle>
          </CardHeader>
          <CardContent>{ssNextMsg}</CardContent>
        </Card>
        <Card className="sm:col-span-3">
          <CardHeader>
            <CardTitle>Net Income After Tax</CardTitle>
          </CardHeader>
          <CardContent>{formatCurrency(net, currency)}</CardContent>
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
              <Tooltip
                formatter={(value: number) => formatCurrency(value, currency)}
              />
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
                  <TableCell>{formatCurrency(q.income, currency)}</TableCell>
                  <TableCell>{formatCurrency(q.tax, currency)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Year-End Tax Bracket Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bracket</TableHead>
                <TableHead>Taxable</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Tax</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {breakdown.map((b, i) => (
                <TableRow key={i}>
                  <TableCell>
                    {`${formatCurrency(b.from, currency)} - ${formatCurrency(b.to, currency)}`}
                  </TableCell>
                  <TableCell>{formatCurrency(b.taxable, currency)}</TableCell>
                  <TableCell>{(b.rate * 100).toFixed(0)}%</TableCell>
                  <TableCell>{formatCurrency(b.tax, currency)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4 space-y-1 text-sm">
            <p>Final IRPF Liability: {formatCurrency(tax, currency)}</p>
            <p>Quarterly Advances Paid: {formatCurrency(advancePaid, currency)}</p>
            <p className="font-semibold">
              {finalBalance >= 0
                ? `Balance Due: ${formatCurrency(finalBalance, currency)}`
                : `Refund: ${formatCurrency(Math.abs(finalBalance), currency)}`}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
