export const IRPF_BRACKETS = [
  { limit: 12450, rate: 0.19 },
  { limit: 20200, rate: 0.24 },
  { limit: 35200, rate: 0.30 },
  { limit: 60000, rate: 0.37 },
  { limit: 300000, rate: 0.45 },
  { limit: Infinity, rate: 0.47 },
] as const

/** Calculates Spanish IRPF tax for a given income using 2024 brackets. */
export function calculateIrpf(income: number): number {
  const brackets = IRPF_BRACKETS

  let tax = 0
  let previous = 0

  for (const { limit, rate } of brackets) {
    if (income <= previous) break
    const taxable = Math.min(income, limit) - previous
    tax += taxable * rate
    previous = limit
  }
  return tax
}

export type IrpfBreakdownEntry = {
  from: number
  to: number
  rate: number
  taxable: number
  tax: number
}

/**
 * Returns detailed IRPF amounts per bracket for the given income.
 * Useful for displaying how much income is taxed at each rate.
 */
export function calculateIrpfBreakdown(income: number): IrpfBreakdownEntry[] {
  const breakdown: IrpfBreakdownEntry[] = []
  let previous = 0
  for (const { limit, rate } of IRPF_BRACKETS) {
    if (income <= previous) break
    const taxable = Math.min(income, limit) - previous
    breakdown.push({
      from: previous,
      to: limit,
      rate,
      taxable,
      tax: taxable * rate,
    })
    previous = limit
  }
  return breakdown
}
