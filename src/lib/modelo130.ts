import { getQuarter } from 'date-fns'
import type { Invoice } from '@/types/invoice'
import { calculateGeneralExpenses } from './deductions'
import { calculateSocialSecurityQuota } from './socialSecurity'

export interface QuarterlyData {
  quarter: number
  income: number
  deductions: number
  netIncome: number
}

export interface Modelo130Quarter {
  quarter: number
  income: number
  deductions: number
  netIncome: number
  estimatedIrpf: number
  amountDue: number
}

/**
 * Aggregates paid invoices by quarter and applies deductions.
 * General expenses are capped at 5% of annual income (max €2,000)
 * and spread cumulatively across quarters. Social Security is
 * estimated using the annual quota and divided equally per quarter.
 */
export function aggregateQuarterlyData(
  invoices: Invoice[],
  currency: 'USD' | 'EUR',
): QuarterlyData[] {
  const incomePerQuarter = [0, 0, 0, 0]
  for (const inv of invoices) {
    if (inv.status !== 'PAID') continue
    const q = getQuarter(new Date(inv.issueDate)) - 1
    const amount = currency === 'USD' ? Number(inv.amountUSD) : Number(inv.amountEUR)
    incomePerQuarter[q] += amount
  }

  const totalIncome = incomePerQuarter.reduce((a, b) => a + b, 0)
  const totalGeneral = calculateGeneralExpenses(totalIncome)
  const ss = calculateSocialSecurityQuota(totalIncome - totalGeneral)
  const ssQuarter = ss.monthly * 3

  let usedGeneral = 0
  const results: QuarterlyData[] = []
  let cumulativeIncome = 0

  for (let i = 0; i < 4; i++) {
    const income = incomePerQuarter[i]
    cumulativeIncome += income
    const allowed = Math.min(cumulativeIncome * 0.05, 2000)
    const general = allowed - usedGeneral
    usedGeneral += general
    const deductions = general + ssQuarter
    const netIncome = income - deductions
    results.push({
      quarter: i + 1,
      income,
      deductions,
      netIncome,
    })
  }

  return results
}

/**
 * Calculates Modelo 130 obligations for each quarter based on
 * cumulative net income and any advances already paid.
 */
export function calculateModelo130(
  quarters: QuarterlyData[],
  totalAdvancesPaid = 0,
): Modelo130Quarter[] {
  let cumulativeNet = 0
  let paid = totalAdvancesPaid
  return quarters.map((q) => {
    cumulativeNet += q.netIncome
    const cumulativeIrpf = cumulativeNet * 0.2
    const amountDue = Math.max(cumulativeIrpf - paid, 0)
    paid += amountDue
    return {
      quarter: q.quarter,
      income: q.income,
      deductions: q.deductions,
      netIncome: q.netIncome,
      estimatedIrpf: q.netIncome * 0.2,
      amountDue,
    }
  })
}
