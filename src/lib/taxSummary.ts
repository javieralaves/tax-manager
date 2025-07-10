export interface TakeHomeSummary {
  totalTax: number
  monthlyTax: number
  effectiveRate: number
  takeHomeAnnual: number
  takeHomeMonthly: number
}

/**
 * Calculates overall tax burden and take-home income.
 * netRevenue should be the total revenue for the year in the
 * selected currency. totalIrpf and totalSs should be in the same currency.
 */
export function calculateTakeHome(
  netRevenue: number,
  totalIrpf: number,
  totalSs: number,
): TakeHomeSummary {
  const totalTax = totalIrpf + totalSs
  const takeHomeAnnual = netRevenue - totalTax
  return {
    totalTax,
    monthlyTax: totalTax / 12,
    effectiveRate: netRevenue ? totalTax / netRevenue : 0,
    takeHomeAnnual,
    takeHomeMonthly: takeHomeAnnual / 12,
  }
}

/**
 * Returns data useful for a pie or donut chart showing the
 * share of income going to IRPF, Social Security and what remains.
 */
export function getTaxBreakdown(
  netRevenue: number,
  totalIrpf: number,
  totalSs: number,
): { name: string; value: number }[] {
  const takeHome = netRevenue - totalIrpf - totalSs
  return [
    { name: 'Take-home', value: takeHome },
    { name: 'IRPF', value: totalIrpf },
    { name: 'Social Security', value: totalSs },
  ]
}
