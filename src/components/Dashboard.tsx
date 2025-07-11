'use client'
import { useState, useEffect } from 'react'

import { formatCurrency } from '@/lib/utils'
import { calculateTakeHome } from '@/lib/taxSummary'
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
  aggregateQuarterlyData,
  calculateModelo130,
  type Modelo130Quarter,
} from '@/lib/modelo130'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import QuarterSummary from './dashboard/QuarterSummary'
import YearlyOverview from './dashboard/YearlyOverview'
import AdvancedInsights from './dashboard/AdvancedInsights'
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
  const [filings, setFilings] = useState<Modelo130Quarter[]>([])
  const [nextBracketMsg, setNextBracketMsg] = useState('')
  const [currency, setCurrency] = useState<'USD' | 'EUR'>('USD')
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [breakdown, setBreakdown] = useState<IrpfBreakdownEntry[]>([])
  const [advancePaid, setAdvancePaid] = useState(0)
  const [finalBalance, setFinalBalance] = useState(0)
  const [ssMonthly, setSsMonthly] = useState(0)
  const [ssAnnual, setSsAnnual] = useState(0)
  const [ssNextMsg, setSsNextMsg] = useState('')
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
    const ssBaseEur = totalEur - generalEur

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

    const quarterData = aggregateQuarterlyData(paid, currency)
    const filingData = calculateModelo130(quarterData)
    setFilings(filingData)
    const advanceTotal = filingData.reduce((sum, f) => sum + f.amountDue, 0)
    setAdvancePaid(advanceTotal)
    const balance = taxVal - advanceTotal
    setFinalBalance(balance)
  }, [invoices, currency])

  const summary = calculateTakeHome(totalIncome, tax, ssAnnual)
  const net = summary.takeHomeAnnual
  const rate = summary.effectiveRate * 100
  const takeHomeMonthly = summary.takeHomeMonthly

  const currentQ = getQuarter(new Date())
  const current = filings.find((f) => f.quarter === currentQ)
  const ssQuarter = ssMonthly * 3
  const quarterIncome = current?.income ?? 0
  const quarterAdvance = current?.amountDue ?? 0
  const quarterGeneral = current ? current.deductions - ssQuarter : 0
  const quarterNet =
    quarterIncome - quarterGeneral - ssQuarter - quarterAdvance

  return (
    <div className="space-y-6">
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
      <QuarterSummary
        currency={currency}
        quarterIncome={quarterIncome}
        quarterGeneral={quarterGeneral}
        ssQuarter={ssQuarter}
        quarterAdvance={quarterAdvance}
        quarterNet={quarterNet}
        nextPaymentMessage={`Your estimated Modelo 130 payment is ${formatCurrency(quarterAdvance, currency)} due by July 20.`}
      />
      <YearlyOverview
        currency={currency}
        totalIncome={totalIncome}
        taxableIncome={taxableIncome}
        stateTax={stateTax}
        regionalTax={regionalTax}
        tax={tax}
        ssAnnual={ssAnnual}
        ssMonthly={ssMonthly}
        effectiveRate={rate}
        takeHomeAnnual={net}
        takeHomeMonthly={takeHomeMonthly}
      />
      <AdvancedInsights
        currency={currency}
        filings={filings}
        breakdown={breakdown}
        data={data}
        tax={tax}
        ssAnnual={ssAnnual}
        advancePaid={advancePaid}
        finalBalance={finalBalance}
        nextBracketMsg={nextBracketMsg}
        ssNextMsg={ssNextMsg}
        totalIncome={totalIncome}
      />
    </div>
  )
}
