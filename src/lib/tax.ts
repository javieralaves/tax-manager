export const IRPF_BRACKETS = [
  { limit: 12450, rate: 0.19 },
  { limit: 20200, rate: 0.24 },
  { limit: 35200, rate: 0.3 },
  { limit: 60000, rate: 0.37 },
  { limit: 300000, rate: 0.45 },
  { limit: Infinity, rate: 0.47 },
] as const

// Madrid specific regional IRPF brackets (approximate 2024/25 values)
export const MADRID_IRPF_BRACKETS = [
  { limit: 12450, rate: 0.085 },
  { limit: 17707, rate: 0.095 },
  { limit: 33407, rate: 0.12 },
  { limit: 53407, rate: 0.185 },
  { limit: 240000, rate: 0.215 },
  { limit: Infinity, rate: 0.235 },
] as const

export type IrpfBreakdownEntry = {
  from: number
  to: number
  rate: number
  taxable: number
  tax: number
}

export interface IrpfCalculation {
  total: number
  breakdown: IrpfBreakdownEntry[]
}

/** Generic calculator used by both state and regional functions. */
function calculateWithBrackets(
  income: number,
  brackets: readonly { limit: number; rate: number }[],
): IrpfCalculation {
  const breakdown: IrpfBreakdownEntry[] = []
  let tax = 0
  let previous = 0

  for (const { limit, rate } of brackets) {
    if (income <= previous) break
    const taxable = Math.min(income, limit) - previous
    const amount = taxable * rate
    tax += amount
    breakdown.push({ from: previous, to: limit, rate, taxable, tax: amount })
    previous = limit
  }

  return { total: tax, breakdown }
}

/** Calculates the state portion of IRPF using national brackets. */
export function calculateStateIrpf(income: number): IrpfCalculation {
  return calculateWithBrackets(income, IRPF_BRACKETS)
}

/** Calculates Madrid's regional IRPF. Default region for now. */
export function calculateRegionalIrpfMadrid(income: number): IrpfCalculation {
  return calculateWithBrackets(income, MADRID_IRPF_BRACKETS)
}

/** Returns the regional calculator for the provided region. */
export function getRegionalIrpfCalculator(
  region: string,
): (income: number) => IrpfCalculation {
  switch (region.toLowerCase()) {
    case 'madrid':
    default:
      return calculateRegionalIrpfMadrid
  }
}

/**
 * Returns detailed IRPF amounts per bracket for the given income.
 * Defaults to the national brackets but can accept any set.
 */
export function calculateIrpfBreakdown(
  income: number,
  brackets: readonly { limit: number; rate: number }[] = IRPF_BRACKETS,
): IrpfBreakdownEntry[] {
  return calculateWithBrackets(income, brackets).breakdown
}
